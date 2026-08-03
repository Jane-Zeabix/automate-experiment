import { test, expect } from './fixtures';
import { BranchPage } from './pages/BranchPage';

/**
 * Feature: จัดการสาขา (Branch management) — sheet "UC8.4".
 * Route: /love-care/setting/branches
 *
 * Template covering a representative subset of the 38 cases
 * (LSP-SR-TC-FT-001..038). Extend following the same pattern.
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
    await expect(branch.addButton).toBeVisible();
    await expect(branch.table).toBeVisible();

    for (const header of [
      '#',
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

  // LSP-SR-TC-FT-013: Verify search with no matching result
  test('LSP-SR-TC-FT-013: search with no matching result shows empty state', async () => {
    await branch.search('XYZ123-nomatch');
    await expect(branch.bodyRows()).toHaveCount(0);
  });

  // LSP-SR-TC-FT-015: Verify click "+ เพิ่มสาขา" navigates to the add page
  test('LSP-SR-TC-FT-015: "+ เพิ่มสาขา" opens the add-branch page', async ({ page }) => {
    await branch.openAddForm();
    await expect(page).not.toHaveURL(/setting\/branches\/?$/);
  });

  // LSP-SR-TC-FT-031: Verify required-field validation on the add form
  test('LSP-SR-TC-FT-031: saving empty add form stays on the form (validation)', async ({ page }) => {
    await branch.openAddForm();
    await page.getByRole('button', { name: 'บันทึก' }).click();
    await expect(page).not.toHaveURL(/setting\/branches\/?$/);
  });
});
