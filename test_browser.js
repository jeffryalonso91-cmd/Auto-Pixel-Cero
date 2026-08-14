import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

  await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle0' });
  
  // Login if needed (since I removed the hardcoded password, wait, how can I login?)
  // Let me just set the sessionStorage to bypass login
  await page.evaluate(() => {
    sessionStorage.setItem('admin_auth', 'true');
    sessionStorage.setItem('admin_user', 'jeffryalonso');
  });
  
  await page.reload({ waitUntil: 'networkidle0' });
  
  // Click Ajustes de Tienda
  const tabs = await page.$$('button');
  for (const tab of tabs) {
    const text = await page.evaluate(el => el.textContent, tab);
    if (text.includes('Ajustes de Tienda')) {
      console.log('Clicking tab:', text);
      await tab.click();
      break;
    }
  }
  
  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
})();
