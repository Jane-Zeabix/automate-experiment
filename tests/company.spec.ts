import { test, expect } from './fixtures';
import { CompanyPage } from './pages/CompanyPage';

/**
 * Feature: จัดการบริษัท (Company management) — sheet "UC8.3".
 * Route: /love-care/setting/companies
 *
 * Template covering a representative subset of the 53 cases
 * (LSP-SC-TC-FT-001..053). Extend following the same pattern.
 */
test.describe('จัดการบริษัท (Company)', () => {
  let company: CompanyPage;

  test.beforeEach(async ({ page }) => {
    company = new CompanyPage(page);
    await company.goto();
  });

  // LSP-SC-TC-FT-001: Verify "บริษัท" page UI
  test('LSP-SC-TC-FT-001: displays company list page UI', async ({ page }) => {
    await expect(company.searchBox).toBeVisible();
    await expect(company.searchButton).toBeVisible();
    await expect(company.addButton).toBeVisible();
    await expect(company.table).toBeVisible();

    for (const header of [
      '#',
      'รหัสบริษัท',
      'ชื่อบริษัทภาษาไทย',
      'ชื่อบริษัทภาษาอังกฤษ',
      'ชื่อย่อบริษัท',
      'จำนวนสาขา',
      'สถานะ',
    ]) {
      await expect(page.getByRole('columnheader', { name: header })).toBeVisible();
    }
  });

  // LSP-SC-TC-FT-011: Verify search by รหัสบริษัท
  test('LSP-SC-TC-FT-011: search by company code (รหัสบริษัท)', async () => {
    await company.search('LIONTH');
    await expect(company.row('LIONTH')).toBeVisible();
    await expect(company.bodyRows()).toHaveCount(1);
  });

  // LSP-SC-TC-FT-014: Verify search with no result
  test('LSP-SC-TC-FT-014: search with no matching result shows empty state', async ({ page }) => {
    await company.search('kdsldklkdsl');
    await expect(page.getByRole('cell', { name: 'LIONTH', exact: true })).toHaveCount(0);
  });

  // LSP-SC-TC-FT-020: Verify click "+ เพิ่มบริษัท" navigates to the add page
  test('LSP-SC-TC-FT-020: "+ เพิ่มบริษัท" opens the add-company page', async ({ page }) => {
    await company.openAddForm();
    await expect(page).not.toHaveURL(/setting\/companies\/?$/);
  });

  // LSP-SC-TC-FT-045: Verify required-field validation on the add form
  test('LSP-SC-TC-FT-045: saving empty add form stays on the form (validation)', async ({ page }) => {
    await company.openAddForm();
    await page.getByRole('button', { name: 'บันทึก' }).click();
    // Should NOT navigate back to the list — validation blocks submission.
    await expect(page).not.toHaveURL(/setting\/companies\/?$/);
  });
});
