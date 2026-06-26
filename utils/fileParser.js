'use strict';

const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const TEXT_EXTENSIONS = new Set([
  '.js', '.ts', '.jsx', '.tsx', '.json', '.yaml', '.yml',
  '.cds', '.xml', '.html', '.css', '.env', '.md', '.txt',
  '.properties', '.sh', '.bat', '.py', '.java',
]);

const BINARY_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg',
  '.woff', '.woff2', '.ttf', '.eot', '.otf',
  '.zip', '.jar', '.war', '.ear',
  '.pdf', '.doc', '.docx',
]);

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB per file
const MAX_TOTAL_FILES = 500;

function isTextFile(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (BINARY_EXTENSIONS.has(ext)) return false;
  if (TEXT_EXTENSIONS.has(ext)) return true;
  // Files without extension that are commonly text
  const basename = path.basename(filename);
  return ['.env', '.gitignore', '.npmrc', '.nvmrc', 'Makefile', 'Dockerfile'].includes(basename);
}

function shouldSkip(entryName) {
  const skip = [
    'node_modules/',
    '.git/',
    'dist/',
    'build/',
    '.cache/',
    'coverage/',
    '__pycache__/',
    '.nyc_output/',
  ];
  return skip.some(s => entryName.includes(s));
}

function parseZip(zipBuffer) {
  const files = [];
  const zip = new AdmZip(zipBuffer);
  const entries = zip.getEntries();

  let count = 0;
  for (const entry of entries) {
    if (count >= MAX_TOTAL_FILES) break;
    if (entry.isDirectory) continue;
    if (shouldSkip(entry.entryName)) continue;

    const size = entry.header.size;
    if (size > MAX_FILE_SIZE) continue;
    if (!isTextFile(entry.entryName)) continue;

    try {
      const content = entry.getData().toString('utf-8');
      files.push({
        name: entry.entryName,
        content,
        size,
      });
      count++;
    } catch (e) {
      // skip binary or corrupted files
    }
  }

  return files;
}

function parseDirectory(dirPath) {
  const files = [];
  const absoluteDir = path.resolve(dirPath);

  function walk(currentPath) {
    if (files.length >= MAX_TOTAL_FILES) return;
    const resolvecurrentPath = path.resolve(currentPath);
    const relative = path.relative(absoluteDir, resolvecurrentPath);
    if (shouldSkip(relative + '/')) return;

    let entries;
    try {
      entries = fs.readdirSync(resolvecurrentPath, { withFileTypes: true });
    } catch (e) {
      return;
    }

    for (const entry of entries) {
      if (files.length >= MAX_TOTAL_FILES) break;
      const fullPath = path.join(resolvecurrentPath, entry.name);
      const relPath = path.relative(absoluteDir, fullPath);

      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        if (!isTextFile(entry.name)) continue;
        try {
          const stat = fs.statSync(fullPath);
          if (stat.size > MAX_FILE_SIZE) continue;
          const content = fs.readFileSync(fullPath, 'utf-8');
          files.push({ name: relPath, content, size: stat.size });
        } catch (e) {
          // skip
        }
      }
    }
  }

  walk(absoluteDir);
  return files;
}

function detectProjectType(files) {
  const filenames = files.map(f => path.basename(f.name));
  const types = [];

  if (filenames.some(f => f === 'manifest.json') ||
      files.some(f => f.content?.includes('sap.app') || f.content?.includes('sap.ui5'))) {
    types.push('SAPUI5/Fiori');
  }
  if (filenames.some(f => f === 'mta.yaml')) types.push('MTA');
  if (files.some(f => f.name.endsWith('.cds'))) types.push('CAP/CDS');
  if (filenames.some(f => f === 'xs-security.json')) types.push('XSUAA');
  if (files.some(f => f.content?.includes('@sap/cds') || f.content?.includes('@sap/approuter'))) {
    if (!types.includes('CAP/CDS')) types.push('CAP Node.js');
  }
  if (filenames.some(f => f === 'package.json')) types.push('Node.js');
  if (filenames.some(f => f === 'xs-app.json')) types.push('App Router');

  return types.length > 0 ? types : ['Unknown'];
}

module.exports = { parseZip, parseDirectory, detectProjectType };
