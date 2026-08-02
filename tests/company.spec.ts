import { test, expect } from '@playwright/test';
import { CompanyPage } from './pages/CompanyPage';

/**
 * Feature: จัดการบริษัท (Company management) — sheet "UC8.3".
 *
 * Template mapping representative test cases from the test-case document.
 * The full sheet has 53 cases (LSP-SC-TC-FT-001..053); the ones below are a
 * starting subset covering list UI, search and navigation. Fill in the rest
 * following the same pattern once the selectors are confirmed against Dev.
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
      'ลำดับ',
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
    await company.search('LCT');
    await expect(company.row('LCT')).toBeVisible();
  });

  // LSP-SC-TC-FT-014: Verify search with no result
  test('LSP-SC-TC-FT-014: search with no matching result shows empty state', async ({ page }) => {
    await company.search('kdsldklkdsl');
    await expect(page.getByText(/ไม่พบข้อมูล/)).toBeVisible();
  });

  // LSP-SC-TC-FT-020: Verify click "+ เพิ่มบริษัท" navigates to add page
  test('LSP-SC-TC-FT-020: "+ เพิ่มบริษัท" opens the add-company page', async ({ page }) => {
    await company.openAddForm();
    await expect(page.getByText('เพิ่มบริษัท')).toBeVisible();
  });

  // LSP-SC-TC-FT-045: Verify required-field validation on the add form
  test('LSP-SC-TC-FT-045: saving empty add form shows required-field validation', async ({ page }) => {
    await company.openAddForm();
    await page.getByRole('button', { name: 'บันทึก' }).click();
    // Required fields should be flagged; adjust to the real validation markup.
    await expect(page.getByText('เพิ่มบริษัท')).toBeVisible(); // still on the form
  });
});
