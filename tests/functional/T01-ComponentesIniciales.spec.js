import { test } from '../tools/driver.js';
import T01ComponentesIniciales from './validations/T01-ComponentesIniciales.js';

test.describe('T01 - Validacion componentes iniciales', () => {
    test('Validacion General', async ({ page }, testInfo) => {
        testInfo.annotations.push({
            type: 'expectedResult',
            description: 'passed',
        });

        const t01 = new T01ComponentesIniciales(page, testInfo);
        await t01.basicValidation();
    });
});
