import { expect, test } from '@playwright/test';

import { uploadPdfs } from './helpers';

test('starts empty, with the upload card and both tabs', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { level: 1, name: /Good (morning|afternoon|evening), Reviewer/ }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Upload protocol' })).toBeVisible();
  await expect(page.getByText('No protocols in progress. Upload one to start.')).toBeVisible();

  await page.getByRole('tab', { name: /Approved/ }).click();
  await expect(page.getByText('No approved protocols yet.')).toBeVisible();
});

test('lists uploaded protocols, with search and the status filter', async ({ page }) => {
  await uploadPdfs(page, ['THETA-41_protocol.pdf', 'DELTA-220_scanned.pdf']);
  await page.getByRole('link', { name: 'Go to In Progress' }).click();
  await expect(page.getByRole('link', { name: /THETA-41/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /DELTA-220.*Failed/ })).toBeVisible({
    timeout: 20_000,
  });

  await page.getByLabel('Search protocols').fill('delta');
  await expect(page.getByRole('link', { name: /THETA-41/ })).toHaveCount(0);

  await page.getByLabel('Search protocols').fill('');
  await page.getByRole('combobox', { name: 'Status' }).click();
  await page.getByRole('option', { name: 'Failed' }).click();
  await expect(page.getByRole('link', { name: /DELTA-220/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /THETA-41/ })).toHaveCount(0);
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
  await uploadPdfs(page, ['THETA-41_protocol.pdf']);
  for (const link of ['Go to In Progress', 'Uploaded → Processing']) {
    if (link === 'Uploaded → Processing') await page.goBack();
    await page.getByRole('link', { name: link }).click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('button', { name: 'Settings' })).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      360,
    );
  }
});
