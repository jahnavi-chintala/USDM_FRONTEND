import { expect, test } from '@playwright/test';

test('opens Home with the counts, the upload card and the protocol tabs', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { level: 1, name: /Good (morning|afternoon|evening), Reviewer/ }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Upload protocol' })).toBeVisible();
  await expect(page.getByRole('link', { name: /ALPHA-301/ })).toBeVisible();

  await page.getByRole('tab', { name: /Approved/ }).click();
  await expect(page.getByRole('link', { name: /KAPPA-114/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /ALPHA-301/ })).toHaveCount(0);
});

test('searches and filters the protocols in progress', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Search protocols').fill('delta');
  await expect(page.getByRole('link', { name: /DELTA-220/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /ALPHA-301/ })).toHaveCount(0);

  await page.getByLabel('Search protocols').fill('');
  await page.getByRole('combobox', { name: 'Status' }).click();
  await page.getByRole('option', { name: 'In Review' }).click();
  await expect(page.getByRole('link', { name: /EPSILON-5/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /DELTA-220/ })).toHaveCount(0);
});

test('shows a not-found page for unknown addresses', async ({ page }) => {
  await page.goto('/does-not-exist');
  await expect(page.getByText('Page not found')).toBeVisible();
});

test('remembers settings for the session and greets the reviewer', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByLabel('Reviewer id').fill('jdoe');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByRole('heading', { level: 1, name: /, jdoe$/ })).toBeVisible();

  await page.reload();
  await page.getByRole('button', { name: 'Settings' }).click();
  await expect(page.getByLabel('Reviewer id')).toHaveValue('jdoe');
});

test('fits a phone screen without horizontal scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  for (const path of ['/', '/protocols/alpha-301', '/protocols/delta-220']) {
    await page.goto(path);
    await expect(page.getByRole('button', { name: 'Settings' })).toBeInViewport();
    await page.waitForLoadState('networkidle');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      360,
    );
  }
});
