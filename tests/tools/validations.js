import { escapeHTML } from '../utils/format.js';
import { expect } from '../tools/driver.js';
import { validateComponent } from '../reporters/reportManager.js';

/** @typedef {import('../functional/screens/Elements.js').PageElement} PageElement */

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
    try {
        await assertion();

        return {
            status: 'passed',
            description: success,
        };
    } catch (error) {
        let description;

        try {
            description = await failure();
        } catch (e) {
            description = 'No se pudo obtener el estado del componente\n' + e.message;
            console.log(e);
        }

        console.log(error);

        return {
            status: severity,
            description,
            error: error.message,
        };
    }
}

/**
 * Valida la visibilidad de un componente.
 *
 * @param {import('@playwright/test').Locator} element
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
 * @param {import('@playwright/test').Locator} element
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
 * @param {import('@playwright/test').Locator} element
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
 * @param {import('@playwright/test').Locator} element
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
 * @param {import('@playwright/test').Locator} element
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
 * @param {import('@playwright/test').Locator} element
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
 * @param {import('@playwright/test').Locator} element
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
 * @param {import('@playwright/test').Locator} element1
 * @param {import('@playwright/test').Locator} element2
 * @param {import('@playwright/test').Locator} buttonAdd
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
 * @param {import('@playwright/test').Locator} element
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
 * @param {import('@playwright/test').Locator} source
 * @param {import('@playwright/test').Locator} target
 */
const checkDragAndDrop = (source, target) =>
    check(
        () => source.dragTo(target),
        'Componente arrastrado y soltado correctamente',
        () => 'No se pudo arrastrar y soltar el componente'
    );

/**
 * Selecciona una opción de un Select y valida su valor.
 *
 * @param {import('@playwright/test').Locator} element
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
 * @param {import('@playwright/test').Locator} element
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
 * Valida un componente Label.
 *
 * @param {import('@playwright/test').Page} page Página de Playwright.
 * @param {import('@playwright/test').TestInfo} testInfo Información de la prueba.
 * @param {string} elementName Nombre del componente para el reporte.
 * @param {PageElement} element Componente de validación.
 * @param {string} [element.text] Texto esperado.
 * @param {string} [element.xpath] XPath del componente.
 * @returns {Promise<void>}
 */
