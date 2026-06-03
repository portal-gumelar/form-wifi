import puppeteer from 'puppeteer';
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/dashboard');
  await page.waitForSelector('body');
  const html = await page.evaluate(() => document.body.innerHTML);
  console.log(html);
  await browser.close();
})();
