import { expect, test, type Page } from '@playwright/test';

const pdf = (name: string) => ({
  name,
  mimeType: 'application/pdf',
  buffer: Buffer.from('%PDF-1.7\nsynthetic test protocol\n'),
});

async function upload(page: Page, name: string) {
  await page.goto('/convert');
  await page.getByLabel('Protocol PDF').setInputFiles(pdf(name));
  await page.getByRole('button', { name: 'Convert' }).click();
}

test('converts a protocol and shows, browses and downloads the result', async ({ page }) => {
  await upload(page, 'ZV-210-201.pdf');

  await expect(page).toHaveURL(/\/convert\/jobs\/\w+$/);
  await expect(page.getByRole('heading', { level: 1, name: 'ZV-210-201.pdf' })).toBeVisible();
  await expect(page.getByText(/The USDM document is ready/)).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText('Needs review')).toBeVisible();

  await page.getByRole('tab', { name: 'USDM JSON' }).click();
  await page
    .getByRole('button', { name: /^study/ })
    .first()
    .click();
  await expect(page.getByRole('button', { name: /^study/ }).first()).toHaveAttribute(
    'aria-expanded',
    'false',
  );

  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download USDM JSON' }).click();
  expect((await download).suggestedFilename()).toBe('ZV-210-201.usdm.json');

  await page.getByRole('link', { name: 'All conversions' }).click();
  const row = page.getByRole('row', { name: /ZV-210-201\.pdf/ });
  await expect(row.getByText('Done')).toBeVisible();
});

test('explains why a document cannot be converted', async ({ page }) => {
  await upload(page, 'encrypted-protocol.pdf');
  await expect(page.getByText('The PDF is password-protected')).toBeVisible({ timeout: 15_000 });
});

test('refuses a file that is not a PDF', async ({ page }) => {
  await page.goto('/convert');
  await page
    .getByLabel('Protocol PDF')
    .setInputFiles({ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('hello') });
  await expect(page.getByText('Only PDF files can be converted.')).toBeVisible();
});
