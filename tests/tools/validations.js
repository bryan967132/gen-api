import { escapeHTML } from '../utils/format.js';
import { expect } from '../tools/driver.js';
import { validateComponent } from '../reporters/reportManager.js';

/**
 * Ejecuta una validación y devuelve su resultado para el reporte.
 *
 * @param {Function} assertion Aserción que debe cumplirse.
 * @param {string} success Descripción si la validación es correcta.
 * @param {Function} failure Obtiene la descripción si falla.
 * @returns {Promise<{status: string, description: string, error?: string}>}
 */
async function check(assertion, success, failure) {
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
        } catch {
            description = 'No se pudo obtener el estado del componente';
        }

        return {
            status: 'failed',
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
        }
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
 * Valida la cantidad de elementos de una lista.
 *
 * @param {import('@playwright/test').Locator} element
 * @param {number} count Cantidad esperada.
 */
const checkCount = (element, count) =>
    check(
        () => expect(element).toHaveCount(count),

        `Cantidad correcta de elementos: ${count}`,

        async () => {
            const actual = await element.count();

            return `Cantidad incorrecta de elementos: se esperaban ${count}, se encontraron ${actual}`;
        }
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
 * Valida un componente Label.
 *
 * @param {import('@playwright/test').Page} page Página de Playwright.
 * @param {import('@playwright/test').TestInfo} testInfo Información de la prueba.
 * @param {string} componentName Nombre del componente para el reporte.
 * @param {Object} options Opciones de validación.
 * @param {string} [options.text] Texto esperado.
 * @param {string} [options.xpath] XPath del componente.
 * @returns {Promise<void>}
 */
export async function validateLabel(page, testInfo, componentName, { text, xpath }) {
    const locator = xpath ? page.locator(xpath) : page.getByText(text, { exact: true });

    text = text ?? (await locator.innerText());

    await validateComponent(testInfo, componentName, {
        locator,
        validations: [
            {
                execute: element => checkVisible(element),
            },
            {
                execute: element => checkText(element, text),
            },
        ],
    });
}

/**
 * Valida un componente Card.
 *
 * @param {import('@playwright/test').Page} page Página de Playwright.
 * @param {import('@playwright/test').TestInfo} testInfo Información de la prueba.
 * @param {string} componentName Nombre del componente para el reporte.
 * @param {Object} options Opciones de validación.
 * @param {string} [options.text] Texto esperado.
 * @param {string} [options.xpath] XPath del componente.
 * @returns {Promise<void>}
 */
export async function validateCard(page, testInfo, componentName, { text, xpath }) {
    const locator = xpath ? page.locator(xpath) : page.getByText(text, { exact: true });

    text = text ?? (await locator.innerText());

    await validateComponent(testInfo, componentName, {
        locator,
        validations: [
            {
                execute: element => checkVisible(element),
            },
            {
                execute: element => checkText(element, text),
            },
        ],
    });
}

/**
 * Valida un componente Input de tipo texto.
 *
 * @param {import('@playwright/test').Page} page Página de Playwright.
 * @param {import('@playwright/test').TestInfo} testInfo Información de la prueba.
 * @param {string} componentName Nombre del componente para el reporte.
 * @param {Object} options Opciones de validación.
 * @param {string} options.placeholder Placeholder esperado.
 * @param {string} options.expectedValue Valor esperado.
 * @param {string} [options.fillValue] Valor que se escribirá.
 * @param {boolean} [options.enabled=true] Estado esperado.
 * @param {string} [options.xpath] XPath del componente.
 * @returns {Promise<void>}
 */
export async function validateInputText(
    page,
    testInfo,
    componentName,
    { placeholder, expectedValue, fillValue, enabled = true, xpath }
) {
    const locator = xpath
        ? page.locator(xpath)
        : page.getByPlaceholder(placeholder, { exact: true });

    await validateComponent(testInfo, componentName, {
        locator,
        validations: [
            {
                execute: element => checkVisible(element),
            },
            {
                execute: element => checkEnabled(element, enabled),
            },
            {
                execute: element => checkPlaceholder(element, placeholder),
            },
            {
                execute: element => checkValue(element, expectedValue),
            },
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
 * @param {string} componentName Nombre del componente para el reporte.
 * @param {Object} options Opciones de validación.
 * @param {string} options.text Texto esperado.
 * @param {boolean} [options.enabled=true] Estado esperado.
 * @param {boolean} [options.click=false] Indica si debe hacerse clic.
 * @param {string} [options.xpath] XPath del componente.
 * @returns {Promise<void>}
 */
export async function validateButton(
    page,
    testInfo,
    componentName,
    { text, enabled = true, isClicked = false, xpath }
) {
    const locator = xpath
        ? page.locator(xpath)
        : page.getByRole('button', {
              name: text,
              exact: true,
          });

    await validateComponent(testInfo, componentName, {
        locator,
        validations: [
            {
                execute: element => checkVisible(element),
            },
            {
                execute: element => checkEnabled(element, enabled),
            },
            {
                execute: element => checkText(element, text),
            },
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
 * @param {string} componentName Nombre del componente.
 * @param {Object} options Opciones de validación.
 * @param {string} options.xpath XPath de la lista.
 * @returns {Promise<void>}
 */
export async function validateList(page, testInfo, componentName, { xpath }) {
    const locator = page.locator(xpath);
    const listItems = locator.locator('li');

    await validateComponent(testInfo, componentName, {
        locator,
        validations: [
            {
                execute: element => checkVisible(element, 'Lista'),
            },
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
 * @param {string} componentName Nombre de la acción.
 * @param {Object} options Opciones de validación.
 * @param {{xpath: string}} options.source Componente de origen.
 * @param {{xpath: string}} options.target Área de destino.
 * @param {{xpath: string}} options.expected Componente esperado después del arrastre.
 * @returns {Promise<void>}
 */
export async function validateDragAndDrop(
    page,
    testInfo,
    componentName,
    { source, target, expected }
) {
    const sourceLocator = page.locator(source.xpath);
    const targetLocator = page.locator(target.xpath);
    // const expectedLocator = page.locator(expected.xpath);

    await validateComponent(testInfo, componentName, {
        type: 'action',
        locator: sourceLocator,
        validations: [
            {
                execute: element => checkVisible(element, 'Componente de origen'),
            },
            {
                execute: () => checkVisible(targetLocator, 'Área de destino'),
            },
            {
                execute: element => checkDragAndDrop(element, targetLocator),
            },
            // {
            //     execute: () => checkVisible(expectedLocator, 'Componente agregado al destino'),
            // },
        ],
    });
}
