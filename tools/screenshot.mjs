import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const port = Number(process.env.PORT || 4173);
const url = process.env.SCREENSHOT_URL || `http://127.0.0.1:${port}/index.html`;
const outputPath = process.env.SCREENSHOT_OUT || 'artifacts/homepage.png';

mkdirSync('artifacts', { recursive: true });

const server = spawn('python3', ['-m', 'http.server', String(port)], {
  stdio: 'ignore',
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

try {
  await sleep(1200);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1024 } });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.screenshot({ path: outputPath, fullPage: true });
  await browser.close();
  console.log(`Saved screenshot to ${outputPath}`);
} finally {
  if (!server.killed) {
    server.kill('SIGTERM');
  }
}
