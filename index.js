const fs = require("fs");
const puppeteer = require("puppeteer");

// all params
const DOMAIN = "";
const URL = `https://${DOMAIN}/`;
const URL_PROBLEM_SET = `https://${DOMAIN}/problemset/all/`;
const SIGN_IN_SELECTOR =
  "#landing-page-app > div > div.header > div.inner > div.landing-navbar-base > div > div > div.nav-right > div > a:nth-child(5)";
const USERNAME_INPUT_SELECTOR = "#id_login";
const PASSWORD_INPUT_SELECTOR = "#id_password";
const LOGIN_BUTTON_SELECTOR = "button[name=signin_btn]";
const PROBLEMS_LINK =
  "#lc_navbar > div > div.navbar-collapse.collapse > ul > li:nth-child(3) > a";
const PAGINATION_SELECTOR =
  "#question-app > div > div:nth-child(2) > div.question-list-base > div.table-responsive.question-list-table > table > tbody.reactable-pagination > tr > td > span.row-selector > select";
const PAGINATION_VALUE = "9007199254740991";
const USERNAME = "";
const PASSWORD = "";
const QUESTION_TR_NODE_LIST_SELECTOR =
  ".table-responsive.question-list-table .reactable-data tr";

const delay = async (time, value) =>
  new Promise(resolve => {
    setTimeout(resolve.bind(null, value), time);
  });

const writeFile = (path, json) =>
  new Promise((resolve, reject) => {
    fs.writeFile(path, JSON.stringify(json), err => {
      if (err) reject(err);
      resolve();
    });
  });

const launch = async () => {
  const browser = await puppeteer.launch({
    headless: false
  });
  const page = await browser.newPage();
  await page.goto(URL);
  await page.waitForSelector(SIGN_IN_SELECTOR);
  await page.click(SIGN_IN_SELECTOR);
  await page.waitForSelector(USERNAME_INPUT_SELECTOR);
  await page.type(USERNAME_INPUT_SELECTOR, USERNAME);
  await page.type(PASSWORD_INPUT_SELECTOR, PASSWORD);
  await page.click(LOGIN_BUTTON_SELECTOR);
  await page.waitForSelector(PROBLEMS_LINK);
  await page.goto(URL_PROBLEM_SET);
  await page.waitForSelector(PAGINATION_SELECTOR);
  await page.select(PAGINATION_SELECTOR, PAGINATION_VALUE);
  return { browser, page };
};

const prepareQuestionData = async page =>
  page.evaluate(trSelector => {
    const trNodes = [...document.querySelectorAll(trSelector)];
    return trNodes.map(tr => ({
      id: tr.children[1].textContent,
      title: tr.children[2].getAttribute("value"),
      href: tr.children[2].querySelector("a").getAttribute("href")
    }));
  }, QUESTION_TR_NODE_LIST_SELECTOR);

// mutate q, adds new key question
const processQuestion = async (page, q) => {
  await page.goto(`https://${DOMAIN}${q.href}`);
  await page.waitForSelector(".question-description");
  const basePath = `screenshots/${q.id}-${q.title
    .toLowerCase()
    .replace(" ", "_")}`;
  q.question = await page.evaluate(
    selector => document.querySelector(selector).textContent,
    ".question-description"
  );
  await page.screenshot({
    path: `${basePath}-question.png`,
    fullPage: true
  });
  await page.click("nav.tab-view a:nth-child(5)");
  await page.waitForSelector(
    ".solution-body, .btn.btn-success.suggest-hint-btn"
  );
  await page.screenshot({
    path: `${basePath}-solution.png`,
    fullPage: true
  });
};

const run = async () => {
  const { browser, page } = await launch();
  const questionData = await prepareQuestionData(page);
  for (const q of questionData) {
    await delay(1000);
    console.log(q);
    await processQuestion(page, q);
  }
  await browser.close();
  await writeFile("output.txt", questionData);
};

run();
