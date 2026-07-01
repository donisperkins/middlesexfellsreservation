// screenshot.mjs
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';

const dir = './screenshots';
if (!fs.existsSync(dir)) fs.mkdirSync(dir);

const existing = fs.readdirSync(dir).filter(f => f.endsWith('.png'));
const n = existing.length + 1;
const filename = label ? `screenshot-${n}-${label}.png` : `screenshot-${n}.png`;
const filepath = path.join(dir, filename);

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(url, { waitUntil: 'networkidle' });
await page.screenshot({ path: filepath, fullPage: true });
await browser.close();

console.log(`Saved: ${filepath}`);
