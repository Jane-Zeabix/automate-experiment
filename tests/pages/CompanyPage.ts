import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object for "ตั้งค่าระบบ > บริษัท" (Company management).
 * Derived from test cases LSP-SC-TC-FT-* (sheet "UC8.3 จัดการบริษัท").
 *
 * Selectors are best-effort based on the visible Thai labels in the test
 * document. Adjust them to match the real DOM (prefer stable data-testid
 * attributes when the app exposes them).
 */
export class CompanyPage {
  readonly page: Page;
  readonly searchBox: Locator;
  readonly searchButton: Locator;
  readonly addButton: Locator;
  readonly table: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchBox = page.getByPlaceholder(/รหัสบริษัท|ชื่อบริษัท/);
    this.searchButton = page.getByRole('button', { name: 'ตกลง' });
    this.addButton = page.getByRole('button', { name: /เพิ่มบริษัท/ });
    this.table = page.getByRole('table');
  }

  /** Navigate to the company list via the side menu: ตั้งค่าระบบ > บริษัท. */
  async goto() {
    await this.page.getByRole('button', { name: /ตั้งค่าระบบ/ }).click();
    await this.page.getByRole('link', { name: 'บริษัท', exact: true }).click();
    await expect(this.addButton).toBeVisible();
  }

  async search(keyword: string) {
    await this.searchBox.fill(keyword);
    await this.searchButton.click();
  }

  /** A table row containing the given text. */
  row(text: string): Locator {
    return this.table.getByRole('row', { name: new RegExp(text) });
  }

  async openAddForm() {
    await this.addButton.click();
    await expect(this.page.getByText('เพิ่มบริษัท')).toBeVisible();
  }
}
