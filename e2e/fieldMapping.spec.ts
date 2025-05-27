import { test, expect } from '@playwright/test';

// Test configuration
test.describe('Field Mapping', () => {
  // Set a longer timeout for these tests (60 seconds)
  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
    // Navigate to the app before each test
    await page.goto('http://localhost:3000');
    
    // Wait for the app to be fully loaded
    await page.waitForSelector('text=Start Mapping', { state: 'visible', timeout: 15000 });
  });

  test('User can complete field mapping and get AI suggestions', async ({ page }) => {
    // Start the field mapping process
    await test.step('Start field mapping', async () => {
      await page.click('text=Start Mapping');
      await expect(page.locator('h1:has-text("Map Your Field")')).toBeVisible();
    });

    // Fill in field details
    await test.step('Fill field details', async () => {
      await page.fill('input[name="fieldName"]', 'Test Field');
      await page.fill('textarea[name="description"]', 'Test field for automated testing');
      
      // Select soil type
      await page.click('button[aria-label="Select soil type"]');
      await page.click('text=Loamy');
      
      // Select crop type
      await page.click('button[aria-label="Select crop type"]');
      await page.click('text=Maize');
    });

    // Mark field boundaries
    await test.step('Mark field boundaries', async () => {
      // This would interact with the map component
      // For now, we'll just click a button that simulates completing this step
      await page.click('button:has-text("Mark Boundary")');
      
      // Wait for the map to be ready
      await page.waitForTimeout(1000);
      
      // Click to add points (simulating user clicks on the map)
      const mapContainer = page.locator('.map-container');
      const { width, height } = await mapContainer.boundingBox() || { width: 0, height: 0 };
      
      // Click to add a polygon (in a real test, you'd click actual map coordinates)
      await mapContainer.click({
        position: { x: width * 0.3, y: height * 0.3 }
      });
      await mapContainer.click({
        position: { x: width * 0.7, y: height * 0.3 }
      });
      await mapContainer.click({
        position: { x: width * 0.7, y: height * 0.7 }
      });
      await mapContainer.click({
        position: { x: width * 0.3, y: height * 0.7 }
      });
      
      // Complete the polygon
      await page.click('button:has-text("Complete Boundary")');
    });

    // Submit the form
    await test.step('Submit field mapping', async () => {
      await page.click('button:has-text("Save Field")');
      
      // Wait for the success message
      await expect(page.locator('text=Field mapped successfully')).toBeVisible({
        timeout: 10000
      });
    });

    // Verify AI suggestions are shown
    await test.step('Verify AI suggestions', async () => {
      await expect(page.locator('h2:has-text("AI Recommendations")')).toBeVisible();
      
      // Check that we have at least one recommendation
      const recommendations = page.locator('.recommendation-card');
      await expect(recommendations).toHaveCount(3);
      
      // Take a screenshot for debugging
      await page.screenshot({ path: 'test-results/field-mapping-success.png' });
    });
  });

  test('Field mapping shows validation errors', async ({ page }) => {
    // Start the field mapping process
    await page.click('text=Start Mapping');
    
    // Try to submit without filling required fields
    await page.click('button:has-text("Save Field")');
    
    // Verify validation errors
    await expect(page.locator('text="Field name is required"')).toBeVisible();
    await expect(page.locator('text="Please mark the field boundary"')).toBeVisible();
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/field-mapping-validation.png' });
  });
});
