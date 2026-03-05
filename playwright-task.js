const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const page = await browser.newPage();
  page.setViewportSize({ width: 1400, height: 900 });

  // Step 1: Navigate to the app
  console.log('Step 1: Navigating to http://localhost:3001...');
  await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'screenshot-01-initial.png', fullPage: false });
  console.log('  -> Page loaded. Screenshot saved: screenshot-01-initial.png');

  // Step 2: Hover over the week navigation area to reveal calendar
  console.log('Step 2: Hovering over the week navigation area...');
  // The sticky header has week navigation with ← label →
  // Try hovering the week label / navigation container
  const weekNav = await page.locator('text=/Jan|Feb|Mar|week/i').first();
  const weekNavBB = await weekNav.boundingBox();
  console.log(`  -> Found week nav element at: ${JSON.stringify(weekNavBB)}`);
  await weekNav.hover();
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'screenshot-02-hover-week-nav.png', fullPage: false });
  console.log('  -> Hovered. Screenshot saved: screenshot-02-hover-week-nav.png');

  // Step 3: Click on a day in the week of Feb 23 – Mar 1
  console.log('Step 3: Looking for calendar and clicking a day in Feb 23 week...');
  await page.waitForTimeout(500);

  // Look for calendar elements - try "23" in February context
  // The calendar should show Feb 23 as a clickable cell
  const feb23 = await page.locator('button:has-text("23"), td:has-text("23"), [data-date*="2026-02-23"]').first();
  if (await feb23.isVisible()) {
    await feb23.click();
    console.log('  -> Clicked Feb 23 in calendar');
  } else {
    // Try looking for any visible calendar day cell
    console.log('  -> Trying alternative selectors for Feb 23...');
    // Take a screenshot first to see what's on screen
    await page.screenshot({ path: 'screenshot-03-calendar-visible.png', fullPage: false });
    console.log('  -> Screenshot saved: screenshot-03-calendar-visible.png');

    // Look for text 23 near February
    const allButtons = await page.locator('button').all();
    for (const btn of allButtons) {
      const txt = await btn.innerText().catch(() => '');
      if (txt.trim() === '23') {
        await btn.click();
        console.log('  -> Clicked button with text "23"');
        break;
      }
    }
  }

  await page.waitForTimeout(800);
  await page.screenshot({ path: 'screenshot-03-after-date-select.png', fullPage: false });
  console.log('  -> Screenshot saved: screenshot-03-after-date-select.png');

  // Step 4: Click on "Roma" in the MetricTable header
  console.log('Step 4: Clicking on "Roma" store name in the table header...');
  await page.waitForTimeout(500);

  // The table header has store names
  const romaHeader = await page.locator('th:has-text("Roma"), thead td:has-text("Roma"), thead th:has-text("Roma")').first();
  const romaVisible = await romaHeader.isVisible().catch(() => false);
  if (romaVisible) {
    await romaHeader.click();
    console.log('  -> Clicked Roma header cell');
  } else {
    // Try a more general approach
    const romaEl = await page.locator('text="Roma"').first();
    await romaEl.click();
    console.log('  -> Clicked Roma text element');
  }

  await page.waitForTimeout(1000);

  // Step 5: Take screenshot of Roma's store detail view
  console.log('Step 5: Taking screenshot of Roma store detail view...');
  await page.screenshot({ path: 'screenshot-05-roma-detail.png', fullPage: false });
  console.log('  -> Screenshot saved: screenshot-05-roma-detail.png');

  // Also full page
  await page.screenshot({ path: 'screenshot-05-roma-detail-full.png', fullPage: true });
  console.log('  -> Full page screenshot saved: screenshot-05-roma-detail-full.png');

  await browser.close();
  console.log('Done!');
})();
