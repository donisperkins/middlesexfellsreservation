// scrape.mjs — Middlesex Fells content scraper
// Fetches each page and saves clean markdown to /content/

import fetch from 'node-fetch';
import TurndownService from 'turndown';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://www.middlesexfellsreservation.com';

const PAGES = [
  { slug: 'home', path: '/' },
  { slug: 'about', path: '/about' },
  { slug: 'trail-map', path: '/trail-map' },
  { slug: 'skyline-trail', path: '/skyline-trail' },
  { slug: 'rock-circuit-trail', path: '/rock-circuit-trail' },
  { slug: 'cross-fells-trail', path: '/cross-fells-trail' },
  { slug: 'bear-hill-trail', path: '/bear-hill-trail' },
  { slug: 'mustang-loop-trail', path: '/mustang-loop-trail' },
  { slug: 'pickerel-rock', path: '/pickerel-rock' },
  { slug: 'hiking', path: '/hiking' },
  { slug: 'mountain-biking', path: '/mountain-biking' },
  { slug: 'dog-park', path: '/dog-park' },
  { slug: 'fishing', path: '/fishing' },
  { slug: 'horseback-riding', path: '/horseback-riding' },
  { slug: 'cross-country-skiing', path: '/cross-country-skiing' },
  { slug: 'canoe-and-kayaking', path: '/canoe-and-kayaking' },
  { slug: 'swimming', path: '/swimming' },
  { slug: 'observation-tower', path: '/observation-tower' },
  { slug: 'spot-pond', path: '/spot-pond' },
  { slug: 'bellevue-pond', path: '/bellevue-pond' },
  { slug: 'wrights-pond', path: '/wrights-pond' },
  { slug: 'middlesex-fells-reservoir', path: '/middlesex-fells-reservoir' },
  { slug: 'parking', path: '/parking' },
  { slug: 'hours', path: '/hours' },
  { slug: 'faq', path: '/faq' },
];

const OUTPUT_DIR = './content';
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

const td = new TurndownService({ headingStyle: 'atx', bulletListMarker: '-' });

// Strip nav, footer, scripts, styles — keep only main content
td.remove(['nav', 'footer', 'script', 'style', 'noscript', 'header']);

async function scrapePage(slug, pagePath) {
  const url = `${BASE_URL}${pagePath}`;
  console.log(`Scraping: ${url}`);

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; content-scraper/1.0)' }
    });

    if (!res.ok) {
      console.warn(`  ⚠️  ${res.status} for ${url}`);
      return;
    }

    const html = await res.text();

    // Extract just the main/article content if possible
    const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)
      || html.match(/<article[^>]*>([\s\S]*?)<\/article>/i)
      || html.match(/<div[^>]*id="page"[^>]*>([\s\S]*?)<\/div>/i);

    const contentHtml = mainMatch ? mainMatch[1] : html;
    const markdown = td.turndown(contentHtml);

    // Clean up excessive blank lines
    const cleaned = markdown
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    const outputPath = path.join(OUTPUT_DIR, `${slug}.md`);
    fs.writeFileSync(outputPath, `# ${slug}\n\nSource: ${url}\n\n${cleaned}\n`);
    console.log(`  ✅ Saved: ${outputPath}`);

  } catch (err) {
    console.error(`  ❌ Error on ${url}:`, err.message);
  }
}

// Run with a small delay between requests to be polite
async function run() {
  console.log(`\n🌲 Starting Middlesex Fells scrape — ${PAGES.length} pages\n`);
  for (const page of PAGES) {
    await scrapePage(page.slug, page.path);
    await new Promise(r => setTimeout(r, 500)); // 500ms between requests
  }
  console.log(`\n✅ Done! Content saved to ${OUTPUT_DIR}/`);
}

run();