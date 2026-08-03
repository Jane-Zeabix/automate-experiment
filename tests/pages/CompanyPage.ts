import { Page, Locator, expect } from '@playwright/test';
import { gotoCompanies } from '../helpers/app';

/**
 * Page Object for "ตั้งค่าระบบ > บริษัท" (Company management).
 * Route: /love-care/setting/companies
 * Test cases: LSP-SC-TC-FT-* (sheet "UC8.3 จัดการบริษัท").
 */
export class CompanyPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly searchBox: Locator;
  readonly searchButton: Locator;
  readonly addButton: Locator;
  readonly table: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'รายการบริษัท' });
    this.searchBox = page.getByPlaceholder(/รหัสบริษัท/);
    this.searchButton = page.getByRole('button', { name: 'ตกลง' });
    this.addButton = page.getByRole('button', { name: /เพิ่มบริษัท/ });
    this.table = page.getByRole('table');
  }

  async goto() {
    await gotoCompanies(this.page);
  }

  async search(keyword: string) {
    await this.searchBox.fill(keyword);
    await this.searchButton.click();
  }

  /** A data row containing the given text (e.g. a company code). */
  row(text: string): Locator {
    return this.table.getByRole('row', { name: new RegExp(text) });
  }

  /** Number of data (body) rows currently shown. */
  bodyRows(): Locator {
    return this.table.locator('tbody tr');
  }

  async openAddForm() {
    await this.addButton.click();
  }
}
