/**
 * Ejecuta y registra las validaciones de un componente o acción.
 *
 * @param {import('@playwright/test').TestInfo} testInfo Información de la prueba.
 * @param {string} componentName Nombre del componente o acción.
 * @param {Object} options Opciones de validación.
 * @param {import('@playwright/test').Locator} options.locator Localizador del componente.
 * @param {Array} options.validations Validaciones que se ejecutarán.
 * @param {'component'|'action'} [options.type='component'] Tipo de validación.
 */
export async function validateComponent(
    page,
    testInfo,
    componentName,
    { locator, validations, type = 'component' }
) {
    const results = [];

    for (const validation of validations) {
        try {
            const result = await validation.execute(locator);

            results.push({
                status: result.status,
                description: result.description,
                typeInfo: result.typeInfo ?? 'text',
                ...(result.screenshot && { screenshot: result.screenshot }),
                ...(result.startTime && { startTime: result.startTime }),
                ...(result.duration && { duration: result.duration }),
                ...(result.error && { error: result.error }),
            });
        } catch (error) {
            results.push({
                status: 'failed',
                typeInfo: 'text',
                description: 'No se pudo completar la validación',
                error: error.message,
            });
        }
    }

    let screenshotAction;
    if (type === 'action') {
        const screenshot = await page.screenshot({
            fullPage: true,
            animations: 'disabled',
        });

        screenshotAction = {
            status: 'info',
            typeInfo: 'screenshot',
            description: `${componentName} completada`,
            screenshot: screenshot.toString('base64'),
        };

        results.push(screenshotAction);
    }

    await testInfo.attach('component-validation', {
        body: Buffer.from(
            JSON.stringify({
                componentName,
                type,
                results,
                ...(screenshotAction && { screenshot: screenshotAction.screenshot }),
            })
        ),
        contentType: 'application/json',
    });

    const failures = results.filter(result => result.status === 'failed');

    if (failures.length > 0) {
        throw new Error(`'${componentName}': ${failures.length} validación(es) fallida(s)`);
    }
}
