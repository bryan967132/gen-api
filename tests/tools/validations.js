import { escapeHTML } from '../utils/format.js';
import { expect } from '../tools/driver.js';
import { validateComponent } from '../reporters/validateComponent.js';

/** @typedef {import('@playwright/test').Locator} Locator */
/** @typedef {import('@playwright/test').Page} Page */
/** @typedef {import('@playwright/test').TestInfo} TestInfo */
/** @typedef {import('../functional/screens/Elements.js').PageElement} PageElement */

/**
 * Verifica si un elemento es visible dentro del tiempo establecido.
 *
 * @param {Locator} element - Localizador del elemento.
 * @param {number} [timeout=3000] - Tiempo máximo de espera en milisegundos.
 * @returns {Promise<boolean>} Indica si el elemento es visible.
 */
export const isVisible = async (element, timeout = 3000) => {
    try {
        await element.waitFor({
            state: 'visible',
            timeout,
        });

        return true;
    } catch {
        return false;
    }
};

/**
 * Verifica si un elemento es visible dentro del tiempo establecido.
 *
 * @param {Page} page Página de Playwright.
 * @param {PageElement} element - Localizador del elemento.
 * @param {string} [element.xpath] XPath del componente.
 * @param {number} [timeout=3000] - Tiempo máximo de espera en milisegundos.
 * @returns {Promise<boolean>} Indica si el elemento es visible.
 */
export const isVisibleLocator = async (page, { xpath }, timeout = 3000) => {
    try {
        const locator = page.locator(xpath);
        await locator.waitFor({
            state: 'visible',
            timeout,
        });

        return true;
    } catch {
        return false;
    }
};

/**
 * Ejecuta una validación y devuelve su resultado para el reporte.
 *
 * @param {Function} assertion Aserción que debe cumplirse.
 * @param {string} success Descripción si la validación es correcta.
 * @param {Function} failure Obtiene la descripción si falla.
 * @param {'failed'|'warning'} [severity='failed'] Estado cuando falla.
 * @returns {Promise<{status: string, description: string, error?: string}>}
 */
async function check(assertion, success, failure, severity = 'failed') {
    const startTime = new Date().toISOString();
    const start = performance.now();

    try {
        await assertion();

        return {
            status: 'passed',
            description: success,
            startTime,
            duration: Math.round(performance.now() - start),
        };
    } catch (error) {
        console.log(error);

        const duration = Math.round(performance.now() - start);
        let description;

        try {
            description = await failure();
        } catch (e) {
            description = 'No se pudo obtener el estado del componente\n' + e.message;
            console.log(e);
        }

        return {
            status: severity,
            description,
            error: error.message,
            startTime,
            duration,
        };
    }
}

/**
 * Valida la visibilidad de un componente.
 *
 * @param {Locator} element
 * @param {string} [name='Componente']
 */
const checkVisible = (element, name = 'Componente') =>
    check(
        () => expect(element).toBeVisible(),
        `${name} visible`,
        () => `${name} no visible`
    );

/**
 * Valida el estado habilitado o deshabilitado.
 *
 * @param {Locator} element
 * @param {boolean} enabled Estado esperado.
 */
const checkEnabled = (element, enabled = true) =>
    check(
        () => (enabled ? expect(element).toBeEnabled() : expect(element).toBeDisabled()),

        enabled ? 'Componente habilitado' : 'Componente deshabilitado',

        async () => {
            const actual = await element.isEnabled();

            return actual
                ? 'Componente habilitado, se esperaba deshabilitado'
                : 'Componente deshabilitado, se esperaba habilitado';
        }
    );

/**
 * Valida el texto mostrado por un componente.
 *
 * @param {Locator} element
 * @param {string} text Texto esperado.
 */
const checkText = (element, text) =>
    check(
        () => expect(element).toHaveText(text),

        `Texto correcto: '${text}'`,

        async () => {
            const actual = await element.innerText();

            return `Texto incorrecto: se esperaba '${text}', se encontró '${actual}'`;
        },
        'warning'
    );

/**
 * Valida el placeholder de un Input Text.
 *
 * @param {Locator} element
 * @param {string} placeholder Placeholder esperado.
 */
const checkPlaceholder = (element, placeholder) =>
    check(
        () => expect(element).toHaveAttribute('placeholder', placeholder),

        `Placeholder correcto: '${placeholder}'`,

        async () => {
            const actual = await element.getAttribute('placeholder');

            return `Placeholder incorrecto: se esperaba '${placeholder}', se encontró '${actual ?? ''}'`;
        }
    );

