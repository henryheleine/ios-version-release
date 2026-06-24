import fs from 'fs'
import nodemailer from 'nodemailer';
import puppeteer from 'puppeteer';
import { writeFile } from 'fs/promises';

const appleUrl = process.env.APPLE_URL;
const browser = await puppeteer.launch({headless: true, args:['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']});
const emailFrom = process.env.EMAIL_FROM;
const emailTo = process.env.EMAIL_TO;
const host = process.env.SMTP;
const pass = process.env.EMAIL_PASS;
const port = process.env.PORT;
const encoding = 'utf8'
const file = 'state.json';
const transporter = nodemailer.createTransport({host: host, port: port, auth: { user: emailFrom, pass: pass }, debug: true});
var savedVersion = '';
var websiteVersion = '';

// read in saved iOS version
if (fs.existsSync(file)) {
  try {
    savedVersion = JSON.parse(fs.readFileSync(file, encoding)).ios;
    console.log(`Local iOS version saved: ${savedVersion}.`)
  } catch (e) {
    throw new Error(`File Read Error: ${e}`);
  }
}


// get current ios version from the Apple website
const page = await browser.newPage();
await page.goto('https://developer.apple.com/documentation/ios-ipados-release-notes');
await page.waitForSelector('div.aside');
websiteVersion = await page.$$eval('p', (paragraphs, regexStr) => {
  const regex = /iOS & iPadOS (.*) Release Notes/i;
  const found = paragraphs.find((p) => regex.test(p.textContent));
  const match = found?.textContent?.match(regex);
  return match?.[1]?.trim() ?? '';
});
console.log(`Apple iOS version fetched from website: ${websiteVersion}.`);
await browser.close();


// check for new version and save/send notification email if required
if (savedVersion != websiteVersion && websiteVersion != '') {
  console.log('New iOS version detected.')
  // update saved state file
  try {
    const jsonString = JSON.stringify({ "ios": websiteVersion }); 
    await writeFile('state.json', jsonString, encoding);
    console.log(`New iOS version ${websiteVersion} saved locally.`)
  } catch (error) {
    throw new Error(`Error writing file: ${error}`);
  }
  // send email
  transporter.sendMail({from: emailFrom, to: emailTo, subject: `New iOS Version ${websiteVersion} Available`, text: 'Please regression test existing functionality'}, function(error, info) {
    if (error) {
      throw new Error(`Email Send Error: ${error}`);
    } else {
      console.log(`New iOS version email sent for ${websiteVersion}.`)
    }
  });
} else {
  console.log('Check successfully ran. No new iOS versions detected.')
}