export async function validateLabel(page, testInfo, elementName, { text, xpath }) {
    const locator = xpath ? page.locator(xpath) : page.getByText(text, { exact: true });

    text = text ?? (await locator.innerText());

    await validateComponent(testInfo, `Label ${elementName}`, {
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
 * @param {import('@playwright/test').Page} page Página de Playwright.
 * @param {import('@playwright/test').TestInfo} testInfo Información de la prueba.
 * @param {string} elementName Nombre del componente para el reporte.
 * @param {PageElement} element Componente de validación.
 * @param {string} [element.text] Texto esperado.
 * @param {string} [element.xpath] XPath del componente.
 * @returns {Promise<void>}
 */
export async function validateCard(page, testInfo, elementName, { text, description, xpath }) {
    const locator = page.locator(xpath);

    await validateComponent(testInfo, `Card ${elementName}`, {
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
 * @param {import('@playwright/test').Page} page Página de Playwright.
 * @param {import('@playwright/test').TestInfo} testInfo Información de la prueba.
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

    await validateComponent(testInfo, `Input Text ${elementName}`, {
        locator,
        validations: [
            { execute: element => checkVisible(element) },
            { execute: element => checkEnabled(element, enabled) },
            { execute: element => checkPlaceholder(element, placeholder) },
            { execute: element => checkValue(element, expectedValue) },
            ...(fillValue !== undefined
                ? [
                      {
                          execute: element => checkFill(element, fillValue),
                      },
                  ]
                : []),
        ],
    });
}

/**
 * Valida un componente Text Area.
 *
 * @param {import('@playwright/test').Page} page Página de Playwright.
 * @param {import('@playwright/test').TestInfo} testInfo Información de la prueba.
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

    await validateComponent(testInfo, `Text Area ${elementName}`, {
        locator,
        validations: [
            { execute: element => checkVisible(element) },
            { execute: element => checkEnabled(element, enabled) },
            { execute: element => checkPlaceholder(element, placeholder) },
            { execute: element => checkValue(element, expectedValue) },
            ...(fillValue !== undefined
                ? [
                      {
                          execute: element => checkFill(element, fillValue),
                      },
                  ]
                : []),
        ],
    });
}

/**
 * Valida un componente Button.
 *
 * @param {import('@playwright/test').Page} page Página de Playwright.
 * @param {import('@playwright/test').TestInfo} testInfo Información de la prueba.
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

    await validateComponent(testInfo, `Button ${elementName}`, {
        locator,
        validations: [
            { execute: element => checkVisible(element) },
            { execute: element => checkEnabled(element, enabled) },
            { execute: element => checkText(element, text) },
            ...(isClicked
                ? [
                      {
                          execute: element => checkClick(element),
                      },
                  ]
                : []),
        ],
    });
}

/**
 * Valida una lista.
 *
 * @param {import('@playwright/test').Page} page Página de Playwright.
 * @param {import('@playwright/test').TestInfo} testInfo Información de la prueba.
 * @param {string} elementName Nombre del componente.
 * @param {PageElement} element Componente de validación.
 * @param {string} element.xpath XPath de la lista.
 * @returns {Promise<void>}
 */
export async function validateList(page, testInfo, elementName, { xpath }) {
    const locator = page.locator(xpath);
    const listItems = locator.locator('li');

    await validateComponent(testInfo, `Lista ${elementName}`, {
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
 * @param {import('@playwright/test').Page} page Página de Playwright.
 * @param {import('@playwright/test').TestInfo} testInfo Información de la prueba.
 * @param {string} elementName Nombre de la acción.
 * @param {Record<string, PageElement>} elements Componentes de validación.
 * @param {PageElement} elements.source Componente de origen.
 * @param {PageElement} elements.target Área de destino.
 * @param {PageElement} elements.expected Componente esperado después del arrastre.
 * @returns {Promise<void>}
 */
export async function validateDragAndDrop(
    page,
    testInfo,
    elementName,
    { source, target, expected }
) {
    const sourceLocator = page.locator(source.xpath);
    const targetLocator = page.locator(target.xpath);
    const expectedLocator = page.locator(expected.xpath).last();
    await validateComponent(testInfo, `Drag & Drop: ${elementName}`, {
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
 * @param {import('@playwright/test').Page} page Página de Playwright.
 * @param {import('@playwright/test').TestInfo} testInfo Información de la prueba.
 * @param {string} elementName Nombre del componente.
 * @param {PageElement} element Opciones de la acción.
 * @param {string} element.xpath XPath de la Card.
 * @param {Object} data Datos de llenado
 * @param {string} data.name Nombre de la Ruta.
 * @param {string} data.path Path de la Ruta.
 * @returns {Promise<void>}
 */
export async function fillRouteCard(page, testInfo, elementName, { xpath }, { name, path }) {
    const locator = page.locator(xpath).last();
    const nameLocator = locator.locator('xpath=.//input[@placeholder="Nombre de la ruta"]');
    const pathLocator = locator.locator('xpath=.//input[@placeholder="/api"]');

    await validateComponent(testInfo, `Ingreso De Datos ${elementName}`, {
        type: 'action',
        locator,
        validations: [
            { execute: element => checkVisible(element) },
            { execute: () => checkFill(nameLocator, name) },
            { execute: () => checkFill(pathLocator, path) },
        ],
    });
}

/**
 * Completa los campos de una Card Endpoint.
 *
 * @param {import('@playwright/test').Page} page Página de Playwright.
 * @param {import('@playwright/test').TestInfo} testInfo Información de la prueba.
 * @param {string} elementName Nombre del componente.
 * @param {PageElement} element Opciones de la acción.
 * @param {string} element.xpath XPath de la Card.
 * @param {Object} data Datos de llenado
 * @param {string} data.method Metodo del Endpoint.
 * @param {string} data.path Path del Endpoint.
 * @returns {Promise<void>}
 */
export async function fillEndpointCard(
    page,
    testInfo,
    elementName,
    { xpath },
    { selectMethod, inputPath, selectType, inputParam, success, error },
    { method, path, parameterType, params, successResponse, errorResponse }
) {
    const locator = page.locator(xpath).last();
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

    await validateComponent(testInfo, `Ingreso De Datos ${elementName}`, {
        type: 'action',
        locator,
        validations: [
            { execute: element => checkVisible(element) },
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
        ],
    });
}