/**
 * Valida el valor esperado de un Input Text.
 *
 * @param {Locator} element
 * @param {string} value Valor esperado.
 */
const checkValue = (element, value) =>
    check(
        () => expect(element).toHaveValue(value),

        `Valor esperado correcto: '${value}'`,

        async () => {
            const actual = await element.inputValue();

            return `Valor esperado incorrecto: se esperaba '${value}', se encontró '${actual}'`;
        }
    );

/**
 * Escribe un valor en un Input Text y valida el resultado.
 *
 * @param {Locator} element
 * @param {string} value Valor que se escribirá.
 */
const checkFill = (element, value) =>
    check(
        async () => {
            await element.fill(value);
            await expect(element).toHaveValue(value);
        },

        `Valor escrito correcto: '${value}'`,

        async () => {
            const actual = await element.inputValue();

            return `Valor escrito incorrecto: se esperaba '${value}', se encontró '${actual}'`;
        }
    );

/**
 * Ingresa una lista de valores en un mismo input,
 * presionando Enter después de cada ingreso.
 *
 * @param {Locator} element
 * @param {string[]} values Valores a ingresar.
 */
const checkFillList = (element, values) =>
    check(
        async () => {
            for (const value of values) {
                await element.fill(value);
                await expect(element).toHaveValue(value);
                await element.press('Enter');
            }
        },
        `Valores ingresados correctamente: ${values.join(', ')}`,
        () => `No se pudieron ingresar todos los valores: ${values.join(', ')}`
    );

/**
 * Ingresa una lista de valores en un mismo input,
 * presionando Enter después de cada ingreso.
 *
 * @param {Locator} element1
 * @param {Locator} element2
 * @param {Locator} buttonAdd
 * @param {string[]} values Valores a ingresar.
 */
const checkFillList2 = (element1, element2, buttonAdd, values) =>
    check(
        async () => {
            for (const { key, value } of values) {
                await element1.fill(key);
                await expect(element1).toHaveValue(key);
                await element2.fill(value);
                await expect(element2).toHaveValue(value);
                await buttonAdd.click();
            }
        },
        `Valores ingresados correctamente: ${values.map(({ key, value }) => `(${key} = ${value})`).join(', ')}`,
        () => `No se pudieron ingresar todos los valores: ${values.join(', ')}`
    );

/**
 * Realiza un clic sobre un componente.
 *
 * @param {Locator} element
 */
const checkClick = element =>
    check(
        () => element.click(),
        'Clic realizado correctamente',
        () => 'No se pudo realizar el clic'
    );

/**
 * Arrastra un componente hacia un área de destino.
 *
 * @param {Locator} source
 * @param {Locator} target
 */
const checkDragAndDrop = (source, target) =>
    check(
        () =>
            source.dragTo(target, {
                targetPosition: {
                    x: 10,
                    y: 10,
                },
            }),
        'Componente arrastrado y soltado correctamente',
        () => 'No se pudo arrastrar y soltar el componente'
    );

/**
 * Selecciona una opción de un Select y valida su valor.
 *
 * @param {Locator} element
 * @param {string} value Valor de la opción a seleccionar.
 */
const checkSelectOption = (element, value) =>
    check(
        async () => {
            await element.selectOption({ value });
            await expect(element).toHaveValue(value);
        },
        `Valor seleccionado correcto: '${value}'`,
        async () =>
            `Valor seleccionado incorrecto: se esperaba '${value}', se encontró '${await element.inputValue({ timeout: 2000 })}'`
    );

/**
 * Desplaza la pantalla hasta el componente indicado.
 *
 * @param {Locator} element
 */
const checkScroll = element =>
    check(
        async () => {
            await element.scrollIntoViewIfNeeded({
                timeout: 5000,
            });

            await expect(element).toBeInViewport();
        },
        'Componente localizado mediante desplazamiento',
        () => 'No se pudo desplazar hasta el componente'
    );

/**
 * Cambia y valida el estado de un checkbox mediante su componente de control.
 *
 * @param {Locator} element - Localizador del input checkbox.
 * @param {Locator} control - Localizador del componente que permite interactuar con el checkbox.
 * @param {boolean} checked - Estado esperado del checkbox (true: marcado, false: desmarcado).
 * @returns {Promise<Object>} Resultado de la validación.
 */
