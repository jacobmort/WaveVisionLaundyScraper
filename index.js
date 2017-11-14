const puppeteer = require("puppeteer");
const config = require("./wave-credentials.js");

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  page.on("console", msg => console.log("PAGE LOG:", ...msg.args));
  await page.goto("https://www.mywavevision.com/Index.aspx");
  await page.waitFor("#txtUserID");
  await page.type("#txtUserID", config.username);
  await page.type("#txtPassword", config.password);
  await page.click("#btnLogin");
  await page.waitFor("#HeaderContent");
  await page.goto("https://www.mywavevision.com/RoomStatusV2.aspx", {
    timeout: 90000
  });

  const machines = await page.evaluate(() => {
    const machines = document.querySelectorAll("tr.List");
    let results = [];
    machines.forEach(machine => {
      let name = machine
        .getElementsByTagName("td")[0]
        .getElementsByTagName("span")[0].innerHTML;
      let type = machine
        .getElementsByTagName("td")[1]
        .getElementsByTagName("span")[0].innerHTML;
      let status = machine
        .getElementsByTagName("td")[2]
        .getElementsByTagName("span")[0].innerHTML;
      results.push({
        name: name,
        type: type,
        status: status
      });
    });
    return results;
  });
  let washersInUse = 0;
  let dryersInUse = 0;
  machines.forEach(machine => {
    if (machine.status !== "Available") {
      if (machine.type === "Washer") {
        washersInUse += 1;
      } else if (machine.type === "Stack") {
        dryersInUse += 1;
      }
    }
  });
  console.log(`${Date()}, ${washersInUse}, ${dryersInUse}`);

  await browser.close();
})();
