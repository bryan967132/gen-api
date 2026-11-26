/**
 * Elemento localizable mediante XPath. Solo `xpath` es obligatorio.
 * @typedef {Object} PageElement
 * @property {string} xpath - Expresión XPath que localiza el elemento en el DOM.
 * @property {string} [text] - Texto visible esperado del elemento.
 * @property {string} [placeholder] - Valor del atributo `placeholder`.
 * @property {string} [expectedValue] - Valor esperado tras la interacción.
 * @property {string} [description] - Descripción funcional del elemento.
 */

/**
 * Selectores XPath y datos esperados de la interfaz de GenAPI.
 *
 * @satisfies {Record<string, PageElement>}
 */

export const genAPI = {
    textGenApi: {
        text: 'GenAPI',
        xpath: '//h2[text()="GenAPI"]',
    },
    textGeneraApi: {
        text: 'Genera tu API visualmente',
        xpath: '//p[text()="Genera tu API visualmente"]',
    },
    textConfiguracion: {
        text: 'Configuración de la API',
        xpath: '//h3[text()="Configuración de la API"]',
    },
    textNombre: {
        text: 'Nombre',
        xpath: '//label[text()="Nombre"]',
    },
    inputNombre: {
        placeholder: 'Mi API',
        expectedValue: 'Mi API',
        xpath: '//input[@placeholder="Mi API"]',
    },
    textPuerto: {
        text: 'Puerto',
        xpath: '//label[text()="Puerto"]',
    },
    inputPuerto: {
        placeholder: '3000',
        expectedValue: '3000',
        xpath: '//input[@placeholder="3000"]',
    },
    textDescripcion: {
        text: 'Descripción',
        xpath: '//label[text()="Descripción"]',
    },
    inputDescripcion: {
        placeholder: 'Descripción de la API',
        expectedValue: 'API generada con GenAPI',
        xpath: '//textarea[@placeholder="Descripción de la API"]',
    },
    cardRuta: {
        text: 'Ruta',
        description: 'Contenedor para endpoints y subrutas',
        xpath: '//div[.//span[text()="Ruta"] and @draggable="true"]',
    },
    cardEndpoint: {
        text: 'Endpoint',
        description: 'Endpoint HTTP individual',
        xpath: '//div[.//span[text()="Endpoint"] and @draggable="true"]',
    },
    textEstadisticas: {
        text: 'Estadísticas',
        xpath: '//h3[text()="Estadísticas"]',
    },
    textRutas: {
        text: 'Rutas:',
        xpath: '//span[normalize-space()="Rutas:"]',
    },
    textValorRutas: {
        xpath: '//div[span[normalize-space()="Rutas:"]]/span[contains(@class,"font")]',
    },
    textEndpointsIndependientes: {
        text: 'Endpoints independientes:',
        xpath: '//span[normalize-space()="Endpoints independientes:"]',
    },
    textValorEndpointsIndependientes: {
        xpath: '//div[span[normalize-space()="Endpoints independientes:"]]/span[contains(@class,"font")]',
    },
    textEndpointsAnidados: {
        text: 'Endpoints anidados:',
        xpath: '//span[normalize-space()="Endpoints anidados:"]',
    },
    textValorEndpointsAnidados: {
        xpath: '//div[span[normalize-space()="Endpoints anidados:"]]/span[contains(@class,"font")]',
    },
    textTotalEndpoints: {
        text: 'Total endpoints:',
        xpath: '//span[normalize-space()="Total endpoints:"]',
    },
    textValorTotalEndpoints: {
        xpath: '//div[span[normalize-space()="Total endpoints:"]]/span[not(normalize-space()="Total endpoints:")]',
    },
    textComoUsar: {
        text: 'Cómo usar:',
        xpath: '//h3[text()="Cómo usar:"]',
    },
    listComoUsar: {
        xpath: '//div[h3[text()="Cómo usar:"]]/ul',
    },
    buttonGenerarCodigo: {
        text: 'Generar Código',
        xpath: '//button[text()="Generar Código"]',
    },
    buttonLimpiarTodo: {
        text: 'Limpiar Todo',
        xpath: '//button[text()="Limpiar Todo"]',
    },
    textNombreAPI: {
        xpath: '//h1',
    },
    textInformacionAPI: {
        xpath: '//div[h1]/p[1]',
    },
    textDescripcionAPI: {
        xpath: '//div[h1]/p[2]',
    },
    buttonAyuda: {
        text: 'Ayuda',
        xpath: '//button[text()="Ayuda"]',
    },
    textPuertoAPI: {
        xpath: '//span[contains(text(),"Servidor: localhost:")]',
    },
    areaArrastre: {
        xpath: '//div[@id="root"]/div/div[2]/div[2]',
    },
    textComienza: {
        text: '¡Comienza a construir tu API!',
        xpath: '//p[text()="¡Comienza a construir tu API!"]',
    },
    textArrastra: {
        text: 'Arrastra componentes aquí para empezar',
        xpath: '//p[text()="Arrastra componentes aquí para empezar"]',
    },
    listAreaArrastre: {
        xpath: '//div[p[text()="Arrastra componentes aquí para empezar"]]/ul',
    },
    componentRuta: (searching = '@placeholder="Nombre de la ruta"') => ({
        xpath: `//div[div/div/input[${searching}] and @draggable="true"]`,
    }),
    componentEndpoint: (searching = '@placeholder="/endpoint"') => ({
        xpath: `//div[div/div/input[${searching}] and @draggable="true"]`,
    }),
    attribsEndpoint: type => ({
        buttonColapse: './div/div/button[*[local-name()="svg"]]',
        selectMethod: './/div[input[@placeholder="/endpoint"]]/select',
        inputPath: './/input[@placeholder="/endpoint"]',
        selectType: './/div[label[text()="Tipo de Parámetros"]]/select',

        inputParam: `.//div[label[text()="${
            {
                none: 'Sin parámetros',
                route: 'Route Parameters',
                query: 'Query Parameters',
                body: 'Body Parameters',
                headers: 'Headers',
            }[type]
        }"]]//input`,

        success: {
            selectCode: './/div[label[text()="Respuesta Exitosa"]]//select',
            inputKey:
                './/div[label[text()="Respuesta Exitosa"]]//input[@placeholder="Clave (ej: message)"]',
            inputValue:
                './/div[label[text()="Respuesta Exitosa"]]//input[@placeholder="Valor (ej: Success)"]',
            buttonAdd:
                './/div[label[text()="Respuesta Exitosa"]]/div[label[text()="Agregar Campo a la Respuesta"]]//button',
        },

        error: {
            selectCode: './/div[label[text()="Respuesta de Error"]]//select',
            inputKey: './/div[label[text()="Respuesta de Error"]]//input[@placeholder="Clave"]',
            inputValue: './/div[label[text()="Respuesta de Error"]]//input[@placeholder="Valor"]',
            buttonAdd:
                './/div[label[text()="Respuesta de Error"]]/div[label[text()="Agregar Campo a la Respuesta"]]//button',
        },
    }),
    modalConfiguracion: {
        checkEnv: {
            xpath: '//label[.//h3[text()="Variables de Entorno"]]//input',
        },
        switchEnv: {
            xpath: '//label[.//h3[text()="Variables de Entorno"]]/div[input]/div',
        },
        checkBD: {
            xpath: '//label[.//h3[text()="Conector de Base de Datos"]]//input',
        },
        switchBD: {
            xpath: '//label[.//h3[text()="Conector de Base de Datos"]]/div[input]/div',
        },
        selectBD: {
            xpath: '//div[label[text()="Tipo de Base de Datos"]]/select',
        },
        buttonContinuar: {
            xpath: '//div[.//h2[text()="Configuración del Proyecto"]]/div/button[text()="Continuar"]',
        },
        buttonDescargarCodigo: {
            xpath: '//div[.//h2[text()="Código de la API: "]]/div/div/button[text()="Descargar Código"]',
        },
    },
    modalErrorValidacion: {
        labelErrores: {
            xpath: '//div[h2[text()="Errores de Validación"]]/div[@id="swal2-html-container"]//pre',
        },
        buttonEntendido: {
            xpath: '//div[h2[text()="Errores de Validación"]]//button[text()="Entendido"]',
        },
    },
};
