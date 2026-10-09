import { expect, test } from '@playwright/test';

test('reviews a source: crop, history, edit and certify', async ({ page }) => {
  await page.goto('/review');
  await page.getByRole('link', { name: /ZV-210-201/ }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'data/protocols/ZV-210-201_amendment2.pdf',
  );

  // Click-to-source: the crop of the region the quote was found in.
  await page.getByRole('button', { name: 'Source for design.arm_count' }).click();
  await expect(page.getByRole('img', { name: 'Source crop, page 12' })).toBeVisible();

  // Audited edit: value, reason and reviewer id are all required.
  await page.getByRole('button', { name: 'Edit for design.arm_count' }).click();
  const form = page.getByRole('form', { name: 'Edit design.arm_count' });
  await form.getByLabel('Value').fill('3');
  await form.getByLabel('Reason for change').fill('Table 2 lists three arms');
  await form.getByLabel('Reviewer id').fill('jdoe');
  await form.getByRole('button', { name: 'Save' }).click();

  const row = page.getByTestId('row-design-arm_count');
  await expect(row.getByRole('cell', { name: '3', exact: true })).toBeVisible();
  await row.getByRole('button', { name: 'History for design.arm_count' }).click();
  await expect(page.getByText(/review_edit .* value: 3 \(was: 2\)/)).toBeVisible();

  // The reviewer id entered once is reused for certification.
  const certify = page.getByRole('form', { name: 'Certify this run' });
  await expect(certify.getByLabel('Reviewer id')).toHaveValue('jdoe');
  await certify.getByRole('button', { name: 'Certify this run' }).click();
  await expect(page.getByText(/1 of 11 field\(s\) edited before certification/)).toBeVisible();

  await page.getByRole('link', { name: 'All sources' }).click();
  await expect(
    page.getByRole('row', { name: /ZV-210-201/ }).getByText('certified', { exact: true }),
  ).toBeVisible();
});
