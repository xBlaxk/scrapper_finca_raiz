# Scraper de Propiedades - FincaRaíz

Este script es un **scraper** desarrollado en Node.js que extrae información de propiedades del sitio web [FincaRaíz](https://www.fincaraiz.com.co), un popular portal en Colombia para la búsqueda de inmuebles. El script utiliza **Selenium** para interactuar con el sitio web y extrae información como el título, precio, ubicación, área, número de habitaciones, baños y genera un archivo CSV con los datos recopilados, incluyendo el **precio por metro cuadrado (m²)**.

## Requisitos

- **Node.js** (v14 o superior)
- **Chrome WebDriver** instalado y accesible en tu PATH.

## Instalación Paso a Paso

### 1. Instalar Node.js

**Node.js** es un entorno que permite ejecutar JavaScript fuera del navegador, y es necesario para ejecutar este proyecto.

#### Instrucciones:

- **Windows / MacOS / Linux**:
   1. Ve a la página oficial de Node.js: [https://nodejs.org/](https://nodejs.org/)
   2. Descarga la versión recomendada para tu sistema operativo (la que dice "LTS" es la más estable).
   3. Sigue las instrucciones de instalación que aparecerán según tu sistema operativo.

   Una vez que Node.js esté instalado, puedes verificar que la instalación fue exitosa abriendo una **terminal** o **línea de comandos** y escribiendo:

   ```bash
   node --version
   ```

   Deberías ver un número que indica la versión de Node.js instalada (por ejemplo: `v14.17.0`).

### 2. Descargar el Proyecto

1. **Descargar el código**:
   - Si el proyecto está en un repositorio (como GitHub), puedes descargarlo de varias maneras:
     - **Opción 1: Descargar el código como un archivo ZIP**:
       - Ve al repositorio y haz clic en el botón "Code" y luego en "Download ZIP".
       - Extrae el archivo ZIP en una carpeta de tu computadora.

     - **Opción 2: Usar Git** (solo si estás familiarizado con Git):
       - Abre la terminal o línea de comandos y escribe:
         ```bash
         git clone https://github.com/tu-repositorio/scraper-fincaraiz.git
         ```
       - Este comando descargará el proyecto en tu computadora.

2. **Acceder a la carpeta del proyecto**:
   - Una vez descargado, abre la carpeta donde se encuentra el proyecto. Si estás en una terminal, navega a esa carpeta usando el comando `cd`:
   
     ```bash
     cd carpeta-donde-esta-tu-proyecto
     ```

### 3. Instalar las Dependencias del Proyecto

Este proyecto necesita algunas "dependencias" o librerías adicionales para funcionar correctamente. En este caso, esas dependencias se encuentran listadas en un archivo llamado `package.json`. Vamos a instalar estas dependencias usando un comando muy sencillo.

#### Instrucciones:

1. Abre una **terminal** o **línea de comandos**.
2. Asegúrate de estar en la carpeta donde descargaste el proyecto.
3. Ejecuta el siguiente comando:

   ```bash
   npm install
   ```

   Este comando instalará automáticamente todas las librerías necesarias para que el scraper funcione. Puede tomar un par de minutos, dependiendo de tu conexión a internet.

### 4. Configurar el Navegador para el Scraping

Este proyecto utiliza **Selenium**, una herramienta que controla el navegador para realizar el scraping. Por defecto, usa el navegador **Google Chrome**.

#### Instrucciones:

1. **Instalar Chrome WebDriver**:
   - **Chrome WebDriver** es un controlador que permite a Selenium automatizar Chrome. Debes descargarlo e instalarlo siguiendo estos pasos:
     1. Ve a la página de descarga de ChromeDriver: [https://sites.google.com/chromium.org/driver/](https://sites.google.com/chromium.org/driver/)
     2. Descarga la versión que corresponda a tu versión de Chrome. Para saber qué versión de Chrome tienes, abre Chrome y escribe `chrome://settings/help` en la barra de direcciones.
     3. Una vez descargado, descomprime el archivo y mueve el archivo ejecutable a una ubicación accesible, como el **escritorio** o una carpeta específica.
     4. **Añade el archivo ejecutable a tu PATH** (esto permitirá que Selenium lo encuentre automáticamente):
        - **Windows**: Sigue esta [guía de Microsoft](https://www.java.com/en/download/help/path.html) para agregar ChromeDriver a tu PATH.
        - **MacOS / Linux**: Mueve el ejecutable a `/usr/local/bin` usando el siguiente comando en la terminal:
          
          ```bash
          sudo mv /ruta-donde-se-descargó/chromedriver /usr/local/bin
          ```cución del Script

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



