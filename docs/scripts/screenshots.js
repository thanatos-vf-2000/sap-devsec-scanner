import puppeteer from 'puppeteer';
import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'public', 'screenshots');
const APP_URL = process.env.APP_URL || 'http://localhost:5173';

const PAGES = [
  { name: 'home',    path: '/' },
  { name: 'scan',    path: '/#/scan' },
  { name: 'report',  path: '/#/history' },  // redirige vers un rapport si dispo
  { name: 'history', path: '/#/history' },
  { name: 'about',   path: '/#/about' },
];

// PNG 1x1 transparent - placeholder valide si le backend est absent
const PLACEHOLDER_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

async function savePlaceholder(name) {
  const dest = path.join(SCREENSHOTS_DIR, `${name}.png`);
  if (!existsSync(dest)) {
    await writeFile(dest, PLACEHOLDER_PNG);
    console.log(`  📄 Placeholder créé: ${name}.png`);
  }
}

async function takeScreenshots() {
  if (!existsSync(SCREENSHOTS_DIR)) {
    await mkdir(SCREENSHOTS_DIR, { recursive: true });
  }

  // Vérifier que le backend répond avant de lancer Puppeteer
  let backendAvailable = false;
  try {
    const res = await fetch(`${APP_URL}/api/health`, { signal: AbortSignal.timeout(5000) });
    backendAvailable = res.ok;
  } catch {
    console.warn(`⚠️ Backend non disponible sur ${APP_URL} - génération de placeholders`);
  }

  if (!backendAvailable) {
    for (const { name } of PAGES) await savePlaceholder(name);
    console.log('✨ Placeholders générés (backend absent)');
    return;
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  for (const { name, path: urlPath } of PAGES) {
    console.log(`📸 Screenshot: ${name}`);
    // Ouvrir une nouvelle page par screenshot pour éviter les contextes détruits
    const page = await browser.newPage();
    try {
      await page.setViewport({ width: 1280, height: 800 });
      /*
      await page.goto(`${APP_URL}${urlPath}`, {
        waitUntil: 'networkidle2',
        timeout: 20000,
      });
      */
      await page.goto(APP_URL, {
        waitUntil: "networkidle2",
        timeout: 20000,
      });

      // changement de vue
      switch (name) {

        case "scan":
          await page.locator(".shell-nav a:nth-child(1)").click();
          break;

        case "report":
          await page.locator(".shell-nav a:nth-child(2)").click();
          break;

        case "history":
          await page.locator(".shell-nav a:nth-child(3)").click();
          break;

        case "about":
          await page.locator(".shell-nav a:nth-child(4)").click();
          break;

      }

      // attendre le rendu Vue
      await page.waitForFunction(() => {

        const visibles = [...document.querySelectorAll("main > div")];

        return visibles.some(e => getComputedStyle(e).display !== "none");

      });
      await new Promise(r => setTimeout(r, 1500));

      await page.waitForSelector(".shell-nav");

      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, `${name}.png`),
        fullPage: false,
      });
      console.log(`  ✅ ${name}.png`);
    } catch (err) {
      console.warn(`  ⚠️ Échec ${name}: ${err.message}`);
      await savePlaceholder(name);
    } finally {
      await page.close().catch(() => {});
    }
  }

  await browser.close();
  console.log('✨ Screenshots terminés');
}

takeScreenshots().catch(err => {
  console.error('Erreur fatale screenshots:', err);
  process.exit(0); // Ne pas bloquer le build pour les screenshots
});