const checkCheckbox = (element, control, checked) =>
    check(
        async () => {
            if ((await element.isChecked()) !== checked) {
                await control.click();
            }

            await expect(element).toBeChecked({ checked });
        },
        `Checkbox ${checked ? 'marcado' : 'desmarcado'} correctamente`,
        async () =>
            `Estado incorrecto del checkbox: se esperaba ${
                checked ? 'marcado' : 'desmarcado'
            }, se encontró ${(await element.isChecked()) ? 'marcado' : 'desmarcado'}`
    );

/**
 * Valida un componente Label.
 *
 * @param {Page} page Página de Playwright.
 * @param {TestInfo} testInfo Información de la prueba.
 * @param {string} elementName Nombre del componente para el reporte.
 * @param {PageElement} element Componente de validación.
 * @param {string} [element.text] Texto esperado.
 * @param {string} [element.xpath] XPath del componente.
 * @returns {Promise<void>}
 */
export async function validateLabel(page, testInfo, elementName, { text, xpath }) {
    const locator = xpath ? page.locator(xpath) : page.getByText(text, { exact: true });

    text = text ?? (await locator.innerText());

    await validateComponent(page, testInfo, `Label ${elementName}`, {
        locator,
        validations: [
            { execute: element => checkVisible(element) },
            { execute: element => checkText(element, text) },
        ],
    });
}

/**
 * Valida un componente Card.
 *
 * @param {Page} page Página de Playwright.
 * @param {TestInfo} testInfo Información de la prueba.
 * @param {string} elementName Nombre del componente para el reporte.
 * @param {PageElement} element Componente de validación.
 * @param {string} [element.text] Texto esperado.
 * @param {string} [element.xpath] XPath del componente.
 * @returns {Promise<void>}
 */
export async function validateCard(page, testInfo, elementName, { text, description, xpath }) {
    const locator = page.locator(xpath);

    await validateComponent(page, testInfo, `Card ${elementName}`, {
        locator,
        validations: [
            { execute: element => checkVisible(element) },
            { execute: element => checkText(element.locator('xpath=.//span'), text) },
            { execute: element => checkText(element.locator('xpath=.//p'), description) },
        ],
    });
}

/**
 * Valida un componente Input de tipo texto.
 *
 * @param {Page} page Página de Playwright.
 * @param {TestInfo} testInfo Información de la prueba.
 * @param {string} elementName Nombre del componente para el reporte.
 * @param {PageElement} element Componente de validación.
 * @param {string} element.placeholder Placeholder esperado.
 * @param {string} element.expectedValue Valor esperado.
 * @param {string} [element.fillValue] Valor que se escribirá.
 * @param {boolean} [element.enabled=true] Estado esperado.
 * @param {string} [element.xpath] XPath del componente.
 * @returns {Promise<void>}
 */
export async function validateInputText(
    page,
    testInfo,
    elementName,
    { placeholder, expectedValue, fillValue, enabled = true, xpath }
) {
    const locator = xpath
        ? page.locator(xpath)
        : page.getByPlaceholder(placeholder, { exact: true });

    await validateComponent(page, testInfo, `Input Text ${elementName}`, {
        locator,
        validations: [
            { execute: element => checkVisible(element) },
            { execute: element => checkEnabled(element, enabled) },
            { execute: element => checkPlaceholder(element, placeholder) },
            { execute: element => checkValue(element, expectedValue) },
            ...(fillValue ? [{ execute: element => checkFill(element, fillValue) }] : []),
        ],
    });
}

/**
 * Valida un componente Text Area.
 *
 * @param {Page} page Página de Playwright.
 * @param {TestInfo} testInfo Información de la prueba.
 * @param {string} elementName Nombre del componente para el reporte.
 * @param {PageElement} element Componente de validación.
 * @param {string} element.placeholder Placeholder esperado.
 * @param {string} element.expectedValue Valor esperado.
 * @param {string} [element.fillValue] Valor que se escribirá.
 * @param {boolean} [element.enabled=true] Estado esperado.
 * @param {string} [element.xpath] XPath del componente.
 * @returns {Promise<void>}
 */
