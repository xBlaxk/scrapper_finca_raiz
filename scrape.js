// Importación de módulos utilizando la sintaxis de ECMAScript Modules
import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import { writeFileSync } from 'fs';

// Función asíncrona para realizar el scraping
async function scrapeInmuebles() {
    let options = new chrome.Options();

    // Crear el controlador para Chrome
    let driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

    try {
        // Navegar a la página web
        await driver.get('https://www.fincaraiz.com.co/inmuebles/venta/vivienda/');

        // Esperar a que las tarjetas de los inmuebles estén disponibles
        await driver.wait(until.elementsLocated(By.className('listingCard')), 10000);

        // Obtener todas las tarjetas de inmuebles
        let inmuebles = [];
        let cards = await driver.findElements(By.className('listingCard'));

        // Iterar sobre cada tarjeta y extraer información
        for (let card of cards) {
            try {
                let precio = await card.findElement(By.className('price')).getText();
                let habitaciones = await card.findElement(By.css('strong:nth-child(1)')).getText();
                let banos = await card.findElement(By.css('strong:nth-child(2)')).getText();
                let metrosCuadrados = await card.findElement(By.css('strong:nth-child(3)')).getText();
                let ubicacion = await card.findElement(By.className('lc-location')).getText();

                // Guardar el inmueble en el arreglo
                inmuebles.push({
                    precio: precio,
                    habitaciones: habitaciones,
                    banos: banos,
                    metrosCuadrados: metrosCuadrados,
                    ubicacion: ubicacion
                });
            } catch (error) {
                console.error('Error al extraer los datos de un inmueble:', error);
            }
        }

        // Guardar los datos en un archivo JSON
        writeFileSync('inmuebles.json', JSON.stringify(inmuebles, null, 2), 'utf-8');
        console.log('Datos guardados en inmuebles.json');

    } finally {
        // Cerrar el navegador
        await driver.quit();
    }
}

// Ejecutar la función de scraping
scrapeInmuebles();
