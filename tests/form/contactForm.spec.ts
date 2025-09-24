import { test, expect } from '@playwright/test';

// Ejemplo de test agrupado por funcionalidad

test.describe('Formulario de contacto', () => {
  test('Debe mostrar error si el email es inválido', async ({ page }) => {
    await page.goto('https://www.lambdatest.com');
    // ...interacciones de ejemplo...
    // expect(await page.locator('input[type=email]').evaluate(e => e.value)).toBe('');
  });
});