export async function validateTextArea(
    page,
    testInfo,
    elementName,
    { placeholder, expectedValue, fillValue, enabled = true, xpath }
) {
    const locator = xpath
        ? page.locator(xpath)
        : page.getByPlaceholder(placeholder, { exact: true });

    await validateComponent(page, testInfo, `Text Area ${elementName}`, {
        locator,
        validations: [
            { execute: element => checkVisible(element) },
            { execute: element => checkEnabled(element, enabled) },
            { execute: element => checkPlaceholder(element, placeholder) },
            { execute: element => checkValue(element, expectedValue) },
            ...(fillValue ? [{ execute: element => checkFill(element, fillValue) }] : []),
        ],
    });
}

/**
 * Valida un componente Button.
 *
 * @param {Page} page Página de Playwright.
 * @param {TestInfo} testInfo Información de la prueba.
 * @param {string} elementName Nombre del componente para el reporte.
 * @param {PageElement} element Componente de validación.
 * @param {string} element.text Texto esperado.
 * @param {boolean} [element.enabled=true] Estado esperado.
 * @param {boolean} [element.click=false] Indica si debe hacerse clic.
 * @param {string} [element.xpath] XPath del componente.
 * @returns {Promise<void>}
 */
export async function validateButton(
    page,
    testInfo,
    elementName,
    { text, enabled = true, isClicked = false, xpath }
) {
    const locator = xpath
        ? page.locator(xpath)
        : page.getByRole('button', {
              name: text,
              exact: true,
          });

    await validateComponent(page, testInfo, `Button ${elementName}`, {
        locator,
        validations: [
            { execute: element => checkVisible(element) },
            { execute: element => checkEnabled(element, enabled) },
            { execute: element => checkText(element, text) },
            ...(isClicked ? [{ execute: element => checkClick(element) }] : []),
        ],
    });
}

/**
 * Valida una lista.
 *
 * @param {Page} page Página de Playwright.
 * @param {TestInfo} testInfo Información de la prueba.
 * @param {string} elementName Nombre del componente.
 * @param {PageElement} element Componente de validación.
 * @param {string} element.xpath XPath de la lista.
 * @returns {Promise<void>}
 */
export async function validateList(page, testInfo, elementName, { xpath }) {
    const locator = page.locator(xpath);
    const listItems = locator.locator('li');

    await validateComponent(page, testInfo, `Lista ${elementName}`, {
        locator,
        validations: [
            { execute: element => checkVisible(element, 'Lista') },
            {
                execute: async () => {
                    return check(
                        async () => {
                            await expect(listItems.first()).toBeVisible();
                        },
                        'La lista contiene elementos visibles',
                        () => 'La lista no contiene elementos visibles'
                    );
                },
            },
            {
                execute: async () => {
                    try {
                        const items = await listItems.allTextContents();
                        const html = `
                        <div class="list-information">
                            <span>Opciones de la lista (${items.length})</span>
                            <ul class="report-list-grid">${items
                                .map(
                                    text => `
                                <li>${escapeHTML(text.trim())}</li>`
                                )
                                .join('')}
                            </ul>
                        </div>`;

                        return {
                            status: 'info',
                            typeInfo: 'list',
                            description: html,
                        };
                    } catch (error) {
                        return {
                            status: 'failed',
                            description: 'No se pudieron obtener las opciones de la lista',
                            error: error.message,
                        };
                    }
                },
            },
        ],
    });
}

/**
 * Valida el arrastre de un componente hacia un área de destino.
 *
 * @param {Page} page Página de Playwright.
 * @param {TestInfo} testInfo Información de la prueba.
 * @param {string} actionName Nombre de la acción.
 * @param {Record<string, PageElement>} elements Componentes de validación.
 * @param {PageElement} elements.source Componente de origen.
 * @param {PageElement} elements.target Área de destino.
 * @param {PageElement} elements.expected Componente esperado después del arrastre.
 * @returns {Promise<void>}
 */
export async function validateDragAndDrop(
    page,
    testInfo,
    actionName,
    { source, target, expected }
) {
    const sourceLocator = page.locator(source.xpath);
    const targetLocator = page.locator(target.xpath);
    const expectedLocator = page.locator(expected.xpath).last();
    await validateComponent(page, testInfo, `Drag & Drop: ${actionName}`, {
        type: 'action',
        locator: sourceLocator,
        validations: [
            { execute: element => checkVisible(element, 'Componente de origen') },
            { execute: () => checkVisible(targetLocator, 'Área de destino') },
            { execute: element => checkDragAndDrop(element, targetLocator) },
            { execute: () => checkVisible(expectedLocator, 'Componente agregado al destino') },
            { execute: () => checkScroll(expectedLocator) },
        ],
    });
}

