const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1400, height: 900 });

  // ── Step 1: Navigate ──────────────────────────────────────────────────────
  console.log('\nStep 1: Navigating to http://localhost:3001...');
  await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });

  // Confirm initial state
  const headerText = await page.locator('header').innerText();
  console.log(`  -> Header content: ${headerText.replace(/\n/g, ' | ').trim()}`);
  await page.screenshot({ path: 'screenshot-01-initial.png' });
  console.log('  -> Step 1 OK. Screenshot: screenshot-01-initial.png');

  // First navigate to a different week (Jan 6) so we can demonstrate selecting Feb 23 week
  // Click the ← button 7 times to go back 7 weeks (currently at week 8, i.e. Feb 23)
  // Actually let's navigate back 1 week first so we can then select Feb 23 via calendar
  console.log('\n  (Navigating back 1 week to demonstrate calendar selection...)');
  await page.locator('button[aria-label="Previous week"]').click();
  await page.waitForTimeout(400);
  const labelAfterBack = await page.locator('header span.min-w-\\[160px\\]').innerText();
  console.log(`  -> Week label after ← click: "${labelAfterBack}"`);

  // ── Step 2: Hover over the week navigation area to reveal calendar ─────────
  console.log('\nStep 2: Hovering over the week navigation area to reveal calendar...');

  // The WeekPicker is a div with class "relative" inside the header flex row
  // It contains the ← label → buttons. We hover the whole wrapper.
  const weekPickerWrapper = page.locator('header div.relative').first();
  await weekPickerWrapper.hover();
  await page.waitForTimeout(600); // allow the open state to render

  // Check if calendar is visible
  const calendarVisible = await page.locator('text=January 2026').isVisible().catch(() => false);
  console.log(`  -> Calendar visible: ${calendarVisible}`);

  await page.screenshot({ path: 'screenshot-02-hover-calendar.png' });
  console.log('  -> Screenshot: screenshot-02-hover-calendar.png');

  if (!calendarVisible) {
    console.log('  !! Calendar not visible after hover — trying mouse.move approach...');
    const bb = await weekPickerWrapper.boundingBox();
    await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2);
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'screenshot-02b-hover-retry.png' });
    console.log('  -> Retry screenshot: screenshot-02b-hover-retry.png');
  }

  // ── Step 3: Click a day in the week of Feb 23 – Mar 1 ────────────────────
  console.log('\nStep 3: Clicking a day in the Feb 23 – Mar 1 week in the calendar...');

  // The calendar has day cells as divs with cursor-pointer.
  // Feb 23 is a Monday — it's the first day of that week row.
  // We look for the text "23" inside the February month grid.
  // Strategy: find the "February 2026" heading, then look for "23" nearby.

  // All day cells are divs containing a span with the day number.
  // We find the span with text "23" that is inside the Feb month section.
  // Since the calendar shows Jan, Feb, Mar columns side by side, we find "23" in February context.

  // First ensure the calendar is open (keep mouse in the hover zone)
  const calNow = await page.locator('text=February 2026').isVisible().catch(() => false);
  if (!calNow) {
    await weekPickerWrapper.hover();
    await page.waitForTimeout(600);
  }

  // The calendar dropdown is absolutely positioned below the trigger.
  // Find the February 2026 section and then find the "23" cell within it.
  const feb2026Section = page.locator('p:has-text("February 2026")').first();
  const febVisible = await feb2026Section.isVisible().catch(() => false);
  console.log(`  -> "February 2026" heading visible: ${febVisible}`);

  if (febVisible) {
    // The MonthGrid for February is the parent div of this heading.
    // The day "23" span is a sibling structure inside the same MonthGrid div.
    // Let's get all spans with text "23" and pick the one in the Feb section.
    const allSpans = await page.locator('span').all();
    let clicked23 = false;
    for (const span of allSpans) {
      const txt = (await span.innerText().catch(() => '')).trim();
      if (txt === '23') {
        // Check it's visible
        const vis = await span.isVisible().catch(() => false);
        if (vis) {
          // Check it's inside the calendar dropdown (has cursor-pointer parent)
          const parent = span.locator('..');
          const parentClass = await parent.getAttribute('class').catch(() => '');
          if (parentClass && parentClass.includes('cursor-pointer')) {
            // Hover the parent to keep calendar open, then click
            await parent.hover();
            await page.waitForTimeout(200);
            await parent.click();
            console.log('  -> Clicked day "23" in calendar');
            clicked23 = true;
            break;
          }
        }
      }
    }
    if (!clicked23) {
      console.log('  !! Could not find clickable "23" cell — trying locator approach');
      // Try direct approach: find clickable div containing span "23"
      // inside the calendar dropdown (z-50 positioned div)
      const calDropdown = page.locator('div.absolute.left-1\\/2');
      const day23 = calDropdown.locator('div.cursor-pointer span:text-is("23")').first();
      await day23.click();
      console.log('  -> Clicked via calDropdown locator');
    }
  } else {
    console.log('  !! February 2026 section not found in calendar');
  }

  await page.waitForTimeout(500);
  const labelAfterCalendar = await page.locator('header span.min-w-\\[160px\\]').innerText();
  console.log(`  -> Week label after calendar click: "${labelAfterCalendar}"`);
  await page.screenshot({ path: 'screenshot-03-after-calendar-select.png' });
  console.log('  -> Screenshot: screenshot-03-after-calendar-select.png');

  // ── Step 4: Click "Roma" store name in the Weekly Summary table header ──────
  console.log('\nStep 4: Clicking "Roma" in the Weekly Summary table header...');

  // The MetricTable thead has store name buttons/elements.
  // From the code, MetricTable renders th elements with store names.
  // Let's find the exact "Roma" in a thead context.
  const romaInHeader = page.locator('thead th:has-text("Roma"), thead td:has-text("Roma")').first();
  const romaHeaderVisible = await romaInHeader.isVisible().catch(() => false);
  console.log(`  -> Roma in thead visible: ${romaHeaderVisible}`);

  if (romaHeaderVisible) {
    await romaInHeader.click();
    console.log('  -> Clicked Roma in thead');
  } else {
    // Fallback: look for any clickable element with exact text "Roma"
    // that is in the table header area
    const romaCandidates = await page.locator('text="Roma"').all();
    console.log(`  -> Found ${romaCandidates.length} elements with text "Roma"`);
    for (const el of romaCandidates) {
      const visible = await el.isVisible().catch(() => false);
      const tag = await el.evaluate((e) => e.tagName).catch(() => '');
      const cls = await el.getAttribute('class').catch(() => '');
      console.log(`     tag=${tag} visible=${visible} class="${cls}"`);
    }
    // Click the first visible one
    for (const el of romaCandidates) {
      if (await el.isVisible().catch(() => false)) {
        await el.click();
        console.log('  -> Clicked first visible Roma element');
        break;
      }
    }
  }

  await page.waitForTimeout(800);
  await page.screenshot({ path: 'screenshot-04-after-roma-click.png' });
  console.log('  -> Screenshot: screenshot-04-after-roma-click.png');

  // ── Step 5: Capture the Roma store detail view ────────────────────────────
  console.log('\nStep 5: Verifying Roma detail view and taking final screenshot...');

  const romaDetailHeading = await page.locator('text=/Roma.*all metrics/').isVisible().catch(() => false);
  const allStoresBtn = await page.locator('text="← All stores"').isVisible().catch(() => false);
  console.log(`  -> "Roma — all metrics by week" heading visible: ${romaDetailHeading}`);
  console.log(`  -> "← All stores" button visible: ${allStoresBtn}`);

  const finalLabel = await page.locator('header span.min-w-\\[160px\\]').innerText();
  console.log(`  -> Active week label: "${finalLabel}"`);

  await page.screenshot({ path: 'screenshot-05-roma-detail-final.png' });
  console.log('  -> Final screenshot: screenshot-05-roma-detail-final.png');

  await browser.close();
  console.log('\nAll steps complete.');
})();
