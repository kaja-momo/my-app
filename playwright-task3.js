const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1400, height: 900 });

  // ── Step 1: Navigate ──────────────────────────────────────────────────────
  console.log('\nStep 1: Navigating to http://localhost:3001...');
  await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
  const initialLabel = await page.locator('header span.min-w-\\[160px\\]').innerText();
  console.log(`  -> Initial week: "${initialLabel}"`);
  await page.screenshot({ path: 'screenshot-01-initial.png' });
  console.log('  -> Step 1 OK. Screenshot: screenshot-01-initial.png');

  // Navigate back 1 week so we can demonstrate selecting Feb 23 from the calendar
  await page.locator('button[aria-label="Previous week"]').click();
  await page.waitForTimeout(400);
  const labelAfterBack = await page.locator('header span.min-w-\\[160px\\]').innerText();
  console.log(`  -> Moved back one week to: "${labelAfterBack}"`);

  // ── Step 2: Hover over week navigation to reveal calendar ─────────────────
  console.log('\nStep 2: Hovering over the week navigation area...');
  const weekPickerWrapper = page.locator('header div.relative').first();
  await weekPickerWrapper.hover();
  await page.waitForTimeout(600);

  const calOpen = await page.locator('text=January 2026').isVisible().catch(() => false);
  console.log(`  -> Calendar dropdown open: ${calOpen}`);
  await page.screenshot({ path: 'screenshot-02-calendar-open.png' });
  console.log('  -> Screenshot: screenshot-02-calendar-open.png');

  // ── Step 3: Click Feb 23 in the calendar ─────────────────────────────────
  console.log('\nStep 3: Clicking Feb 23 in the calendar (week Feb 23 – Mar 1)...');

  // The calendar has three month grids side by side: January 2026, February 2026, March 2026.
  // Each MonthGrid is a div with a "p" heading (month name) and a grid of day cells.
  // We need the "February 2026" section's "23" cell specifically.
  //
  // Strategy: find the February 2026 heading element, get its parent MonthGrid div,
  // then find the span with text "23" inside that parent.

  // Keep calendar open by keeping mouse in the hover zone
  const calStillOpen = await page.locator('text=February 2026').isVisible().catch(() => false);
  if (!calStillOpen) {
    console.log('  -> Calendar closed, re-hovering...');
    await weekPickerWrapper.hover();
    await page.waitForTimeout(600);
  }

  // The February 2026 heading is a <p> element with text "February 2026"
  // Its grandparent (div > div > p) is the MonthGrid container.
  // Actually looking at the JSX: the MonthGrid returns a <div> with a <p> heading directly inside.
  // So the structure is: ..outer div.. > div.shrink-0 > div[MonthGrid] > p "February 2026"
  //                                                                      > div.grid (day headers)
  //                                                                      > div.grid (day cells)

  // Get the bounding box of the "February 2026" heading
  const febHeading = page.locator('p:text-is("February 2026")').first();
  const febHeadingBB = await febHeading.boundingBox();
  console.log(`  -> "February 2026" heading at: ${JSON.stringify(febHeadingBB)}`);

  // The month grid container is the parent of the heading
  // Use the heading's parent as the search scope
  const febGrid = febHeading.locator('xpath=..');
  const febGridBB = await febGrid.boundingBox();
  console.log(`  -> February month grid container at: ${JSON.stringify(febGridBB)}`);

  // Find all spans within the February grid and filter for "23"
  const feb23Span = febGrid.locator('span').filter({ hasText: /^23$/ }).first();
  const feb23Visible = await feb23Span.isVisible().catch(() => false);
  console.log(`  -> Feb 23 span visible within febGrid: ${feb23Visible}`);

  if (feb23Visible) {
    const feb23BB = await feb23Span.boundingBox();
    console.log(`  -> Feb 23 span at: ${JSON.stringify(feb23BB)}`);

    // The clickable div is the parent of this span — hover parent first, then click
    const clickableParent = feb23Span.locator('..');
    await clickableParent.hover();
    await page.waitForTimeout(200);

    // Take a screenshot showing the hover preview
    await page.screenshot({ path: 'screenshot-03a-feb23-hover.png' });
    console.log('  -> Hover preview screenshot: screenshot-03a-feb23-hover.png');

    await clickableParent.click();
    console.log('  -> Clicked Feb 23 cell');
  } else {
    // Fallback: use coordinate click based on the February grid position
    console.log('  -> Span not found in grid scope, trying coordinate approach...');

    // Re-hover to keep calendar open
    await weekPickerWrapper.hover();
    await page.waitForTimeout(400);

    // From the screenshot, Feb 23 is in the last row of the February grid,
    // at the Monday column (leftmost). Get the February heading x-position
    // and click at the right y-coordinate for row 6 of the calendar.
    const febHeadingBB2 = await febHeading.boundingBox();
    if (febHeadingBB2) {
      // Day rows start about 30px below the heading for weekday labels,
      // then each row is ~32px tall. Feb 23 is in row 5 (0-indexed from week rows).
      // Jan: 1 is Th, so padLeft=3. Feb: 1 is Su, so padLeft=6.
      // Feb 23 falls in row 4 (0-indexed): rows 0–3 cover Feb 2-22, row 4 starts Feb 23.
      const dayHeaderHeight = 28; // h-7 = 28px
      const rowHeight = 32; // h-8 = 32px
      const headingHeight = 28; // p element height approx
      const marginBeforeHeader = 8; // mb-2
      const feb23Y = febHeadingBB2.y + headingHeight + marginBeforeHeader + dayHeaderHeight + (4 * rowHeight) + rowHeight / 2;
      const feb23X = febHeadingBB2.x + 16; // Monday = leftmost column, first cell center

      console.log(`  -> Coordinate click at (${feb23X}, ${feb23Y})`);
      await page.mouse.move(feb23X, feb23Y);
      await page.waitForTimeout(200);
      await page.screenshot({ path: 'screenshot-03a-hover-coord.png' });
      await page.mouse.click(feb23X, feb23Y);
    }
  }

  await page.waitForTimeout(600);
  const labelAfterCal = await page.locator('header span.min-w-\\[160px\\]').innerText();
  console.log(`  -> Week label after calendar click: "${labelAfterCal}"`);
  await page.screenshot({ path: 'screenshot-03-after-date-select.png' });
  console.log('  -> Screenshot: screenshot-03-after-date-select.png');

  const correctWeekSelected = labelAfterCal.includes('Feb 23') || labelAfterCal.includes('Mar 1');
  console.log(`  -> Correct week (Feb 23 – Mar 1) selected: ${correctWeekSelected}`);

  // ── Step 4: Click "Roma" in the Weekly Summary table header ──────────────
  console.log('\nStep 4: Clicking "Roma" store name in the Weekly Summary table header...');

  // MetricTable renders thead with store name columns
  const romaCell = page.locator('thead').locator('th:has-text("Roma"), td:has-text("Roma")').first();
  const romaCellVisible = await romaCell.isVisible().catch(() => false);
  console.log(`  -> Roma header cell visible: ${romaCellVisible}`);

  if (romaCellVisible) {
    await romaCell.click();
    console.log('  -> Clicked Roma');
  } else {
    // Broader fallback
    const romaEl = page.locator('text="Roma"').first();
    await romaEl.click();
    console.log('  -> Clicked Roma (fallback)');
  }

  await page.waitForTimeout(700);
  await page.screenshot({ path: 'screenshot-04-roma-clicked.png' });
  console.log('  -> Screenshot: screenshot-04-roma-clicked.png');

  // ── Step 5: Verify Roma store detail and take final screenshot ───────────
  console.log('\nStep 5: Verifying Roma store detail view...');

  const detailHeading = await page.locator('text=/Roma.*all metrics/i').isVisible().catch(() => false);
  const allStoresBtn = await page.locator('text="← All stores"').isVisible().catch(() => false);
  const finalWeekLabel = await page.locator('header span.min-w-\\[160px\\]').innerText();

  console.log(`  -> Roma detail heading visible: ${detailHeading}`);
  console.log(`  -> "← All stores" button visible: ${allStoresBtn}`);
  console.log(`  -> Week in header: "${finalWeekLabel}"`);

  await page.screenshot({ path: 'screenshot-05-final-roma-detail.png' });
  console.log('  -> FINAL screenshot: screenshot-05-final-roma-detail.png');

  await browser.close();
  console.log('\nAll steps complete.');
})();
