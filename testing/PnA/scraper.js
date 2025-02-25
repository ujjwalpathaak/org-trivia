import puppeteer from 'puppeteer';

(async () => {
  const url =
    'https://www.indiabix.com/verbal-reasoning/direction-sense-test/001004';

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'load', timeout: 0 });

  const data = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.bix-div-container')).map(
      (question) => {
        const text = question.querySelector('.bix-td-qtxt')?.innerText.trim();
        const img = question.querySelector('.bix-td-qtxt img')?.src || null;
        const options = Array.from(
          question.querySelectorAll('.bix-td-option-val'),
        ).map((opt) => opt.innerText.trim());

        return { text, img, options };
      },
    );
  });

  console.log(data); // Display the extracted data
  await browser.close();
})();
