import { test as base, expect } from '@playwright/test';

import { reportInfoSS, reportCompleteSS, reportFailSS } from './reportLogger.js';

export const test = base.extend({
    // Preparar la aplicación antes de ejecutar las pruebas.
    appReady: async ({ page }, use) => {
        await page.goto('/');

        await page
            .getByText('Genera tu API visualmente', { exact: true })
            .waitFor({ state: 'visible' });

        await page.evaluate(async () => {
            await document.fonts.ready;

            await new Promise(resolve =>
                requestAnimationFrame(() => requestAnimationFrame(resolve))
            );
        });

        await use();
    },

    // Administrar las capturas del escenario.
    globalDriver: [
        async ({ page, appReady }, use, testInfo) => {
            // Captura inicial.
            await reportInfoSS(
                page,
                testInfo,
                'Inicio del escenario',
                'Estado inicial de la aplicación'
            );

            // Ejecutar las pruebas.
            await use();

            // Captura final.
            if (testInfo.status === 'passed') {
                await reportCompleteSS(
                    page,
                    testInfo,
                    'Resultado final',
                    'El escenario finalizó correctamente'
                );
            } else {
                await reportFailSS(
                    page,
                    testInfo,
                    'Resultado final',
                    'El escenario finalizó con errores',
                    testInfo.error
                );
            }
        },
        { auto: true },
    ],
});

export { expect };
