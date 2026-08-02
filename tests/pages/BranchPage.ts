import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object for "ตั้งค่าระบบ > สาขา" (Branch management).
 * Derived from test cases LSP-SR-TC-FT-* (sheet "UC8.4 จัดการสาขา").
 *
 * Selectors are best-effort based on the visible Thai labels in the test
 * document. Adjust them to match the real DOM.
 */
export class BranchPage {
  readonly page: Page;
  readonly searchBox: Locator;
  readonly companyFilter: Locator;
  readonly addButton: Locator;
  readonly table: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchBox = page.getByPlaceholder(/รหัสสาขา|ชื่อเต็มสาขา|ชื่อย่อสาขา/);
    this.companyFilter = page.getByRole('combobox', { name: /บริษัท/ });
    this.addButton = page.getByRole('button', { name: /เพิ่มสาขา/ });
    this.table = page.getByRole('table');
  }

  /** Navigate to the branch list via the side menu: ตั้งค่าระบบ > สาขา. */
  async goto() {
    await this.page.getByRole('button', { name: /ตั้งค่าระบบ/ }).click();
    await this.page.getByRole('link', { name: 'สาขา', exact: true }).click();
    await expect(this.addButton).toBeVisible();
  }

  async search(keyword: string) {
    await this.searchBox.fill(keyword);
    await this.page.keyboard.press('Enter');
  }

  async filterByCompany(companyName: string) {
    await this.companyFilter.click();
    await this.page.getByRole('option', { name: companyName }).click();
  }

  row(text: string): Locator {
    return this.table.getByRole('row', { name: new RegExp(text) });
  }

  async openAddForm() {
    await this.addButton.click();
    await expect(this.page.getByText('เพิ่มสาขา')).toBeVisible();
  }
}
