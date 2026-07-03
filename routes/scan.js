'use strict';

const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const { parseZip, parseDirectory, detectProjectType } = require('../utils/fileParser');
const { detectUI5Version, refreshUI5VersionData, getUI5Version } = require('../scanners/ui5Scanner');
const { scanCAPCode } = require('../scanners/capScanner');
const { scanSecrets } = require('../scanners/secretsScanner');
const { scanBTPDestinations } = require('../scanners/btpScanner');
const { analyzePackageJson } = require('../scanners/npmScanner');
const { scanApprouter } = require('../scanners/approuterScanner');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

// Directory where pre-built UI5 resources snapshots are stored
const UI5_CACHE_DIR = path.join(__dirname, '..', 'ui5', 'version');

// In-memory scan history (use DB in production)
const scanHistory = new Map();

// ---------------------------------------------------------------------------
// Risk scoring
// ---------------------------------------------------------------------------

function calculateRiskScore(results) {
  let score = 100;
  const weights = { CRITICAL: 25, HIGH: 15, MEDIUM: 8, LOW: 3, INFO: 0 };

  const allIssues = [
    ...(results.secrets?.findings || []),
    ...(results.ui5?.issues || []),
    ...(results.ui5?.codeVulnerabilities || []),
    ...(results.ui5?.redirectVulnerabilities || []),
    ...(results.ui5?.sensitiveData || []),
    ...(results.ui5?.owasp || []),
    ...(results.ui5?.sapSpecific || []),
    ...(results.cap?.vulnerabilities || []),
    ...(results.cap?.mtaIssues || []),
    ...(results.cap?.xsuaaIssues || []),
    ...(results.btp?.issues || []),
    ...(results.npm?.issues || []),
    ...(results.cap?.services?.filter(s => s.severity === 'HIGH') || []),
    ...(results.approuter?.routeIssues || []),
    ...(results.approuter?.versionIssues || []),
    ...(results.approuter?.mtaIssues || []),
    ...(results.approuter?.configIssues || []),
  ];

  for (const issue of allIssues) {
    score -= (weights[issue.severity] || 0);
  }

  return Math.max(0, Math.min(100, score));
}

// ---------------------------------------------------------------------------
// Report builder
// ---------------------------------------------------------------------------

function buildReport(scanId, files, projectName) {
  const projectTypes = detectProjectType(files);

  const ui5Results      = detectUI5Version(files);
  const capResults      = scanCAPCode(files);
  const secretResults   = scanSecrets(files);
  const btpResults      = scanBTPDestinations(files);
  const npmResults      = analyzePackageJson(files);
  const approuterResults = scanApprouter(files);

  const results = {
    ui5:      ui5Results,
    cap:      capResults,
    secrets:  { findings: secretResults },
    btp:      { issues: btpResults },
    npm:      npmResults,
    approuter: approuterResults,
  };

  const riskScore = calculateRiskScore(results);

  const allIssues = [
    ...secretResults,
    ...(ui5Results.issues || []),
    ...(ui5Results.codeVulnerabilities || []),
    ...(ui5Results.redirectVulnerabilities || []),
    ...(ui5Results.sensitiveData || []),
    ...(ui5Results.owasp || []),
    ...(ui5Results.sapSpecific || []),
    ...(capResults.vulnerabilities || []),
    ...(capResults.mtaIssues || []),
    ...(capResults.xsuaaIssues || []),
    ...btpResults,
    ...(npmResults.issues || []),
    ...(capResults.services?.filter(s => s.severity === 'HIGH') || []),
    ...(approuterResults.routeIssues || []),
    ...(approuterResults.versionIssues || []),
    ...(approuterResults.mtaIssues || []),
    ...(approuterResults.configIssues || []),
  ];

  const summary = {
    critical: allIssues.filter(i => i.severity === 'CRITICAL').length,
    high:     allIssues.filter(i => i.severity === 'HIGH').length,
    medium:   allIssues.filter(i => i.severity === 'MEDIUM').length,
    low:      allIssues.filter(i => i.severity === 'LOW').length,
    info:     allIssues.filter(i => i.severity === 'INFO').length,
    total:    allIssues.length,
  };

  return {
    scanId,
    projectName,
    projectTypes,
    scannedAt: new Date().toISOString(),
    filesScanned: files.length,
    riskScore,
    riskLevel: riskScore >= 80 ? 'LOW' : riskScore >= 60 ? 'MEDIUM' : riskScore >= 40 ? 'HIGH' : 'CRITICAL',
    summary,
    results,
  };
}

