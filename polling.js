const puppeteer = require("puppeteer");

// all params
const URL = "";
const SCHEDULE_LINK_SELECTOR = "#ctl00_plhMain_lnkSchApp";
const LOCATION_SELECTOR = "#ctl00_plhMain_cboVAC";
const LOCATION_SELECTOR_VALUE = "7";
const SERVICE_SELECTOR = "#ctl00_plhMain_cboVisaCategory";
const SERVICE_SELECTOR_VALUE = "4";
const SLOT_INFO_SELECTOR = "#ctl00_plhMain_lblMsg";
const TIMEOUT = 1000 * 60 * 10;

const getNextSlotInfo = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(URL);
  await page.waitForSelector(SCHEDULE_LINK_SELECTOR);
  await page.click(SCHEDULE_LINK_SELECTOR);
  await page.waitForSelector(LOCATION_SELECTOR);
  await page.select(LOCATION_SELECTOR, LOCATION_SELECTOR_VALUE);
  await page.waitForSelector(SERVICE_SELECTOR);
  await page.select(SERVICE_SELECTOR, SERVICE_SELECTOR_VALUE);
  await page.waitForSelector(SLOT_INFO_SELECTOR);
  const slotText = await page.evaluate(
    selector => document.querySelector(selector).textContent,
    SLOT_INFO_SELECTOR
  );
  await browser.close();
  return slotText;
};

const printInfo = () =>
  setTimeout(async () => {
    console.log(Date(), await getNextSlotInfo());
    printInfo();
  }, TIMEOUT);

printInfo();
