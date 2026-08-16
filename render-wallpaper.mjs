import { chromium } from "playwright";
import { pathToFileURL } from "node:url";
import path from "node:path";

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  timezoneId: "Europe/Stockholm"
});
const page = await context.newPage();
await page.goto(pathToFileURL(path.resolve("index.html")).href);
await page.screenshot({ path: "wallpaper.png", fullPage: false });
await browser.close();
