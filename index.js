import fs from 'fs'
import nodemailer from 'nodemailer';
import { load } from 'cheerio';
import { writeFile } from 'fs/promises';

const appleUrl = process.env.APPLE_URL;
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
    console.log(`Running local iOS version check: ${savedVersion} saved.`)
  } catch (e) {
    throw new Error(`File Read Error: ${e}`);
  }
}

// get current ios version from apple website
const response = await fetch(appleUrl);
if (!response.ok) throw new Error(`HTTP GET Error: ${response.status}`);
const html = await response.text();
const $ = load(html);
$('table tr').each((_, element) => {
  const rowText = $(element).text();
  const match = rowText.match(/iOS\s+([0-9.]+)/i);
  if (match && match[1]) {
    websiteVersion = match[1];
    console.log(`Apple iOS version fetched from website: ${websiteVersion} online.`)
    return false;
  }
});

if (savedVersion != websiteVersion) {
  console.log('New iOS version discovered.')
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
      console.log(`New iOS version ${websiteVersion} email sent.`)
    }
  });
} else {
  console.log('Check successfully ran. No new iOS versions discovered.')
}