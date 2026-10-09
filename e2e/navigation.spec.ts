import { expect, test } from '@playwright/test';

test('redirects to Convert and navigates between the main pages', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/convert$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Convert' })).toBeVisible();

  await page
    .getByRole('navigation', { name: 'Main' })
    .getByRole('link', { name: 'Review' })
    .click();
  await expect(page).toHaveURL(/\/review$/);
});

test('shows a not-found page for unknown addresses', async ({ page }) => {
  await page.goto('/does-not-exist');
  await expect(page.getByText('Page not found')).toBeVisible();
});

test('remembers settings for the session', async ({ page }) => {
  await page.goto('/convert');
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByLabel('Reviewer id').fill('jdoe');
  await page.getByRole('button', { name: 'Save' }).click();

  await page.reload();
  await page.getByRole('button', { name: 'Settings' }).click();
  await expect(page.getByLabel('Reviewer id')).toHaveValue('jdoe');
});

test('fits a phone screen without horizontal scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/convert');
  await expect(page.getByRole('button', { name: 'Settings' })).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
});