/**
 * Completa los campos de una Card Route.
 *
 * @param {Page} page Página de Playwright.
 * @param {TestInfo} testInfo Información de la prueba.
 * @param {string} actionName Nombre del componente.
 * @param {PageElement} element Opciones de la acción.
 * @param {string} element.xpath XPath de la Card.
 * @param {Object} data Datos de llenado
 * @param {string} data.name Nombre de la Ruta.
 * @param {string} data.path Path de la Ruta.
 * @returns {Promise<void>}
 */
export async function fillRouteCard(page, testInfo, actionName, { xpath }, { name, path }) {
    const locator = page.locator(xpath).last();
    const nameLocator = locator.locator('xpath=.//input[@placeholder="Nombre de la ruta"]');
    const pathLocator = locator.locator('xpath=.//input[@placeholder="/api"]');

    await validateComponent(page, testInfo, `Ingreso De Datos ${actionName}`, {
        type: 'action',
        locator,
        validations: [
            { execute: element => checkVisible(element) },
            { execute: () => checkScroll(nameLocator) },
            { execute: () => checkFill(nameLocator, name) },
            { execute: () => checkFill(pathLocator, path) },
        ],
    });
}

/**
 * Completa los campos de una Card Endpoint.
 *
 * @param {Page} page Página de Playwright.
 * @param {TestInfo} testInfo Información de la prueba.
 * @param {string} actionName Nombre del componente.
 * @param {PageElement} element Opciones de la acción.
 * @param {string} element.xpath XPath de la Card.
 * @param {PageElement} attribs Opciones de la acción.
 * @param {Object} data - Datos del endpoint.
 * @param {string} data.method - Metodo del endpoint.
 * @param {string} data.path - Path del endpoint.
 * @param {string} data.parameterType - Tipo de parametros del endpoint.
 * @param {string} data.params - Parametros del endpoint.
 * @param {string} data.successResponse - Respuesta exitosa del endpoint.
 * @param {string} data.errorResponse - Respuesta de error del endpoint.
 * @returns {Promise<void>}
 */
export async function fillEndpointCard(
    page,
    testInfo,
    actionName,
    { xpath },
    { buttonColapse, selectMethod, inputPath, selectType, inputParam, success, error },
    { method, path, parameterType, params, successResponse, errorResponse }
) {
    const locator = page.locator(xpath).last();
    const btnColapse = locator.locator(`xpath=${buttonColapse}`);
    const methodLocator = locator.locator(`xpath=${selectMethod}`);
    const pathLocator = locator.locator(`xpath=${inputPath}`);
    const typeParam = locator.locator(`xpath=${selectType}`);
    const paramName = locator.locator(`xpath=${inputParam}`);
    const selectSuccess = locator.locator(`xpath=${success.selectCode}`);
    const keySuccess = locator.locator(`xpath=${success.inputKey}`);
    const valueSuccess = locator.locator(`xpath=${success.inputValue}`);
    const addSuccess = locator.locator(`xpath=${success.buttonAdd}`);
    const selectError = locator.locator(`xpath=${error.selectCode}`);
    const keyError = locator.locator(`xpath=${error.inputKey}`);
    const valueError = locator.locator(`xpath=${error.inputValue}`);
    const addError = locator.locator(`xpath=${error.buttonAdd}`);

    let buttons = locator.locator('xpath=.//div[label[text()="Respuesta Exitosa"]]/div[3]//button');
    let count = await buttons.count();
    for (let i = 0; i < count; i++) {
        await buttons.first().click();
        await expect(buttons).toHaveCount(count - i - 1);
    }

    buttons = locator.locator('xpath=.//div[label[text()="Respuesta de Error"]]/div[3]//button');
    count = await buttons.count();
    for (let i = 0; i < count; i++) {
        await buttons.first().click();
        await expect(buttons).toHaveCount(count - i - 1);
    }

    await validateComponent(page, testInfo, `Ingreso De Datos ${actionName}`, {
        type: 'action',
        locator,
        validations: [
            { execute: element => checkVisible(element) },
            { execute: () => checkScroll(methodLocator) },
            { execute: () => checkSelectOption(methodLocator, method) },
            { execute: () => checkFill(pathLocator, path) },
            ...(parameterType !== 'none'
                ? [
                      { execute: () => checkSelectOption(typeParam, parameterType) },
                      { execute: () => checkFillList(paramName, params) },
                  ]
                : []),
            { execute: () => checkSelectOption(selectSuccess, successResponse.statusCode) },
            {
                execute: () =>
                    checkFillList2(keySuccess, valueSuccess, addSuccess, successResponse.fields),
            },
            { execute: () => checkSelectOption(selectError, errorResponse.statusCode) },
            { execute: () => checkFillList2(keyError, valueError, addError, errorResponse.fields) },
            {
                execute: async () => {
                    const screenshot = await page.screenshot({
                        fullPage: true,
                        animations: 'disabled',
                    });

                    return {
                        status: 'info',
                        typeInfo: 'screenshot',
                        description: `Endpoint Desplegado`,
                        screenshot: screenshot.toString('base64'),
                    };
                },
            },
            { execute: () => checkClick(btnColapse) },
        ],
    });
}

