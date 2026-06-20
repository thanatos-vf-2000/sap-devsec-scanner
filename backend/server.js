'use strict';

const express = require('express');
const cors = require('cors');
const path = require('path');
var RateLimit = require('express-rate-limit');

const { version } = require('./package.json');
const scanRouter = require('./routes/scan');
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

app.listen(PORT, () => {
  console.log(`\n🔒 SAP DevSec Scanner`);
  console.log(`   Version: ${version}`);
  console.log(`   Backend: http://localhost:${PORT}`);
  console.log(`   API:     http://localhost:${PORT}/api`);
  console.log(`   Ready to scan SAP BTP projects\n`);
});

module.exports = app;
