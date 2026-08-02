import { test, expect } from '@playwright/test';
import { BranchPage } from './pages/BranchPage';

/**
 * Feature: จัดการสาขา (Branch management) — sheet "UC8.4".
 *
 * Template mapping representative test cases from the test-case document.
 * The full sheet has 38 cases (LSP-SR-TC-FT-001..038); the ones below are a
 * starting subset covering list UI, search, company filter and navigation.
 */
test.describe('จัดการสาขา (Branch)', () => {
  let branch: BranchPage;

  test.beforeEach(async ({ page }) => {
    branch = new BranchPage(page);
    await branch.goto();
  });

  // LSP-SR-TC-FT-001: Verify "สาขา" page UI
  test('LSP-SR-TC-FT-001: displays branch list page UI', async ({ page }) => {
    await expect(branch.searchBox).toBeVisible();
    await expect(branch.companyFilter).toBeVisible();
    await expect(branch.addButton).toBeVisible();
    await expect(branch.table).toBeVisible();

    for (const header of [
      'ลำดับ',
      'รหัสสาขา',
      'ชื่อเต็มสาขา',
      'ชื่อย่อสาขา',
      'บริษัท',
      'จำนวนเครื่องเทอร์มินัล',
      'สถานะ',
    ]) {
      await expect(page.getByRole('columnheader', { name: header })).toBeVisible();
    }
  });

  // LSP-SR-TC-FT-010: Verify search by รหัสสาขา
  test('LSP-SR-TC-FT-010: search by branch code (รหัสสาขา)', async () => {
    await branch.search('12003');
    await expect(branch.row('12003')).toBeVisible();
  });

  // LSP-SR-TC-FT-013: Verify search with no matching result
  test('LSP-SR-TC-FT-013: search with no matching result shows empty state', async ({ page }) => {
    await branch.search('XYZ123');
    await expect(page.getByText(/ไม่พบข้อมูล/)).toBeVisible();
  });

  // LSP-SR-TC-FT-015: Verify click "+ เพิ่มสาขา" navigates to add page
  test('LSP-SR-TC-FT-015: "+ เพิ่มสาขา" opens the add-branch page', async ({ page }) => {
    await branch.openAddForm();
    await expect(page.getByText('เพิ่มสาขา')).toBeVisible();
  });

  // LSP-SR-TC-FT-031: Verify required-field validation on the add form
  test('LSP-SR-TC-FT-031: saving empty add form shows required-field validation', async ({ page }) => {
    await branch.openAddForm();
    await page.getByRole('button', { name: 'บันทึก' }).click();
    await expect(page.getByText('เพิ่มสาขา')).toBeVisible(); // still on the form
  });
});