// ---------------------------------------------------------------------------
// Scan routes
// ---------------------------------------------------------------------------

// POST /api/scan/upload - Upload ZIP
router.post('/upload', upload.single('project'), async (req, res) => {
  const t = req.t?.errors || {};
  try {
    if (!req.file) return res.status(400).json({ error: t.noFile || 'No file provided' });

    const scanId = uuidv4();
    const projectName = req.body.projectName || req.file.originalname.replace('.zip', '');

    const files = parseZip(req.file.buffer);
    if (files.length === 0) {
      return res.status(400).json({ error: t.noFilesInZip || 'No scannable files found in ZIP' });
    }

    const report = buildReport(scanId, files, projectName);
    scanHistory.set(scanId, report);

    res.json({ success: true, scanId, report });
  } catch (err) {
    console.error('Scan error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/scan/directory - Scan local directory
router.post('/directory', express.json(), async (req, res) => {
  const t = req.t?.errors || {};
  try {
    const { dirPath, projectName } = req.body;
    if (!dirPath) return res.status(400).json({ error: t.dirRequired || 'dirPath required' });

    const allowedDirPath = fs.realpathSync(dirPath);
    const resolvedPath   = path.resolve(allowedDirPath);
    if (!fs.existsSync(resolvedPath)) {
      return res.status(400).json({ error: t.dirNotFound ? t.dirNotFound(resolvedPath) : `Directory not found: ${resolvedPath}` });
    }

    const scanId = uuidv4();
    const files  = parseDirectory(resolvedPath);

    if (files.length === 0) {
      return res.status(400).json({ error: t.noFilesInDir || 'No scannable files found in directory' });
    }

    const report = buildReport(scanId, files, projectName || path.basename(resolvedPath));
    scanHistory.set(scanId, report);

    res.json({ success: true, scanId, report });
  } catch (err) {
    console.error('Scan error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/scan/history
router.get('/history', (req, res) => {
  const history = Array.from(scanHistory.values()).map(r => ({
    scanId:       r.scanId,
    projectName:  r.projectName,
    scannedAt:    r.scannedAt,
    riskScore:    r.riskScore,
    riskLevel:    r.riskLevel,
    summary:      r.summary,
    projectTypes: r.projectTypes,
  }));
  res.json(history.reverse());
});

// GET /api/scan/:scanId
router.get('/:scanId', (req, res) => {
  const report = scanHistory.get(req.params.scanId);
  if (!report) return res.status(404).json({ error: req.t?.errors?.notFound || 'Scan not found' });
  res.json(report);
});

// DELETE /api/scan/:scanId
router.delete('/:scanId', (req, res) => {
  scanHistory.delete(req.params.scanId);
  res.json({ success: true });
});

// ---------------------------------------------------------------------------
// SAP UI5 utility routes  (/api/sap/ui5/...)
// Mount this router under /api/sap/ui5 in your main app, or adjust prefix.
// ---------------------------------------------------------------------------

const ui5Router = express.Router();

/**
 * GET /api/sap/ui5/version
 *
 * Fetches and refreshes both UI5_VERSION_OVERVIEW (versionoverview.json)
 * and UI5_VERSION (version.json) from ui5.sap.com.
 *
 * Response on success:
 *   { status: 200, message: "https://ui5.sap.com/ OK" }
 */
ui5Router.get('/version', async (req, res) => {
  try {
    await refreshUI5VersionData();
    res.json({  status: 200, 
                message: 'https://ui5.sap.com/ available.',
                data: getUI5Version()
     });
  } catch (err) {
    console.error('UI5 version refresh error:', err);
    res.status(502).json({  status: 502,
                            message: `Failed to reach ui5.sap.com: ${err.message}`,
                            data: {}
                          });
  }
});

/**
 * GET /api/sap/ui5/resources/1.145.3
 *
 * 1. Checks ui5/version/<version>.json cache on disk → returns it if found.
 * 2. Otherwise fetches https://ui5.sap.com/<version>/resources/sap-ui-version.json
 *    then enriches each library with vendor/copyright/documentation/appData from
 *    https://ui5.sap.com/<version>/resources/<lib/path>/.library
 * 3. Returns the enriched JSON.
 */
ui5Router.get('/resources/:version', async (req, res) => {
  const version = req.params.version;

  if (!version || !/^\d+\.\d+\.\d+$/.test(version)) {
    return res.status(400).json({ error: 'Query parameter "version" is required and must match x.y.z format (e.g. 1.145.3)' });
  }

  // ── 1. Cache hit ──────────────────────────────────────────────────────────
  const cacheFile = path.join(UI5_CACHE_DIR, `${version}.json`);
  if (fs.existsSync(cacheFile)) {
    try {
      const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      return res.json({ source: 'cache', version, data: cached });
    } catch (e) {
      console.warn(`Cache file ${cacheFile} is corrupt, re-fetching.`);
    }
  }

  // ── 2. Fetch sap-ui-version.json ─────────────────────────────────────────
  const fetchFn = typeof fetch !== 'undefined' ? fetch : require('node-fetch');

  let sapUiVersion;
  try {
    const versionUrl = `https://ui5.sap.com/${version}/resources/sap-ui-version.json`;
    const vRes = await fetchFn(versionUrl);
    if (!vRes.ok) throw new Error(`HTTP ${vRes.status} for ${versionUrl}`);
    sapUiVersion = await vRes.json();
  } catch (err) {
    return res.status(502).json({ error: `Cannot fetch sap-ui-version.json for version ${version}: ${err.message}` });
  }

  // ── 3. Enrich each library with .library metadata ────────────────────────
  const libraries = sapUiVersion.libraries || [];

  const enriched = await Promise.all(
    libraries.map(async (lib) => {
      // sap.ui.core  →  sap/ui/core
      const libPath = lib.name.replace(/\./g, '/');
      const libraryUrl = `https://ui5.sap.com/${version}/resources/${libPath}/.library`;

      try {
        const lRes = await fetchFn(libraryUrl);
        if (!lRes.ok) throw new Error(`HTTP ${lRes.status}`);
        const xml = await lRes.text();

        // Parse relevant fields from the XML using simple regex extraction
        const vendor        = extractXmlValue(xml, 'vendor');
        const copyright     = extractXmlValue(xml, 'copyright');
        const documentation = extractXmlValue(xml, 'documentation');

        // appData is everything inside <appData>…</appData>
        const appDataMatch = xml.match(/<appData>([\s\S]*?)<\/appData>/i);
        const appData      = appDataMatch ? appDataMatch[1].trim() : null;

        return { ...lib, vendor, copyright, documentation, appData };
      } catch (e) {
        // Non-fatal: return original library data with nulls
        return { ...lib, vendor: null, copyright: null, documentation: null, appData: null };
      }
    })
  );

  const result = { ...sapUiVersion, libraries: enriched };

  // ── 4. Optionally persist to cache ───────────────────────────────────────
  try {
    fs.mkdirSync(UI5_CACHE_DIR, { recursive: true });
    fs.writeFileSync(cacheFile, JSON.stringify(result, null, 2), 'utf8');
  } catch (e) {
    console.warn(`Could not write cache file ${cacheFile}: ${e.message}`);
  }

  return res.json({ source: 'live', version, data: result });
});

// ---------------------------------------------------------------------------
// XML helper
// ---------------------------------------------------------------------------

function extractXmlValue(xml, tag) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const m  = xml.match(re);
  return m ? m[1].trim() : null;
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = { scanRouter: router, ui5Router };
