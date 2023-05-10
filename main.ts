import puppeteer from "puppeteer";

const notifier = require("node-notifier");

async function checkHut({
  hutId,
  daysToBook,
  minAvailability,
}: {
  hutId: number;
  daysToBook: number;
  minAvailability: number;
}) {
  try {
    const browser = await puppeteer.launch();

    const page = await browser.newPage();
    await page.goto(
      `https://www.alpsonline.org/reservation/calendar?lang=de_CH&hut_id=${hutId}`
    );
    await page.waitForNetworkIdle({ idleTime: 500 });
    await page.click("input.datePicker", { clickCount: 3 });
    await page.type("input.datePicker", "26.05.2023");
    await page.keyboard.down("Enter");
    await page.waitForNetworkIdle({ idleTime: 500 });

    const dayIds = Array.from(Array(daysToBook).keys()).map(
      (day) => `#freePlaces${day}-1`
    );
    const dayValues = await Promise.all(
      dayIds.map((id) => page.$eval(id, (el) => el.innerHTML))
    );
    const dayNumbers = dayValues.map((text) => parseInt(text));

    console.log(dayValues);
    console.log(dayNumbers);

    if (dayNumbers.every((number) => number >= minAvailability)) {
      notifier.notify({
        message: `Places found for hut ${hutId}!`,
        timeout: 99999999999,
      });
    }

    await browser.close();
  } catch (error) {
    console.error(error);
  }
}

checkHut({ daysToBook: 3, hutId: 32, minAvailability: 4 }); // Hundsteinhutte
checkHut({ daysToBook: 3, hutId: 5, minAvailability: 4 }); // Lindernenhutte
