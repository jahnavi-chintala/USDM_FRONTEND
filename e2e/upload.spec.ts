import { expect, test } from '@playwright/test';

const pdf = (name: string) => ({
  name,
  mimeType: 'application/pdf',
  buffer: Buffer.from('%PDF-1.7'),
});

test('bulk upload: each file is tracked on its own, then processed into review', async ({
  page,
}) => {
  await page.goto('/');
  await page
    .getByLabel('Protocol files')
    .setInputFiles([pdf('THETA-41_protocol.pdf'), pdf('ZETA-19_toolarge.pdf')]);

  await expect(page).toHaveURL(/\/uploads$/);
  await expect(page.getByRole('heading', { name: 'Bulk upload · 2 files' })).toBeVisible();
  const theta = page.getByRole('listitem', { name: 'THETA-41_protocol.pdf' });
  const zeta = page.getByRole('listitem', { name: 'ZETA-19_toolarge.pdf' });
  await expect(zeta.getByText('Failed · File is over 60 MB')).toBeVisible();
  await expect(zeta.getByRole('button', { name: 'Retry ZETA-19_toolarge.pdf' })).toBeVisible();

  await theta.getByRole('link', { name: 'Uploaded → Processing' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'THETA-41' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Processing' })).toBeVisible();
  await expect(page.getByLabel('Processing log')).toContainText('Upload received');

  // The mock pipeline finishes after a few polls and the page turns into the review.
  await expect(page.getByRole('heading', { level: 1, name: 'Review THETA-41' })).toBeVisible({
    timeout: 20_000,
  });
});

test('refuses files that are not PDF or Word before uploading', async ({ page }) => {
  await page.goto('/');
  await page
    .getByLabel('Protocol files')
    .setInputFiles({ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('hi') });
  await expect(page.getByText('notes.txt is not a PDF or Word (.docx) file.')).toBeVisible();
  await expect(page).toHaveURL(/\/$/);
});

test('a failed protocol explains why and can be processed again', async ({ page }) => {
  await page.goto('/protocols/delta-220');
  await expect(
    page.getByRole('heading', { name: 'Scanned document — no text layer' }),
  ).toBeVisible();
  await expect(page.getByText('scanned_pdf_no_ocr')).toBeVisible();

  await page.getByRole('button', { name: 'Retry processing' }).click();
  await expect(page.getByRole('heading', { name: 'Processing' })).toBeVisible();
});
