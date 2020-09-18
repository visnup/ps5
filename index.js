import puppeteer from "puppeteer";
import Twilio from "twilio";
const twilio = Twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

const sites = [
  {
    url: "https://www.amazon.com/PlayStation-5-Console/dp/B08FC5L3RG/",
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
];

(async () => {
  const browser = await puppeteer.launch({
    defaultViewport: {width: 1280, height: 900},
  });

  const availability = await Promise.all(
    sites.map(async (site) => ({...site, available: await check(site)}))
  );
  browser.close();

  const available = availability.filter((d) => d.available);
  for (const {url} of available)
    console.log(
      await twilio.messages.create({
        body: `PS5 available?! ${url}`,
        from: "+16507350005",
        to: "+14153057168",
      })
    );

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
        return console.log(`🔴 ${name}: unavailable`), false;
    }
    await page.screenshot({path: `${name}.png`});
    console.log(`🟢 ${name}: available?!`);
    return true;
  }
})();