/**
 * Configura las opciones de generación y descarga del proyecto.
 *
 * @param {Page} page Página de Playwright.
 * @param {TestInfo} testInfo Información de la prueba.
 * @param {string} actionName - Nombre de la acción en el reporte.
 * @param {Object} components - Componentes utilizados para configurar el proyecto.
 * @param {PageElement} components.checkEnv - Checkbox de variables de entorno.
 * @param {PageElement} components.switchEnv - Control del checkbox de variables de entorno.
 * @param {PageElement} components.checkBD - Checkbox del conector de base de datos.
 * @param {PageElement} components.switchBD - Control del checkbox del conector de base de datos.
 * @param {PageElement} components.selectBD - Selector del tipo de base de datos.
 * @param {PageElement} components.buttonContinuar - Botón para continuar con la configuración.
 * @param {PageElement} components.buttonDescargarCodigo - Botón para descargar el código generado.
 * @param {Object} settings - Opciones de configuración del proyecto.
 * @param {boolean} [settings.includeEnv=true] - Indica si se incluyen variables de entorno.
 * @param {boolean} [settings.includeBD=false] - Indica si se incluye un conector de base de datos.
 * @param {string} [settings.bdType='mysql'] - Tipo de base de datos que se desea configurar.
 * @returns {Promise<void>}
 */
export async function setSettings(
    page,
    testInfo,
    actionName,
    { checkEnv, switchEnv, checkBD, switchBD, selectBD, buttonContinuar, buttonDescargarCodigo },
    { includeEnv = true, includeBD = false, bdType = 'mysql' }
) {
    const chckEnv = page.locator(checkEnv.xpath);
    const swEnv = page.locator(switchEnv.xpath);
    const chckBD = page.locator(checkBD.xpath);
    const swBD = page.locator(switchBD.xpath);
    const slctBD = page.locator(selectBD.xpath);
    const btnContinuar = page.locator(buttonContinuar.xpath);
    const btnDescargar = page.locator(buttonDescargarCodigo.xpath);
    const downloadPromise = page.waitForEvent('download');

    await validateComponent(page, testInfo, `Seleccion De Opciones ${actionName}`, {
        type: 'action',
        undefined,
        validations: [
            { execute: () => checkCheckbox(chckEnv, swEnv, includeEnv) },
            { execute: () => checkCheckbox(chckBD, swBD, includeBD) },
            ...(includeBD ? [{ execute: () => checkSelectOption(slctBD, bdType) }] : []),
            {
                execute: async () => {
                    const screenshot = await page.screenshot({
                        fullPage: true,
                        animations: 'disabled',
                    });

                    return {
                        status: 'info',
                        typeInfo: 'screenshot',
                        description: `Configuracion Del Proyecto`,
                        screenshot: screenshot.toString('base64'),
                    };
                },
            },
            { execute: () => checkClick(btnContinuar) },
            {
                execute: async () => {
                    const screenshot = await page.screenshot({
                        fullPage: true,
                        animations: 'disabled',
                    });

                    return {
                        status: 'info',
                        typeInfo: 'screenshot',
                        description: `Codigo de la API`,
                        screenshot: screenshot.toString('base64'),
                    };
                },
            },
            { execute: () => checkClick(btnDescargar) },
        ],
    });

    const download = await downloadPromise;
    await download.saveAs(`downloads/${download.suggestedFilename()}`);
}
