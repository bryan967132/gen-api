import { test } from '../tools/driver.js';
import { voidRoutes, voidDuplicatedRoutes, duplicatedEndpoints } from './data.js';
import T03ValidacionesGeneracionProyecto from './validations/T03-ValidacionesGeneracionProyecto.js';

test.describe('T03 - Validaciones De Generacion De Proyecto', () => {
    test('Rutas Vacías', async ({ page }, testInfo) => {
        testInfo.annotations.push({
            type: 'expectedResult',
            description: 'failed',
        });

        const t03 = new T03ValidacionesGeneracionProyecto(page, testInfo);
        await t03.createProject(
            'Prueba Avanzada',
            '8000',
            'Esta es una prueba automatizada',
            voidRoutes,
            { includeEnv: true, includeBD: true, bdType: 'mssql' }
        );
    });

    test('Rutas Duplicadas y Vacías', async ({ page }, testInfo) => {
        testInfo.annotations.push({
            type: 'expectedResult',
            description: 'failed',
        });

        const t03 = new T03ValidacionesGeneracionProyecto(page, testInfo);
        await t03.createProject(
            'Prueba Avanzada',
            '8000',
            'Esta es una prueba automatizada',
            voidDuplicatedRoutes,
            { includeEnv: true, includeBD: true, bdType: 'mssql' }
        );
    });

    test('Endpoints Duplicados', async ({ page }, testInfo) => {
        testInfo.annotations.push({
            type: 'expectedResult',
            description: 'failed',
        });

        const t03 = new T03ValidacionesGeneracionProyecto(page, testInfo);
        await t03.createProject(
            'Prueba Avanzada',
            '8000',
            'Esta es una prueba automatizada',
            duplicatedEndpoints,
            { includeEnv: true, includeBD: true, bdType: 'mssql' }
        );
    });
});
