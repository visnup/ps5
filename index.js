import puppeteer from "puppeteer";
import Twilio from "twilio";
const twilio = Twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

const sites = [
  {
    url: "https://www.amazon.com/dp/B08FC6MR62",
    selector: "#availability",
    text: "unavailable",
  },
  {
    url:
      "https://www.bestbuy.com/site/sony-playstation-5-digital-edition-console/6430161.p?skuId=6430161",
    selector: ".fulfillment-add-to-cart-button",
    text: "coming soon",
  },
  {
    url:
      "https://www.target.com/p/playstation-5-digital-edition-console/-/A-81114596",
    selector: "[data-test='preorderFulfillment']",
    text: "sold out",
  },
  {
    url:
      "https://www.gamestop.com/video-games/playstation-5/consoles/products/playstation-5-digital-edition/11108141.html",
    selector: ".add-to-cart-buttons",
    text: "not available",
  },
  {
    url:
      "https://www.walmart.com/ip/Sony-PlayStation-5-Digital-Edition/493824815",
    selector: ".error-page-message",
    text: "backorder",
  },
  {
    url:
      "https://www.bhphotovideo.com/c/product/1595084-REG/sony_3005719_playstation_5_digital_edition.html",
    selector: "[data-selenium='stockInfo']",
    text: "coming soon",
  },
  {
    url:
      "https://www.samsclub.com/p/ps5-pre-order/prod24980181?xid=plp_product_1_14",
    selector: ".sc-pc-large-desktop-oos-card-out-of-stock-text",
    text: "out of stock",
  },
];

(async () => {
  const site = sites.find((d) => d.url.includes(process.argv[2]));
  if (await check(site))
    console.log(
      await twilio.messages.create({
        body: `PS5 available?! ${site.url}`,
        from: process.env.TWILIO_FROM,
        to: process.env.TWILIO_TO,
      })
    );
  else process.exit(1);
})();

async function check({url, selector, text}) {
  const browser = await puppeteer.launch({
    defaultViewport: {width: 1280, height: 900},
  });
  try {
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
        return console.log(`🔴 ${name}: unavailable`), false;
    }
    await page.screenshot({path: `${name}.png`});
    console.log(`🟢 ${name}: available?!`);
    return true;
  } catch (e) {
    console.log(e);
    return false;
  } finally {
    browser.close();
  }
}
