import { expect, test, type Page } from '@playwright/test';

async function signIn(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByLabel('Reviewer id').fill('jdoe');
  await page.getByRole('button', { name: 'Save' }).click();
}

test('review by class: reject, edit with a reason, approve everything, then export', async ({
  page,
}) => {
  await signIn(page);
  await page.getByRole('link', { name: /ALPHA-301/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Review ALPHA-301' })).toBeVisible();

  const classes = page.getByRole('navigation', { name: 'USDM classes', exact: true });
  const data = page.getByRole('region', { name: 'Extracted data' });
  const source = page.getByRole('region', { name: 'Source protocol page' });

  // Opens on the first class still to review, with its quotes on the source page.
  await expect(data.getByRole('heading', { name: 'Study Design' })).toBeVisible();
  await expect(source.locator('mark', { hasText: 'approximately 480 participants' })).toBeVisible();

  await data.getByRole('button', { name: 'Reject' }).click();
  await expect(data.getByText('Rejected', { exact: true })).toBeVisible();
  await expect(data.getByText(/Marked incorrect/)).toBeVisible();

  await data.getByRole('button', { name: 'Edit' }).click();
  await data.getByRole('textbox', { name: 'Planned enrolment' }).fill('482 participants');
  await expect(data.getByRole('button', { name: 'Save changes' })).toBeDisabled();
  await data.getByLabel('Reason for change').fill('Typo in the extraction');
  await data.getByRole('button', { name: 'Save changes' }).click();
  await expect(data.getByText('Edited · needs approval')).toBeVisible();
  await expect(data.getByText('482 participants')).toBeVisible();

  // Approving moves on to the next open class, until every class is approved.
  for (let approved = 2; approved < 9; approved += 1) {
    await data.getByRole('button', { name: 'Approve' }).click();
    await expect(classes.getByText(`${approved + 1}/9 approved`)).toBeVisible();
  }

  await expect(page.getByText('Approved · all 9 classes verified')).toBeVisible();
  await expect(page.getByRole('img', { name: 'Overall confidence 100%' })).toBeVisible();

  await page.getByRole('button', { name: 'Download USDM JSON' }).click();
  const download = page.waitForEvent('download');
  await page.getByRole('dialog').getByRole('button', { name: 'Download' }).click();
  expect((await download).suggestedFilename()).toBe('ALPHA-301.usdm.json');

  await page.getByRole('button', { name: 'Store to database' }).click();
  await expect(page.getByRole('button', { name: 'Stored in database' })).toBeVisible();

  await page
    .getByRole('navigation', { name: 'Breadcrumb' })
    .getByRole('link', { name: 'Home' })
    .click();
  await page.getByRole('tab', { name: /Approved/ }).click();
  await expect(page.getByRole('link', { name: /ALPHA-301/ })).toBeVisible();
});

test('asks for a reviewer id before recording decisions', async ({ page }) => {
  await page.goto('/protocols/epsilon-5');
  const data = page.getByRole('region', { name: 'Extracted data' });
  await expect(
    data.getByText('Set your reviewer id in Settings to record review decisions.'),
  ).toBeVisible();
  await expect(data.getByRole('button', { name: 'Approve' })).toBeDisabled();

  await data.getByRole('button', { name: 'Open Settings' }).click();
  await page.getByLabel('Reviewer id').fill('jdoe');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(data.getByRole('button', { name: 'Approve' })).toBeEnabled();
});

test('re-extracting one class shows its progress and then a fresh score', async ({ page }) => {
  await signIn(page);
  await page.goto('/protocols/epsilon-5');
  const data = page.getByRole('region', { name: 'Extracted data' });
  await expect(data.getByRole('heading', { name: 'Study & Identifiers' })).toBeVisible();
  await data.getByRole('button', { name: 'Re-extract' }).click();
  await expect(data.getByText('Re-extracting…')).toBeVisible();
  await expect(data.getByText('Pending review')).toBeVisible({ timeout: 10_000 });
});
