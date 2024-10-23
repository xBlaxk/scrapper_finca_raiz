# Scraper de Propiedades - FincaRaíz

Este script es un **scraper** desarrollado en Node.js que extrae información de propiedades del sitio web [FincaRaíz](https://www.fincaraiz.com.co), un popular portal en Colombia para la búsqueda de inmuebles. El script utiliza **Selenium** para interactuar con el sitio web y extrae información como el título, precio, ubicación, área, número de habitaciones, baños y genera un archivo CSV con los datos recopilados, incluyendo el **precio por metro cuadrado (m²)**.

## Requisitos

- **Node.js** (v14 o superior)
- **Chrome WebDriver** instalado y accesible en tu PATH.

### Instalación de dependencias

1. **Clona este repositorio o descarga el código.**
2. Ejecuta el siguiente comando para instalar las dependencias necesarias:

```bash
npm install
```

Este comando instalará todas las dependencias especificadas en el archivo `package.json`, incluidas las relacionadas con **Selenium WebDriver**.

### Ejecución del Script

Para ejecutar el scraper, debes proporcionar un **input** en formato JSON que especifique los parámetros de la búsqueda, como la opción de tipo de operación (arriendo o venta), la ciudad, el número máximo de páginas a scrapear, y el tipo de propiedad.

Ejemplo de ejecución:

```bash
node scrape.js '{"option": "rent", "city": "el-dorado/envigado", "maxPages": 10, "propertyTypes": ["apartamentos"]}'
```

### Parámetros de Entrada

- **`option`**: **Obligatorio**. Define si estás buscando inmuebles en "arriendo" (`rent`) o "venta" (`sale`).
- **`city`**: **Opcional**. La ciudad o sector que deseas scrapear. Ejemplos:
  - `"bogota"`
  - `"medellin"`
  - `"el-dorado/envigado"`
- **`maxPages`**: **Opcional**. Número máximo de páginas que deseas scrapear. El valor predeterminado es `100`.
- **`propertyTypes`**: **Opcional**. Lista de tipos de propiedades que deseas scrapear. Ejemplos:
  - `["apartamentos"]`
  - `["casas", "apartamentos"]`

#### Cómo obtener los valores correctos para `city` y `propertyTypes` utilizando los filtros de la página web

Si deseas obtener los nombres exactos para el campo `city` o `propertyTypes`, puedes hacerlo jugando con los filtros directamente en el sitio web de FincaRaíz. Aquí te explicamos cómo:

1. **Abre el sitio web de FincaRaíz** y ajusta los filtros según los inmuebles que deseas buscar.
   
2. **Selecciona la ubicación** y otros filtros como el tipo de propiedad, precio, entre otros.

3. **Observa la URL** en la barra de direcciones del navegador. La URL refleja los filtros que has seleccionado, y es donde puedes encontrar los valores exactos para `city` y `propertyTypes`.

4. **Identifica los valores de `city` y `propertyTypes`**. Al observar la URL, puedes encontrar fácilmente los nombres que necesitas utilizar en tu input JSON.

   Por ejemplo:
   - **URL generada**: 

     ```
     https://www.fincaraiz.com.co/venta/apartamentos-y-casas-campestres/envigado?&ordenListado=3
     ```

   - Aquí, puedes observar que:
     - `envigado` es el valor que debes usar para el campo `city`.
     - `apartamentos-y-casas-campestres` indica los tipos de propiedad, lo que corresponde a los valores `["apartamentos", "casas-campestres"]`.

#### Ejemplo completo de cómo construir el JSON

A partir de la URL generada, tu `city` y `propertyTypes` en el input JSON serían los siguientes:

```json
{
  "option": "sale",
  "city": "envigado",
  "maxPages": 10,
  "propertyTypes": ["apartamentos", "casas-campestres"]
}
```

De esta manera, puedes ajustar tanto la ciudad como los tipos de propiedad que deseas scrapear utilizando los filtros de la página web y observando cómo se reflejan en la URL.

### Ejemplo de URL de Filtros:

- **URL**: `https://www.fincaraiz.com.co/venta/apartamentos-y-casas-campestres/envigado?&ordenListado=3`
- **city**: `"envigado"`
- **propertyTypes**: `["apartamentos", "casas-campestres"]`

### Resumen:

Jugando con los filtros de la página de FincaRaíz y observando cómo se estructura la URL, puedes obtener los valores exactos tanto para `city` como para `propertyTypes`. Esto asegura que los parámetros que pasas al script sean precisos y coincidan con los disponibles en FincaRaíz, permitiendo un scraping eficiente y específico.

### Ejemplo de Input JSON

```json
{
  "option": "rent",
  "city": "el-dorado/envigado",
  "maxPages": 10,
  "propertyTypes": ["apartamentos"]
}
```

### Funcionamiento

El script navega por las páginas de resultados en FincaRaíz y extrae la siguiente información de cada propiedad:

- **Título**: El título de la propiedad.
- **Precio**: El precio de la propiedad.
- **Ubicación**: La ciudad o sector de la propiedad.
- **Área**: El área de la propiedad en metros cuadrados (m²).
- **Habitaciones**: El número de habitaciones.
- **Baños**: El número de baños.
- **Precio por m²**: El precio dividido por el área.
- **URL**: El enlace directo a la página de la propiedad.

El resultado se guarda en un archivo **properties.csv** en el directorio donde se ejecuta el script.

### Archivo CSV

El archivo generado **properties.csv** tendrá el siguiente formato:

| Title                | Price      | Location   | Area (m²) | Rooms | Bathrooms | Price per m² | URL                                        |
|----------------------|------------|------------|-----------|-------|-----------|--------------|--------------------------------------------|
| Casa en Arriendo      | 175000000  | Envigado   | 310       | 3     | 3         | 5645.16      | https://fincaraiz.com.co/inmueble/123456   |
| Apartamento en Venta  | 108000000  | Medellín   | 160       | 2     | 2         | 6750.00      | https://fincaraiz.com.co/inmueble/654321   |

### Manejo de Modales

En algunas ocasiones, FincaRaíz puede mostrar un modal emergente en el primer acceso. El script incluye una función que cierra automáticamente el modal presionando la tecla **Escape**, asegurando que el scraping no se vea interrumpido.

### Consideraciones

- El scraping está limitado por la estructura de la página de FincaRaíz. Si el sitio cambia su diseño o estructura, es posible que necesites actualizar los selectores utilizados en el script.
- Para evitar sobrecargar el servidor, se recomienda establecer un límite razonable de páginas a scrapear (`maxPages`).

### Errores Comunes

- **Element not interactable**: Si el modal bloquea el acceso a los elementos, asegúrate de que la función `handleModal` esté correctamente configurada para tu entorno.
- **Timeouts**: Si el sitio tarda mucho en cargar, puedes ajustar los tiempos de espera (`timeouts`) en la función `driver.wait()`.

### Autor

Este script fue creado por [xBlaxk](https://github.com/xBlaxk). Si tienes preguntas o sugerencias, no dudes en ponerte en contacto.
