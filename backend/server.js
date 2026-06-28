'use strict';

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const unzipper = require('unzipper');
var RateLimit = require('express-rate-limit');

const { version } = require('./package.json');
const { scanRouter, ui5Router } = require('./routes/scan');
const i18n = require('./utils/i18n');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '256mb' }));

// set up rate limiter: maximum of requests per minute
var limiter = RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 50, // max 100 requests per windowMs
});

// apply rate limiter to all requests
app.use(limiter);

// ── Language detection middleware ──────────────────────────────
// Detects language from Accept-Language header.
// If the browser sends 'fr' or 'fr-*', use French. Otherwise English.
app.use((req, res, next) => {
  const acceptLang = req.headers['accept-language'] || '';
  const isFrench = acceptLang.toLowerCase().split(',').some(lang =>
    lang.trim().startsWith('fr')
  );
  req.lang = isFrench ? 'fr' : 'en';
  req.t = i18n[req.lang];
  next();
});

// Serve built Vue frontend (production)
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/scan', scanRouter);
app.use('/api/sap/ui5', ui5Router);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version,
    service: 'SAP DevSec Scanner',
    lang: req.lang,
  });
});

// Serve Vue frontend for all other routes (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// ── ui5.zip extraction ─────────────────────────────────────────
// If ui5.zip exists alongside server.js, extract it before starting.
async function extractUi5ZipIfPresent() {
  const zipPath = path.join(__dirname, 'ui5.zip');
  if (!fs.existsSync(zipPath)) return;

  const destDir = path.join(__dirname, 'ui5');
  console.log(`📦 ui5.zip detected — extracting to ${destDir} …`);

  await fs.promises.mkdir(destDir, { recursive: true });

  await new Promise((resolve, reject) => {
    fs.createReadStream(zipPath)
      .pipe(unzipper.Extract({ path: destDir }))
      .on('close', resolve)
      .on('error', reject);
  });

  console.log(`✅ ui5.zip extracted successfully.\n`);
}

async function startServer() {
  await extractUi5ZipIfPresent();

  app.listen(PORT, () => {
    console.log(`\n🔒 SAP DevSec Scanner`);
    console.log(`   Version: ${version}`);
    console.log(`   Backend: http://localhost:${PORT}`);
    console.log(`   API:     http://localhost:${PORT}/api`);
    console.log(`   Ready to scan SAP BTP projects\n`);
  });
}

startServer().catch(err => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});

module.exports = app;
