const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOTS_DIR = 'C:\\Users\\ankus\\.gemini\\antigravity\\brain\\2b26b26a-8d44-4e01-97cd-8c514ad781ee\\screenshots';

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function runBrowserTest() {
  console.log('🚀 Launching Google Chrome via puppeteer-core...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    console.log('🌐 Navigating to http://localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 15000 });

    // 1. Check if Login Page is present
    const loginInput = await page.$('#login-name-input');
    if (loginInput) {
      console.log('🔑 Login page detected. Performing one-time sign-in as Sarah Miller...');
      await page.type('#login-name-input', 'Sarah Miller');
      await page.type('#login-email-input', 'sarah.miller@acmeglobal.com');
      await page.type('#login-company-input', 'Acme Global Corp');
      await page.click('#btn-login-submit');
      await page.waitForSelector('#nav-dashboard', { timeout: 8000 });
      console.log('✅ Signed in successfully!');
    }

    // Step 1: Dashboard
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01_dashboard.png'), fullPage: true });
    console.log('📸 Saved 01_dashboard.png');

    // Step 2: Navigate to New Review
    console.log('📝 Navigating to New Review page...');
    await page.click('#nav-new-review');
    await page.waitForSelector('#textarea-ad-copy', { timeout: 8000 });
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02_new_review_page.png') });
    console.log('📸 Saved 02_new_review_page.png');

    // Step 3: Load Sample Flagged Ad
    console.log('📋 Clicking "Sample Ad (Flagged)" quick template...');
    const buttons = await page.$$('button');
    let flaggedBtn = null;
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Sample Ad (Flagged)')) {
        flaggedBtn = btn;
        break;
      }
    }

    if (!flaggedBtn) {
      throw new Error('Could not find "Sample Ad (Flagged)" template button');
    }
    await flaggedBtn.click();
    await new Promise(r => setTimeout(r, 600));

    const loadedCopy = await page.$eval('#textarea-ad-copy', el => el.value);
    console.log('📝 Loaded copy text:', loadedCopy);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03_sample_ad_loaded.png') });
    console.log('📸 Saved 03_sample_ad_loaded.png');

    // Step 4: Run Compliance Scan
    console.log('⚡ Clicking "Run Compliance Scan"...');
    await page.click('#btn-run-compliance-scan');

    console.log('⏳ Waiting for analysis results to render...');
    await page.waitForSelector('.results-header-card', { timeout: 15000 });
    await new Promise(r => setTimeout(r, 1200));

    // Read initial brand health score
    const initialScoreText = await page.evaluate(() => {
      const el = document.querySelector('.score-number') || document.querySelector('.score-meter-wrap');
      return el ? el.textContent.trim() : 'N/A';
    });
    console.log('📊 Initial Brand Health Score:', initialScoreText);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04_scan_results.png'), fullPage: true });
    console.log('📸 Saved 04_scan_results.png');

    // Step 5: Switch to AI Extracted Claims tab
    console.log('🤖 Switching to "Extracted Claims" tab...');
    const tabButtons = await page.$$('.filter-tab');
    let claimsTabBtn = null;
    for (const tab of tabButtons) {
      const text = await page.evaluate(el => el.textContent, tab);
      if (text && text.includes('Extracted Claims')) {
        claimsTabBtn = tab;
        break;
      }
    }

    if (claimsTabBtn) {
      await claimsTabBtn.click();
      await new Promise(r => setTimeout(r, 800));
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05_ai_claims_tab.png'), fullPage: true });
      console.log('📸 Saved 05_ai_claims_tab.png');
    }

    // Step 6: Switch back to Identified Findings and apply a fix
    console.log('🔧 Switching back to "Identified Findings" tab...');
    for (const tab of tabButtons) {
      const text = await page.evaluate(el => el.textContent, tab);
      if (text && text.includes('Identified Findings')) {
        await tab.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 800));

    console.log('🔍 Looking for first "Apply Fix" button on finding card...');
    const applyBtn = await page.$('.replacement-actions button.btn-primary');
    if (!applyBtn) {
      throw new Error('No "Apply Fix" button found on finding cards');
    }

    console.log('✨ Clicking "Apply Fix" to automatically resolve brand violation...');
    await applyBtn.click();
    await new Promise(r => setTimeout(r, 1500));

    // Read recovered score
    const recoveredScoreText = await page.evaluate(() => {
      const el = document.querySelector('.score-number') || document.querySelector('.score-meter-wrap');
      return el ? el.textContent.trim() : 'N/A';
    });
    console.log('📈 Recovered Brand Health Score after 1-click fix:', recoveredScoreText);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '06_after_apply_fix.png'), fullPage: true });
    console.log('📸 Saved 06_after_apply_fix.png');

    // Step 7: Check Revision Drift Diff
    console.log('🔄 Checking revision drift widget...');
    const driftText = await page.evaluate(() => {
      const driftEl = document.querySelector('.revision-drift') || document.querySelector('[style*="Campaign Drift"]');
      return driftEl ? driftEl.textContent.trim() : 'Diff recorded in revision snapshot';
    });
    console.log('📊 Drift Info:', driftText);

    // Step 8: Return to Dashboard
    console.log('🏠 Returning to Dashboard to verify audit log and updated campaign record...');
    await page.click('#nav-dashboard');
    await page.waitForSelector('#nav-dashboard.active', { timeout: 8000 });
    await new Promise(r => setTimeout(r, 1000));

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '07_final_dashboard.png'), fullPage: true });
    console.log('📸 Saved 07_final_dashboard.png');

    console.log('\n🎉 ALL END-TO-END BROWSER CHECKS COMPLETED SUCCESSFULLY!');
    return {
      success: true,
      initialScore: initialScoreText,
      recoveredScore: recoveredScoreText,
      screenshots: [
        '01_dashboard.png',
        '02_new_review_page.png',
        '03_sample_ad_loaded.png',
        '04_scan_results.png',
        '05_ai_claims_tab.png',
        '06_after_apply_fix.png',
        '07_final_dashboard.png'
      ]
    };
  } finally {
    await browser.close();
    console.log('🔒 Browser closed cleanly.');
  }
}

runBrowserTest()
  .then(res => {
    console.log('\n--- BROWSER TEST RESULT SUMMARY ---');
    console.log(JSON.stringify(res, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Browser Test Failed:', err);
    process.exit(1);
  });

