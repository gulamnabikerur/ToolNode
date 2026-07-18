import { test, expect } from '@playwright/test';

test.describe('PDF Merge Tool', () => {
  test('should load the page and render the upload zone', async ({ page }) => {
    // 1. Navigate to the tool page
    await page.goto('/tools/pdf-merge');

    // 2. Verify basic rendering & SEO
    await expect(page).toHaveTitle(/Merge PDF/);
    await expect(page.locator('h1')).toHaveText('Merge PDF');

    // 3. Verify drag-and-drop zone a11y & existence
    const dropzone = page.locator('.upload-zone');
    await expect(dropzone).toBeVisible();

    // 4. Verify programmatic SEO content rendered below the tool
    const seoArticle = page.locator('.seo-article');
    await expect(seoArticle).toBeVisible();
    await expect(seoArticle.locator('h2')).toContainText('About Merge PDF');
  });
});
