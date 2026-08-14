import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  await page.goto('http://localhost:3000/#admin', { waitUntil: 'networkidle0' });
  
  await page.evaluate(() => {
    sessionStorage.setItem('admin_auth', 'true');
    sessionStorage.setItem('admin_user', 'jeffryalonso');
  });
  
  await page.reload({ waitUntil: 'networkidle0' });
  
  await page.waitForSelector('button');
  
  const tabs = await page.$$('button');
  console.log(`Found ${tabs.length} buttons`);
  for (const tab of tabs) {
    const text = await page.evaluate(el => el.textContent, tab);
    console.log('Button text:', text);
    if (text.includes('Ajustes de Tienda')) {
      console.log('Clicking tab:', text);
      await tab.click();
      break;
    }
  }
  
  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
})();
