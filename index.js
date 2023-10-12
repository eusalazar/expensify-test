const  fs   = require("fs");
const { writeFile } = require("fs/promises");
const puppeteer  = require("puppeteer");
const  puppeteerCore  = require("puppeteer-core");

function writeVersionToFile(version) {
  fs.writeFileSync('version.txt', version, 'utf8');
}

function delay(time) {
  return new Promise(function(resolve) { 
      setTimeout(resolve, time)
  });
}

function extractVersion(inputString) {
  //Defina un patrón de expresión regular para que coincida con el formato de la versión v1.3.74-2
  const versionPattern = /v\d+\.\d+\.\d+-\d+/;

  // Utilice la función match() para encontrar la primera aparición del patrón.
  const match = inputString.match(versionPattern);

  // Verifique si se encontró una coincidencia y devuélvala, o devuelva nulo si no se encontró ninguna coincidencia
  if (match) {
      return match[0];
  } else {
      return null;
  }
}

const runScript = async () => {
  const browser = await puppeteerCore.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: false,
    userDataDir:'/Users/dev/Library/Application Support/Google/Chrome/Profile 2',
    args: ["--no-sandbox", "--disabled-setupid-sandbox"],
    defaultViewport: null,


    ignoreDefaultArgs: ['--disable-extensions'],
  }).then(async browser => {
    const page = await browser.newPage();

    await page.goto('https://staging.new.expensify.com', { waitUntil: "load", });

    // Set screen size
    await page.setViewport({ width: 1200, height: 800 });

    const selectorButton = '[aria-label="My settings"]'
    await page.waitForSelector(selectorButton);
    await delay(1000)
    await page.click(selectorButton)

    const aboutSelector = '[aria-label="About"]'
    await page.waitForSelector(aboutSelector);
    await page.click(aboutSelector);

    const versionSelector = "div[class='css-175oi2r r-150rngu r-eqz5dr r-16y2uox r-1wbh5a2 r-11yh6sk r-1rnoaur r-1sncvnh'] > div > div > div"
    await page.waitForSelector(versionSelector);
    let element = await page.$(versionSelector)
    let value = await page.evaluate(el => el.textContent, element)
    const version = extractVersion(value);
    console.log(version)

    try {
      const oldVersion = fs.readFileSync('version.txt', 'utf8');

      if (oldVersion !== version) {
        //signo mas 
        const selectorPlusSign = '[aria-label="Send message (Floating action)"]';
        await page.waitForSelector(selectorPlusSign);
        const plusSign = await page.click(selectorPlusSign);
        await page.click(selectorPlusSign)
        // await delay(4000)
        //boton send message
        const selectorSendMg = '[aria-label="Send message"]';
        await page.waitForSelector(selectorSendMg);
        await page.click(selectorSendMg);
        // await delay(4000)
        //input-mail
        const selectorInput = 'div.css-175oi2r.r-12vffkv input[aria-label="Name, email, or phone number"]';
        await page.waitForSelector(selectorInput);
        await page.click(selectorInput);             
        const emailInsert = 'maurisa2004@gmail.com';
        await page.type(selectorInput, emailInsert);
        // await delay(4000)
        const selectorChat = '[aria-label="maurisa2004@gmail.com"]';
        await page.waitForSelector(selectorChat);
        await page.click(selectorChat);
        // await delay(40000)
        const message = "Hay una nueva version sucio";
        const selector = '[placeholder="Write something..."]'
        await page.type(selector, message)

        await page.keyboard.press('Enter')
        writeVersionToFile(version);

      } else {
        console.log("Misma version", version)
      }
    } catch(err) {
      console.log(err);
      console.log(version)
      // writeVersionToFile(version)
    }
    // await browser.close()
  })
}
runScript()
// setInterval(runScript, 1);
