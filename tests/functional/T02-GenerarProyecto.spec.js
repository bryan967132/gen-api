import { test } from '../tools/driver.js';
import { basicData } from './data.js';
import T02GenerarProyecto from './validations/T02-GenerarProyecto.js';

test.describe('T02 - Generacion Proyecto', () => {
    test('Proyecto Configuracion Basica', async ({ page }, testInfo) => {
        testInfo.annotations.push({
            type: 'expectedResult',
            description: 'passed',
        });

        const t02 = new T02GenerarProyecto(page, testInfo);
        await t02.basicSetting(
            'Nombre prueba automatizada',
            '8000',
            'Esta es una prueba automatizada',
            basicData
        );
    });
});
