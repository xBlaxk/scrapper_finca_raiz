import { Builder, By, until } from 'selenium-webdriver'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const shared = {
  DEFAULT_MAX_PAGES: 100,
  BASE_URL: 'https://www.fincaraiz.com.co',
}

// Define __dirname using fileURLToPath and import.meta.url
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const data = validate(load(JSON.parse(process.argv[2])))

async function task(data) {
  let driver = await new Builder().forBrowser('chrome').build()
  let scrapedData = []
  let currentPage = 1

  try {
    const url = buildUrl(data)
    console.log(url)

    await driver.get(url)
    await handleModal(driver)

    let keepScraping = true
    while (keepScraping && currentPage <= data.maxPages) {
      console.log(`Scraping page ${currentPage} of ${data.maxPages}`)

      // Wait for the property cards to load
      await driver.wait(
        until.elementLocated(By.className('listingCard')),
        20000
      )

      // Extract all property elements on the current page
      let properties = await driver.findElements(By.className('listingCard'))

      for (let property of properties) {
        try {
          // Extract basic information from the property card
          let title = await property.findElement(By.css('.lc-title')).getText()
          let priceText = await property
            .findElement(By.css('.price strong'))
            .getText()
          let price = extractPrice(priceText) // Extract only the numerical value from price
          let location = await property
            .findElement(By.css('.lc-location'))
            .getText()

          // Extract and parse rooms, bathrooms, and area
          let detailsText = await property
            .findElement(By.css('.lc-typologyTag'))
            .getText()
          let { rooms, bathrooms, area } = parseDetails(detailsText)

          // Extract URL of the property
          let propertyUrl = await property.findElement(By.css('a')).getAttribute('href');

          let pricePerM2 = calculatePricePerM2(price, area) // New calculation

          // Create the property object
          const propertyData = {
            title: title,
            price: price,
            location: location,
            area: area,
            rooms: rooms,
            bathrooms: bathrooms,
            pricePerM2: pricePerM2,
            url: propertyUrl
          }

          // Add the extracted information to the data array
          scrapedData.push(propertyData)
        } catch (error) {
          console.log('Error extracting property information:', error)
        }
      }

      // Check if there is a next page and navigate to it
      keepScraping = await goToNextPage(driver)
      currentPage++
    }

    // Write the scraped data to the CSV file with UTF-8 encoding and BOM

    writeCsvFile(scrapedData)
  } finally {
    // Close the browser
    await driver.quit()
  }
}

async function goToNextPage(driver) {
  try {
    // Look for the pagination element (Next button)
    const nextPageButton = await driver.findElement(
      By.xpath("//a[contains(text(), '>')]")
    )

    // Get current page URL
    const currentUrl = await driver.getCurrentUrl()

    // Click the Next button
    await nextPageButton.click()

    // Wait for a new page by checking if the URL changes or new property cards load
    await driver.wait(async () => {
      const newUrl = await driver.getCurrentUrl()
      return newUrl !== currentUrl
    }, 20000) // Increased timeout to 20 seconds

    // Wait for new property cards to appear (this ensures we don't scrape the same page)
    await driver.wait(until.elementLocated(By.className('listingCard')), 20000)
    return true
  } catch (error) {
    if (error.name === 'NoSuchElementError') {
      console.log('No next page found')
    } else {
      console.log('Failed to navigate:', error)
    }
    return false // No next page or failed to navigate
  }
}

function extractPrice(priceText) {
  return priceText.replace(/[^0-9]/g, '') // Remove everything that's not a number
}

function parseDetails(detailsText) {
  let rooms = 'N/A'
  let bathrooms = 'N/A'
  let area = 'N/A'

  // Extract rooms (Habs.), bathrooms (Baños), and area (m²)
  const roomMatch = detailsText.match(/(\d+)\s*Habs/)
  const bathroomMatch = detailsText.match(/(\d+)\s*Baños?/)
  const areaMatch = detailsText.match(/(\d+\.?\d*)\s*m²/)

  if (roomMatch) {
    rooms = roomMatch[1]
  }
  if (bathroomMatch) {
    bathrooms = bathroomMatch[1]
  }
  if (areaMatch) {
    area = areaMatch[1]
  }

  return { rooms, bathrooms, area }
}

function buildUrl(buildUrlInput) {
  const { option, city, propertyTypes } = buildUrlInput
  const propertyTypesProcessed = propertyTypes.join('-y-')
  let traslatedOption
  if (option === 'rent') {
    traslatedOption = 'arriendo'
  } else if (option === 'sale') {
    traslatedOption = 'venta'
  }

  let concatedUrl = `${shared.BASE_URL}/${traslatedOption}`

  if (propertyTypesProcessed.length > 0) {
    concatedUrl += `/${propertyTypesProcessed}`
  } else {
    concatedUrl += `/inmuebles`
  }
  if (!!city) {
    concatedUrl += `/${city}`
  }
  concatedUrl += `?ordenListado=3`

  return concatedUrl
}

// Add logic to calculate price per square meter
function calculatePricePerM2(price, area) {
    if (!area || area <= 0) return 'N/A';  // Avoid division by zero or invalid area
    return (price / area).toFixed(2);  // Return the price per m² rounded to two decimal places
  }

async function handleModal(driver) {
  try {
    // Check if the modal is present
    let modals = await driver.findElements(
      By.id('hs-web-interactives-top-anchor')
    ) // Adjust the selector as needed

    if (modals.length > 0) {
      console.log('Modal detected, sending Escape key via JavaScript')

      // Use JavaScript to send an 'Escape' key event
      await driver.executeScript(`
          var event = new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, code: 'Escape', bubbles: true });
          document.dispatchEvent(event);
        `)

      // Wait a moment to ensure the modal closes properly
      await driver.sleep(1000)
    } else {
      console.log('No modal detected, proceeding with scraping')
    }
  } catch (error) {
    console.log('Error while handling modal:', error)
  }
}

// Function to escape fields with commas
function escapeCsvField(value) {
  if (typeof value === 'string' && value.includes(',')) {
    return `"${value}"` // Enclose in double quotes if there is a comma
  }
  return value // Return the value as-is if no comma
}

// CSV writing function with BOM (UTF-8 support)
function writeCsvFile(data) {
  const filePath = path.join(__dirname, 'properties.csv')
  const bom = '\uFEFF' // Add BOM (Byte Order Mark) for UTF-8
  const header = 'Title,Price,Location,Area (m²),Rooms,Bathrooms,PricePerM2,URL\n' // Create the CSV header

  // Generate CSV rows from data
  const rows = data.map(item => 
    `${escapeCsvField(item.title)},${item.price},${escapeCsvField(item.location)},${item.area},${item.rooms},${item.bathrooms},${item.pricePerM2},${escapeCsvField(item.url)}`
  ).join('\n');

  // Combine BOM, header, and rows
  const csvContent = bom + header + rows

  // Write the CSV content to a file
  fs.writeFileSync(filePath, csvContent, { encoding: 'utf8' })

  console.log('Data saved to properties.csv')
}

function load(input) {
  let config = {}
  config.option = input.option
  config.city = input.city || ''
  config.propertyTypes = input.propertyTypes || []
  config.maxPages = input.maxPages || shared.DEFAULT_MAX_PAGES

  return config
}

function validate(config) {
  ;[['option', "type of scraping 'rent' or 'sale'"]].forEach(
    ([name, message]) => {
      if (!config[name]) {
        throw new Error(`MissingInput: ${name}: ${message}`)
      }
    }
  )

  return config
}

// Start the scraping process
task(data)
