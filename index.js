import puppeteer from "puppeteer";

(async () => {
  const browser = await puppeteer.launch({
    defaultViewport: {width: 1280, height: 900},
  });

  await Promise.all([
    check({
      url: "https://www.amazon.com/PlayStation-5-Console/dp/B08FC5L3RG/",
      selector: "#availability",
      text: "unavailable",
    }),
    check({
      url:
        "https://www.bestbuy.com/site/sony-playstation-5-digital-edition-console/6430161.p?skuId=6430161",
      selector: ".fulfillment-add-to-cart-button",
      text: "coming soon",
    }),
    check({
      url:
        "https://www.target.com/p/playstation-5-digital-edition-console/-/A-81114596",
      selector: "[data-test='preorderFulfillment']",
      text: "sold out",
    }),
    check({
      url:
        "https://www.gamestop.com/video-games/playstation-5/consoles/products/playstation-5-digital-edition/11108141.html",
      selector: ".add-to-cart-buttons",
      text: "not available",
    }),
  ]);

  browser.close();

  async function check({url, selector, text}) {
    const [, name] = url.match(/([^.]+).com/);
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36"
    );
    await page.goto(url);
    const element = await page.$(selector);
    if (element) {
      await element.screenshot({path: `${name}.png`});
      const innerText = await element.getProperty("innerText");
      if ((await innerText.jsonValue()).toLowerCase().includes(text))
        return console.log(`🔴 ${name}: unavailable`);
    }
    await page.screenshot({path: `${name}.png`});
    console.log(`🟢 ${name}: available?!`);
  }
})();
