import { Page, Locator } from '@playwright/test';
import { gotoBranches } from '../helpers/app';

/**
 * Page Object for "ตั้งค่าระบบ > สาขา" (Branch management).
 * Route: /love-care/setting/branches
 * Test cases: LSP-SR-TC-FT-* (sheet "UC8.4 จัดการสาขา").
 */
export class BranchPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly searchBox: Locator;
  readonly companyFilter: Locator;
  readonly addButton: Locator;
  readonly table: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'รายการสาขา' });
    this.searchBox = page.getByPlaceholder(/รหัสสาขา|ชื่อเต็มสาขา|ชื่อย่อสาขา/);
    this.companyFilter = page.getByRole('combobox').first();
    this.addButton = page.getByRole('button', { name: /เพิ่มสาขา/ });
    this.table = page.getByRole('table');
  }

  async goto() {
    await gotoBranches(this.page);
  }

  async search(keyword: string) {
    await this.searchBox.fill(keyword);
    await this.page.keyboard.press('Enter');
  }

  row(text: string): Locator {
    return this.table.getByRole('row', { name: new RegExp(text) });
  }

  bodyRows(): Locator {
    return this.table.locator('tbody tr');
  }

  async openAddForm() {
    await this.addButton.click();
  }
}
