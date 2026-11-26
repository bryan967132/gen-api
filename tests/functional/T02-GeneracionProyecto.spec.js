import { test } from '../tools/driver.js';
import { basicProject, libraryProject } from './data.js';
import T02GeneracionProyecto from './validations/T02-GeneracionProyecto.js';

test.describe('T02 - Generacion Proyecto', () => {
    test('Proyecto Configuracion Basica', async ({ page }, testInfo) => {
        testInfo.annotations.push({
            type: 'expectedResult',
            description: 'passed',
        });

        const t02 = new T02GeneracionProyecto(page, testInfo);
        await t02.createProject(
            'Prueba Basica',
            '8000',
            'Esta es una prueba automatizada',
            basicProject,
            {
                includeEnv: false,
                includeBD: false,
            }
        );
    });

    test('Proyecto Configuracion Avanzada', async ({ page }, testInfo) => {
        testInfo.annotations.push({
            type: 'expectedResult',
            description: 'passed',
        });

        const t02 = new T02GeneracionProyecto(page, testInfo);
        await t02.createProject(
            'Prueba Avanzada',
            '8000',
            'Esta es una prueba automatizada',
            libraryProject,
            { includeEnv: true, includeBD: true, bdType: 'mssql' }
        );
    });
});
