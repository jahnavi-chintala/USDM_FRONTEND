import { expect, type Page } from '@playwright/test';

/** Uploads PDFs from Home; the app starts with no protocols. */
export async function uploadPdfs(page: Page, names: string[]) {
  await page.goto('/');
  await page
    .getByLabel('Protocol files')
    .setInputFiles(
      names.map((name) => ({ name, mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.7') })),
    );
  await expect(page).toHaveURL(/\/uploads$/);
}

/** Uploads one PDF and waits until processing has turned it into a review. */
export async function uploadForReview(page: Page, fileName: string, name: string) {
  await uploadPdfs(page, [fileName]);
  await page.getByRole('link', { name: 'Uploaded → Processing' }).click();
  await expect(page.getByRole('heading', { level: 1, name: `Review ${name}` })).toBeVisible({
    timeout: 30_000,
  });
}

export async function setReviewer(page: Page, reviewer = 'jdoe') {
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByLabel('Reviewer id').fill(reviewer);
  await page.getByRole('button', { name: 'Save' }).click();
}
