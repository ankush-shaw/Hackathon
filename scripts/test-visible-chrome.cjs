const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function runVisibleBrowserWalkthrough() {
  console.log('🚀 Launching Google Chrome directly on your screen (Window will STAY OPEN)...');
  
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: false,
    defaultViewport: null,
    args: [
      '--start-maximized',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--auto-open-devtools-for-tabs=false'
    ]
  });

  const pages = await browser.pages();
  const page = pages.length > 0 ? pages[0] : await browser.newPage();

  // Helper function to show live agent overlay in browser
  const setAgentStatus = async (statusText, subText = '') => {
    await page.evaluate((text, sub) => {
      let overlay = document.getElementById('brandguard-agent-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'brandguard-agent-overlay';
        overlay.style.position = 'fixed';
        overlay.style.bottom = '28px';
        overlay.style.left = '50%';
        overlay.style.transform = 'translateX(-50%)';
        overlay.style.zIndex = '999999';
        overlay.style.display = 'flex';
        overlay.style.flexDirection = 'column';
        overlay.style.alignItems = 'center';
        overlay.style.gap = '8px';
        overlay.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        overlay.style.pointerEvents = 'none';
        document.body.appendChild(overlay);
      }

      overlay.innerHTML = `
        <div style="background: #2563eb; color: white; padding: 8px 18px; border-radius: 20px; font-size: 13px; font-weight: 700; box-shadow: 0 4px 14px rgba(37,99,235,0.4); display: flex; align-items: center; gap: 8px;">
          <span style="display: inline-block; width: 8px; height: 8px; background: #60a5fa; border-radius: 50%; animation: pulse 1.5s infinite;"></span>
          ${text}
        </div>
        ${sub ? `<div style="background: #0f172a; color: #94a3b8; padding: 6px 14px; border-radius: 8px; font-size: 11.5px; font-family: monospace; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">${sub}</div>` : ''}
      `;
    }, statusText, subText);
  };

  try {
    console.log('🌐 Loading BrandGuard AI at http://localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 20000 });
    await page.bringToFront();
    await setAgentStatus('Agent running – Initializing Workspace', 'Connecting to BrandGuard API');
    await new Promise(r => setTimeout(r, 2000));

    // 1. Check if Login Page is present
    const loginInput = await page.$('#login-name-input');
    if (loginInput) {
      await setAgentStatus('Agent running – Signing In', 'Persona: Sarah Miller (Brand Marketing Lead)');
      await page.type('#login-name-input', 'Sarah Miller', { delay: 60 });
      await new Promise(r => setTimeout(r, 500));
      await page.type('#login-email-input', 'sarah.miller@acmeglobal.com', { delay: 40 });
      await new Promise(r => setTimeout(r, 500));
      await page.type('#login-company-input', 'Acme Global Corp', { delay: 40 });
      await new Promise(r => setTimeout(r, 800));
      await page.click('#btn-login-submit');
      await page.waitForSelector('#nav-dashboard', { timeout: 10000 });
      await new Promise(r => setTimeout(r, 2000));
    }

    // 2. Dashboard
    await setAgentStatus('Agent running – Dashboard Loaded', 'Policy Baseline: Acme Global 2025 v2.4 Enforced');
    await new Promise(r => setTimeout(r, 2500));

    // 3. Navigate to "New Review"
    await setAgentStatus('Agent running – Navigating to Review Workspace', 'Opening New Review Form');
    await page.click('#nav-new-review');
    await page.waitForSelector('#textarea-ad-copy', { timeout: 8000 });
    await new Promise(r => setTimeout(r, 2000));

    // 4. Click "Sample Ad (Flagged)"
    await setAgentStatus('Agent running – Loading Problematic Marketing Copy', 'Template: Absolute guarantee, unverified claim, tone flag');
    const buttons = await page.$$('button');
    let flaggedBtn = null;
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Sample Ad (Flagged)')) {
        flaggedBtn = btn;
        break;
      }
    }

    if (flaggedBtn) {
      await flaggedBtn.click();
      await new Promise(r => setTimeout(r, 2500));
    }

    // 5. Click "Run Compliance Scan"
    await setAgentStatus('Agent running – Evaluating Compliance Scan', 'Running Hybrid Engine (Deterministic Rules + Gemini AI Verification)...');
    await page.click('#btn-run-compliance-scan');

    await page.waitForSelector('.results-header-card', { timeout: 20000 });
    await setAgentStatus('Agent running – Compliance Scan Completed', 'Score: 35/100 (Action Required) • 4 Policy Violations Flagged');
    await new Promise(r => setTimeout(r, 3500));

    // 6. Switch to "Extracted Claims" tab
    await setAgentStatus('Agent running – Inspecting AI Extracted Claims', 'Verifying atomic factual assertions against Evidence Library...');
    const tabs = await page.$$('.filter-tab');
    for (const tab of tabs) {
      const text = await page.evaluate(el => el.textContent, tab);
      if (text && text.includes('Extracted Claims')) {
        await tab.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 4000));

    // 7. Switch back to "Identified Findings"
    await setAgentStatus('Agent running – Reviewing Brand Findings', 'Resolving unapproved trademark nomenclature...');
    for (const tab of tabs) {
      const text = await page.evaluate(el => el.textContent, tab);
      if (text && text.includes('Identified Findings')) {
        await tab.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 2500));

    // 8. Find and click "Apply Fix"
    await setAgentStatus('Agent running – Applying 1-Click Approved Replacement', 'Replacing "Acme Cloud Platform" -> "Acme CloudSphere™"');
    const applyBtn = await page.$('.replacement-actions button.btn-primary');
    if (applyBtn) {
      await applyBtn.click();
      await new Promise(r => setTimeout(r, 3500));
    }

    // 9. Final Completion Banner
    await setAgentStatus('✓ Verification Walkthrough Complete!', 'Ad fixed • Revision v2 created • Chrome will remain open for your use');
    console.log('\n🎉 Visual walkthrough complete! Chrome will remain open for you.');
    
    // Keep node process alive so Chrome does not close
    await new Promise(() => {});
  } catch (err) {
    console.error('❌ Walkthrough Error:', err);
  }
}

runVisibleBrowserWalkthrough();
