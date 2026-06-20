'use strict';

const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const { parseZip, parseDirectory, detectProjectType } = require('../utils/fileParser');
const { detectUI5Version } = require('../scanners/ui5Scanner');
const { scanCAPCode } = require('../scanners/capScanner');
const { scanSecrets } = require('../scanners/secretsScanner');
const { scanBTPDestinations } = require('../scanners/btpScanner');
const { analyzePackageJson } = require('../scanners/npmScanner');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

// In-memory scan history (use DB in production)
const scanHistory = new Map();

function calculateRiskScore(results) {
  let score = 100;
  const weights = { CRITICAL: 25, HIGH: 15, MEDIUM: 8, LOW: 3, INFO: 0 };

  const allIssues = [
    ...(results.secrets?.findings || []),
    ...(results.ui5?.issues || []),
    ...(results.ui5?.codeVulnerabilities || []),
    ...(results.cap?.vulnerabilities || []),
    ...(results.cap?.mtaIssues || []),
    ...(results.cap?.xsuaaIssues || []),
    ...(results.btp?.issues || []),
    ...(results.npm?.issues || []),
    ...(results.cap?.services?.filter(s => s.severity === 'HIGH') || []),
  ];

  for (const issue of allIssues) {
    score -= (weights[issue.severity] || 0);
  }

  return Math.max(0, Math.min(100, score));
}

function buildReport(scanId, files, projectName) {
  const projectTypes = detectProjectType(files);

  const ui5Results = detectUI5Version(files);
  const capResults = scanCAPCode(files);
  const secretResults = scanSecrets(files);
  const btpResults = scanBTPDestinations(files);
  const npmResults = analyzePackageJson(files);

  const results = {
    ui5: ui5Results,
    cap: capResults,
    secrets: { findings: secretResults },
    btp: { issues: btpResults },
    npm: npmResults,
  };

  const riskScore = calculateRiskScore(results);

  // Count all issues by severity
  const allIssues = [
    ...secretResults,
    ...(ui5Results.issues || []),
    ...(ui5Results.codeVulnerabilities || []),
    ...(capResults.vulnerabilities || []),
    ...(capResults.mtaIssues || []),
    ...(capResults.xsuaaIssues || []),
    ...btpResults,
    ...(npmResults.issues || []),
    ...(capResults.services?.filter(s => s.severity === 'HIGH') || []),
  ];

  const summary = {
    critical: allIssues.filter(i => i.severity === 'CRITICAL').length,
    high: allIssues.filter(i => i.severity === 'HIGH').length,
    medium: allIssues.filter(i => i.severity === 'MEDIUM').length,
    low: allIssues.filter(i => i.severity === 'LOW').length,
    info: allIssues.filter(i => i.severity === 'INFO').length,
    total: allIssues.length,
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

    const resolvedPath = path.resolve(dirPath);
    if (!fs.existsSync(resolvedPath)) {
      return res.status(400).json({ error: t.dirNotFound ? t.dirNotFound(resolvedPath) : `Directory not found: ${resolvedPath}` });
    }

    const scanId = uuidv4();
    const files = parseDirectory(resolvedPath);

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
    scanId: r.scanId,
    projectName: r.projectName,
    scannedAt: r.scannedAt,
    riskScore: r.riskScore,
    riskLevel: r.riskLevel,
    summary: r.summary,
    projectTypes: r.projectTypes,
  }));
  res.json(history.reverse()); // most recent first
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

module.exports = router;
