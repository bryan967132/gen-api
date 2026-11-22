/**
 * Registra un evento personalizado en el reporte de Playwright.
 *
 * @param {import('@playwright/test').TestInfo} testInfo
 * @param {Object} options Información del evento.
 */
async function reportEvent(testInfo, { title, description, status, error, screenshot }) {
    const data = {
        type: 'event',
        title,
        description,
        status,
        ...(error ? { error } : {}),
        ...(screenshot ? { screenshot: screenshot.toString('base64') } : {}),
    };

    await testInfo.attach('report-event', {
        body: Buffer.from(JSON.stringify(data)),
        contentType: 'application/json',
    });
}

/**
 * Registra un evento y opcionalmente toma una captura.
 */
async function reportScenarioSS(page, testInfo, title, description, status, error) {
    let screenshot;

    try {
        screenshot = await page.screenshot({
            fullPage: true,
            animations: 'disabled',
        });
    } catch (captureError) {
        console.error('No se pudo tomar la captura:', captureError.message);
    }

    await reportEvent(testInfo, {
        title,
        description,
        status,
        error: error?.message || error,
        screenshot,
    });
}

/**
 * Registra una validación exitosa.
 */
export async function reportPass(testInfo, title, description) {
    await reportEvent(testInfo, {
        title,
        description,
        status: 'passed',
    });
}

/**
 * Registra una validación exitosa y toma una captura.
 */
export async function reportPassSS(page, testInfo, title, description) {
    await reportScenarioSS(page, testInfo, title, description, 'passed');
}

/**
 * Registra información sin representar un fallo.
 */
export async function reportInfo(testInfo, title, description) {
    await reportEvent(testInfo, {
        title,
        description,
        status: 'info',
    });
}

/**
 * Registra información y toma una captura.
 */
export async function reportInfoSS(page, testInfo, title, description) {
    await reportScenarioSS(page, testInfo, title, description, 'info');
}

/**
 * Registra un fallo y toma una captura.
 */
export async function reportFail(testInfo, title, description, error) {
    await reportEvent(testInfo, {
        title,
        description,
        status: 'info',
    });

    throw new Error(`Fallo en ${title}: ${error?.message || description || 'Validación fallida'}`);
}

/**
 * Alias para mantener compatibilidad con las llamadas existentes.
 */
export async function reportFailSS(page, testInfo, title, description, error) {
    await reportScenarioSS(page, testInfo, title, description, 'failed', error);

    throw new Error(`Fallo en ${title}: ${error?.message || description || 'Validación fallida'}`);
}

/**
 * Registra una validación exitosa y toma una captura.
 */
export async function reportCompleteSS(page, testInfo, title, description) {
    await reportScenarioSS(page, testInfo, title, description, 'completed');
}
