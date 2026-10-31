const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

  // Wait for campaigns table
  const row = await page.$('table tbody tr');
  if (row) {
    await row.click();
    await page.waitForSelector('.score-circle', { timeout: 8000 });
    const scoreText = await page.$eval('.score-circle', el => el.textContent.trim());
    console.log('Campaign Score:', scoreText);

    const findingsCount = await page.$$eval('.finding-card', cards => cards.length);
    console.log('Total Finding Cards:', findingsCount);
  }
  await browser.close();
})();

