import { test, expect } from '@playwright/test';

test('GenAPI debe cargar correctamente', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('#root')).toBeVisible();
});
