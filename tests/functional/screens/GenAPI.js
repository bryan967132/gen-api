import {
    validateLabel,
    validateCard,
    validateInputText,
    validateTextArea,
    validateButton,
    validateList,
    validateDragAndDrop,
    fillRouteCard,
    fillEndpointCard,
} from '../../tools/validations.js';
import { reportInfoSS, reportPassSS } from '../../tools/reportLogger.js';

/** @typedef {import('@playwright/test').Page} Page */
/** @typedef {import('@playwright/test').TestInfo} TestInfo */
/** @typedef {import('../screens/Elements.js').PageElement} PageElement */

export default class GenAPI {
    /** @type {Page} */
    #page;

    /** @type {TestInfo} */
    #testInfo;

    /**
     * @param {Page} page - Página de Playwright sobre la que se ejecutan las validaciones.
     * @param {TestInfo} testInfo - Información de la prueba en ejecución.
     */
    constructor(page, testInfo) {
        this.#page = page;
        this.#testInfo = testInfo;
    }

    /**
     * Valida una etiqueta de texto.
     * @param {string} elementName - Nombre descriptivo de la validación.
     * @param {PageElement} element - Elemento a validar.
     * @returns {Promise<void>}
     */
    label = (elementName, element) =>
        validateLabel(this.#page, this.#testInfo, elementName, element);

    /**
     * Valida una tarjeta arrastrable.
     * @param {string} elementName - Nombre descriptivo de la validación.
     * @param {PageElement} element - Elemento a validar.
     * @returns {Promise<void>}
     */
    card = (elementName, element) => validateCard(this.#page, this.#testInfo, elementName, element);

    /**
     * Valida un campo de texto y lo rellena.
     * @param {string} elementName - Nombre descriptivo de la validación.
     * @param {PageElement} element - Elemento a validar.
     * @param {string} fillValue - Valor con el que se rellena el campo.
     * @returns {Promise<void>}
     */
    inputText = (elementName, element, fillValue) =>
        validateInputText(this.#page, this.#testInfo, elementName, { ...element, fillValue });

    /**
     * Valida un área de texto y la rellena.
     * @param {string} elementName - Nombre descriptivo de la validación.
     * @param {PageElement} element - Elemento a validar.
     * @param {string} fillValue - Valor con el que se rellena el área de texto.
     * @returns {Promise<void>}
     */
    textArea = (elementName, element, fillValue) =>
        validateTextArea(this.#page, this.#testInfo, elementName, { ...element, fillValue });

    /**
     * Valida un botón y, opcionalmente, hace clic en él.
     * @param {string} elementName - Nombre descriptivo de la validación.
     * @param {PageElement} element - Elemento a validar.
     * @param {boolean} [isClicked] - Indica si se debe hacer clic en el botón.
     * @returns {Promise<void>}
     */
    button = (elementName, element, isClicked) =>
        validateButton(this.#page, this.#testInfo, elementName, { ...element, isClicked });

    /**
     * Valida una lista de elementos.
     * @param {string} elementName - Nombre descriptivo de la validación.
     * @param {PageElement} element - Elemento a validar.
     * @returns {Promise<void>}
     */
    list = (elementName, element) => validateList(this.#page, this.#testInfo, elementName, element);

    /**
     * Valida una operación de arrastrar y soltar.
     * @param {string} elementName - Nombre descriptivo de la validación.
     * @param {PageElement} source - Elemento de origen que se arrastra.
     * @param {PageElement} target - Elemento de destino donde se suelta.
     * @param {PageElement} expected - Elemento esperado tras la operación.
     * @returns {Promise<void>}
     */
    dragAndDrop = (elementName, source, target, expected) =>
        validateDragAndDrop(this.#page, this.#testInfo, elementName, { source, target, expected });

    /**
     * Valida una operación de arrastrar y soltar.
     * @param {string} elementName - Nombre descriptivo de la validación.
     * @param {PageElement} element - Elemento de origen que se arrastra.
     * @param {Object} data - Datos de la ruta.
     * @param {string} data.name - Nombre de la ruta.
     * @param {string} data.path - Path de la ruta.
     * @returns {Promise<void>}
     */
    fillRouteCard = (elementName, element, { name, path }) =>
        fillRouteCard(this.#page, this.#testInfo, elementName, element, { name, path });

    /**
     * Valida una operación de arrastrar y soltar.
     * @param {string} elementName - Nombre descriptivo de la validación.
     * @param {PageElement} element - Elemento de origen que se arrastra.
     * @param {Object} data - Datos del endpoint.
     * @param {string} data.method - Metodo del endpoint.
     * @param {string} data.path - Path del endpoint.
     * @param {string} data.parameterType - Tipo de parametros del endpoint.
     * @param {string} data.params - Parametros del endpoint.
     * @param {string} data.successResponse - Respuesta exitosa del endpoint.
     * @param {string} data.errorResponse - Respuesta de error del endpoint.
     * @returns {Promise<void>}
     */
    fillEndpointCard = (
        elementName,
        element,
        { method, path, parameterType, params, successResponse, errorResponse }
    ) =>
        fillEndpointCard(this.#page, this.#testInfo, elementName, element, {
            method,
            path,
            parameterType,
            params,
            successResponse,
            errorResponse,
        });

    /**
     * Registra un mensaje informativo con captura de pantalla.
     * @param {string} title - Título del reporte.
     * @param {string} description - Descripción del reporte.
     * @returns {Promise<void>}
     */
    reportInfoSS = (title, description) =>
        reportInfoSS(this.#page, this.#testInfo, title, description);

    /**
     * Registra un paso exitoso con captura de pantalla.
     * @param {string} title - Título del reporte.
     * @param {string} description - Descripción del reporte.
     * @returns {Promise<void>}
     */
    reportPassSS = (title, description) =>
        reportPassSS(this.#page, this.#testInfo, title, description);
}
