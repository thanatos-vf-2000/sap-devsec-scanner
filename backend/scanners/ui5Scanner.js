'use strict';

const path = require('path');

// ---------------------------------------------------------------------------
// Static fallback data (used until /api/sap/ui5/version is called)
// ---------------------------------------------------------------------------
const UI5_VERSION_DATA = {
  latest:     '1.149.0',
  lts:        '1.136.20',
  lastupdate: '2026-06-26',
  source:     'static',
  maintained: [
  { version: '1.149', patch: '1.149.0', status: 'maintained', eom: '', ecp : '', label: 'To Be Determined' },
  { version: '1.148', patch: '1.148.2', status: 'lts', eom: 'Q3/2027', ecp : 'Q3/2028', label: 'Latest' },
	{ version: '1.148', patch: '1.148.1', status: 'maintained', eom: '', ecp : 'Q3/2027', label: 'Maintained' },
	{ version: '1.148', patch: '1.148.0', status: 'maintained', eom: '', ecp : 'Q2/2027', label: 'Maintained' },
	{ version: '1.147', patch: '1.147.2', status: 'maintained', eom: '', ecp : 'Q2/2027', label: 'Maintained' },
	{ version: '1.147', patch: '1.147.1', status: 'maintained', eom: '', ecp : 'Q2/2027', label: 'Maintained' },
	{ version: '1.147', patch: '1.147.0', status: 'maintained', eom: '', ecp : 'Q2/2027', label: 'Maintained' },
	{ version: '1.146', patch: '1.146.0', status: 'maintained', eom: '', ecp : 'Q2/2027', label: 'Maintained' },
	{ version: '1.145', patch: '1.145.3', status: 'maintained', eom: 'Q3/2026', ecp : 'Q3/2027', label: 'Maintained' },
	{ version: '1.145', patch: '1.145.2', status: 'maintained', eom: '', ecp : 'Q2/2027', label: 'Maintained' },
	{ version: '1.145', patch: '1.145.1', status: 'maintained', eom: '', ecp : 'Q2/2027', label: 'Maintained' },
	{ version: '1.145', patch: '1.145.0', status: 'maintained', eom: '', ecp : 'Q2/2027', label: 'Maintained' },
	{ version: '1.144', patch: '1.144.1', status: 'maintained', eom: '', ecp : 'Q1/2027', label: 'Maintained' },
	{ version: '1.144', patch: '1.144.0', status: 'maintained', eom: '', ecp : 'Q1/2027', label: 'Maintained' },
	{ version: '1.143', patch: '1.143.2', status: 'maintained', eom: '', ecp : 'Q1/2027', label: 'Maintained' },
	{ version: '1.143', patch: '1.143.1', status: 'maintained', eom: '', ecp : 'Q4/2026', label: 'Maintained' },
	{ version: '1.143', patch: '1.143.0', status: 'maintained', eom: '', ecp : 'Q4/2026', label: 'Maintained' },
	{ version: '1.142', patch: '1.142.13', status: 'maintained', eom: 'Q3/2026', ecp : 'Q3/2027', label: 'Maintained' },
	{ version: '1.142', patch: '1.142.12', status: 'maintained', eom: '', ecp : 'Q2/2027', label: 'Maintained' },
	{ version: '1.142', patch: '1.142.11', status: 'maintained', eom: '', ecp : 'Q2/2027', label: 'Maintained' },
	{ version: '1.142', patch: '1.142.10', status: 'maintained', eom: '', ecp : 'Q2/2027', label: 'Maintained' },
	{ version: '1.142', patch: '1.142.9', status: 'maintained', eom: '', ecp : 'Q1/2027', label: 'Maintained' },
	{ version: '1.142', patch: '1.142.8', status: 'maintained', eom: '', ecp : 'Q1/2027', label: 'Maintained' },
	{ version: '1.142', patch: '1.142.7', status: 'maintained', eom: '', ecp : 'Q1/2027', label: 'Maintained' },
	{ version: '1.142', patch: '1.142.6', status: 'maintained', eom: '', ecp : 'Q1/2027', label: 'Maintained' },
	{ version: '1.142', patch: '1.142.5', status: 'maintained', eom: '', ecp : 'Q1/2027', label: 'Maintained' },
	{ version: '1.142', patch: '1.142.4', status: 'maintained', eom: '', ecp : 'Q1/2027', label: 'Maintained' },
	{ version: '1.142', patch: '1.142.3', status: 'maintained', eom: '', ecp : 'Q1/2027', label: 'Maintained' },
	{ version: '1.142', patch: '1.142.2', status: 'maintained', eom: '', ecp : 'Q1/2027', label: 'Maintained' },
	{ version: '1.142', patch: '1.142.1', status: 'maintained', eom: '', ecp : 'Q4/2026', label: 'Maintained' },
	{ version: '1.142', patch: '1.142.0', status: 'maintained', eom: '', ecp : 'Q4/2026', label: 'Maintained' },
	{ version: '1.141', patch: '1.141.4', status: 'maintained', eom: '', ecp : 'Q4/2026', label: 'Maintained' },
	{ version: '1.141', patch: '1.141.3', status: 'maintained', eom: '', ecp : 'Q4/2026', label: 'Maintained' },
	{ version: '1.141', patch: '1.141.2', status: 'maintained', eom: '', ecp : 'Q4/2026', label: 'Maintained' },
	{ version: '1.141', patch: '1.141.1', status: 'maintained', eom: '', ecp : 'Q4/2026', label: 'Maintained' },
	{ version: '1.141', patch: '1.141.0', status: 'maintained', eom: '', ecp : 'Q4/2026', label: 'Maintained' },
  { version: '1.140', patch: '1.140.0', status: 'maintained', eom: '', ecp : 'Q4/2026', label: 'Maintained' },
	{ version: '1.139', patch: '1.139.4', status: 'maintained', eom: '', ecp : 'Q1/2027', label: 'Maintained' },
	{ version: '1.139', patch: '1.139.3', status: 'maintained', eom: '', ecp : 'Q4/2026', label: 'Maintained' },
	{ version: '1.139', patch: '1.139.2', status: 'maintained', eom: '', ecp : 'Q4/2026', label: 'Maintained' },
	{ version: '1.139', patch: '1.139.1', status: 'maintained', eom: '', ecp : 'Q4/2026', label: 'Maintained' },
	{ version: '1.139', patch: '1.139.0', status: 'maintained', eom: '', ecp : 'Q4/2026', label: 'Maintained' },
	{ version: '1.138', patch: '1.138.1', status: 'maintained', eom: '', ecp : 'Q3/2026', label: 'Maintained' },
	{ version: '1.138', patch: '1.138.0', status: 'maintained', eom: '', ecp : 'Q3/2026', label: 'Maintained' },
	{ version: '1.136', patch: '1.136.20', status: 'lts', eom: 'Q4/2032', ecp : 'Q4/2033', label: 'LTS (Recommended)' },
  { version: '1.136', patch: '1.136.19', status: 'maintained', eom: '', ecp : 'Q2/2027', label: 'Maintained' },
	{ version: '1.136', patch: '1.136.18', status: 'maintained', eom: '', ecp : 'Q2/2027', label: 'Maintained' },
	{ version: '1.136', patch: '1.136.17', status: 'maintained', eom: '', ecp : 'Q2/2027', label: 'Maintained' },
	{ version: '1.136', patch: '1.136.16', status: 'maintained', eom: '', ecp : 'Q2/2027', label: 'Maintained' },
	{ version: '1.136', patch: '1.136.15', status: 'maintained', eom: '', ecp : 'Q1/2027', label: 'Maintained' },
	{ version: '1.136', patch: '1.136.14', status: 'maintained', eom: '', ecp : 'Q1/2027', label: 'Maintained' },
	{ version: '1.136', patch: '1.136.13', status: 'maintained', eom: '', ecp : 'Q1/2027', label: 'Maintained' },
	{ version: '1.136', patch: '1.136.12', status: 'maintained', eom: '', ecp : 'Q4/2026', label: 'Maintained' },
	{ version: '1.136', patch: '1.136.11', status: 'maintained', eom: '', ecp : 'Q4/2026', label: 'Maintained' },
	{ version: '1.136', patch: '1.136.10', status: 'maintained', eom: '', ecp : 'Q4/2026', label: 'Maintained' },
	{ version: '1.136', patch: '1.136.9', status: 'maintained', eom: '', ecp : 'Q4/2026', label: 'Maintained' },
	{ version: '1.136', patch: '1.136.8', status: 'maintained', eom: '', ecp : 'Q4/2026', label: 'Maintained' },
	{ version: '1.136', patch: '1.136.7', status: 'maintained', eom: '', ecp : 'Q3/2026', label: 'Maintained' },
	{ version: '1.136', patch: '1.136.6', status: 'maintained', eom: '', ecp : 'Q3/2026', label: 'Maintained' },
	{ version: '1.136', patch: '1.136.5', status: 'maintained', eom: '', ecp : 'Q3/2026', label: 'Maintained' },
	{ version: '1.136', patch: '1.136.4', status: 'maintained', eom: '', ecp : 'Q3/2026', label: 'Maintained' },
	{ version: '1.136', patch: '1.136.3', status: 'maintained', eom: '', ecp : 'Q3/2026', label: 'Maintained' },
	{ version: '1.136', patch: '1.136.2', status: 'maintained', eom: '', ecp : 'Q2/2026', label: 'Maintained' },
	{ version: '1.136', patch: '1.136.1', status: 'maintained', eom: '', ecp : 'Q2/2026', label: 'Maintained' },
	{ version: '1.136', patch: '1.136.0', status: 'maintained', eom: '', ecp : 'Q2/2026', label: 'Maintained' },
	{ version: '1.135', patch: '1.135.0', status: 'maintained', eom: '', ecp : 'Q2/2026', label: 'Maintained' },
	{ version: '1.134', patch: '1.134.1', status: 'maintained', eom: '', ecp : 'Q2/2026', label: 'Maintained' },
	{ version: '1.134', patch: '1.134.0', status: 'eom', eom: '', ecp : 'Q1/2026', label: 'End of Maintenance' },
	{ version: '1.133', patch: '1.133.5', status: 'maintained', eom: '', ecp : 'Q3/2026', label: 'Maintained' },
	{ version: '1.133', patch: '1.133.4', status: 'maintained', eom: '', ecp : 'Q2/2026', label: 'Maintained' },
	{ version: '1.133', patch: '1.133.3', status: 'maintained', eom: '', ecp : 'Q2/2026', label: 'Maintained' },
	{ version: '1.133', patch: '1.133.2', status: 'maintained', eom: '', ecp : 'Q2/2026', label: 'Maintained' },
	{ version: '1.133', patch: '1.133.1', status: 'maintained', eom: '', ecp : 'Q2/2026', label: 'Maintained' },
	{ version: '1.130', patch: '1.130.11', status: 'maintained', eom: '', ecp : 'Q3/2026', label: 'Maintained' },
	{ version: '1.130', patch: '1.130.10', status: 'maintained', eom: '', ecp : 'Q2/2026', label: 'Maintained' },
	{ version: '1.130', patch: '1.130.9', status: 'maintained', eom: '', ecp : 'Q2/2026', label: 'Maintained' },
	{ version: '1.130', patch: '1.130.8', status: 'maintained', eom: '', ecp : 'Q2/2026', label: 'Maintained' },
	{ version: '1.130', patch: '1.130.7', status: 'eom', eom: '', ecp : 'Q1/2026', label: 'End of Maintenance' },
	{ version: '1.130', patch: '1.130.6', status: 'eom', eom: '', ecp : 'Q1/2026', label: 'End of Maintenance' },
	{ version: '1.130', patch: '1.130.5', status: 'eom', eom: '', ecp : 'Q1/2026', label: 'End of Maintenance' },
	{ version: '1.130', patch: '1.130.4', status: 'eom', eom: '', ecp : 'Q1/2026', label: 'End of Maintenance' },
	{ version: '1.130', patch: '1.130.3', status: 'eom', eom: '', ecp : 'Q1/2026', label: 'End of Maintenance' },
	{ version: '1.130', patch: '1.130.2', status: 'eom', eom: '', ecp : 'Q4/2025', label: 'End of Maintenance' },
	{ version: '1.130', patch: '1.130.1', status: 'eom', eom: '', ecp : 'Q4/2025', label: 'End of Maintenance' },
	{ version: '1.130', patch: '1.130.0', status: 'eom', eom: '', ecp : 'Q4/2025', label: 'End of Maintenance' },
  { version: '1.120', patch: '1.120.47', status: 'lts', eom: 'Q4/2030', ecp : 'Q4/2031', label: 'Maintained' },
	{ version: '1.120', patch: '1.120.46', status: 'maintained', eom: '', ecp : 'Q2/2027', label: 'Maintained' },
	{ version: '1.120', patch: '1.120.45', status: 'maintained', eom: '', ecp : 'Q2/2027', label: 'Maintained' },
	{ version: '1.120', patch: '1.120.44', status: 'maintained', eom: '', ecp : 'Q2/2027', label: 'Maintained' },
	{ version: '1.120', patch: '1.120.43', status: 'maintained', eom: '', ecp : 'Q2/2027', label: 'Maintained' },
	{ version: '1.120', patch: '1.120.42', status: 'maintained', eom: '', ecp : 'Q1/2027', label: 'Maintained' },
	{ version: '1.120', patch: '1.120.41', status: 'maintained', eom: '', ecp : 'Q1/2027', label: 'Maintained' },
	{ version: '1.120', patch: '1.120.40', status: 'maintained', eom: '', ecp : 'Q1/2027', label: 'Maintained' },
	{ version: '1.120', patch: '1.120.39', status: 'maintained', eom: '', ecp : 'Q4/2026', label: 'Maintained' },
	{ version: '1.120', patch: '1.120.38', status: 'maintained', eom: '', ecp : 'Q4/2026', label: 'Maintained' },
	{ version: '1.120', patch: '1.120.37', status: 'maintained', eom: '', ecp : 'Q3/2026', label: 'Maintained' },
	{ version: '1.120', patch: '1.120.36', status: 'maintained', eom: '', ecp : 'Q3/2026', label: 'Maintained' },
	{ version: '1.120', patch: '1.120.35', status: 'maintained', eom: '', ecp : 'Q3/2026', label: 'Maintained' },
	{ version: '1.120', patch: '1.120.34', status: 'maintained', eom: '', ecp : 'Q3/2026', label: 'Maintained' },
	{ version: '1.120', patch: '1.120.33', status: 'maintained', eom: '', ecp : 'Q3/2026', label: 'Maintained' },
	{ version: '1.120', patch: '1.120.32', status: 'maintained', eom: '', ecp : 'Q3/2026', label: 'Maintained' },
	{ version: '1.120', patch: '1.120.31', status: 'maintained', eom: '', ecp : 'Q2/2026', label: 'Maintained' },
	{ version: '1.120', patch: '1.120.30', status: 'maintained', eom: '', ecp : 'Q2/2026', label: 'Maintained' },
	{ version: '1.120', patch: '1.120.29', status: 'maintained', eom: '', ecp : 'Q2/2026', label: 'Maintained' },
	{ version: '1.120', patch: '1.120.28', status: 'maintained', eom: '', ecp : 'Q2/2026', label: 'Maintained' },
	{ version: '1.120', patch: '1.120.27', status: 'eom', eom: '', ecp : '', label: 'End of Maintenance' },
	{ version: '1.120', patch: '1.120.0', status: 'eom', eom: '', ecp : '', label: 'End of Maintenance' },
  { version: '1.108', patch: '1.108.54', status: 'lts', eom: 'Q4/2030', ecp : 'Q4/2031', label: 'Maintained' },
	{ version: '1.108', patch: '1.108.53', status: 'maintained', eom: '', ecp : 'Q2/2027', label: 'Maintained' },
	{ version: '1.108', patch: '1.108.52', status: 'maintained', eom: '', ecp : 'Q2/2027', label: 'Maintained' },
	{ version: '1.108', patch: '1.108.51', status: 'maintained', eom: '', ecp : 'Q2/2027', label: 'Maintained' },
	{ version: '1.108', patch: '1.108.50', status: 'maintained', eom: '', ecp : 'Q1/2027', label: 'Maintained' },
	{ version: '1.108', patch: '1.108.49', status: 'maintained', eom: '', ecp : 'Q1/2027', label: 'Maintained' },
	{ version: '1.108', patch: '1.108.48', status: 'maintained', eom: '', ecp : 'Q4/2026', label: 'Maintained' },
	{ version: '1.108', patch: '1.108.47', status: 'maintained', eom: '', ecp : 'Q4/2026', label: 'Maintained' },
	{ version: '1.108', patch: '1.108.46', status: 'maintained', eom: '', ecp : 'Q4/2026', label: 'Maintained' },
	{ version: '1.108', patch: '1.108.45', status: 'maintained', eom: '', ecp : 'Q3/2026', label: 'Maintained' },
	{ version: '1.108', patch: '1.108.44', status: 'maintained', eom: '', ecp : 'Q3/2026', label: 'Maintained' },
	{ version: '1.108', patch: '1.108.43', status: 'maintained', eom: '', ecp : 'Q2/2026', label: 'Maintained' },
	{ version: '1.108', patch: '1.108.42', status: 'maintained', eom: '', ecp : 'Q2/2026', label: 'Maintained' },
	{ version: '1.108', patch: '1.108.41', status: 'eom', eom: '', ecp : '', label: 'End of Maintenance' },
	{ version: '1.108', patch: '1.108.0', status: 'eom', eom: '', ecp : '', label: 'End of Maintenance' },
	{ version: '1.96', patch: '1.96.49', status: 'lts', eom: 'Q4/2026', ecp : 'Q4/2027', label: 'Maintained' },
  { version: '1.96', patch: '1.96.48', status: 'maintained', eom: '', ecp : 'Q2/2027', label: 'Maintained' },
	{ version: '1.96', patch: '1.96.47', status: 'maintained', eom: '', ecp : 'Q2/2027', label: 'Maintained' },
	{ version: '1.96', patch: '1.96.46', status: 'maintained', eom: '', ecp : 'Q2/2027', label: 'Maintained' },
	{ version: '1.96', patch: '1.96.45', status: 'maintained', eom: '', ecp : 'Q1/2027', label: 'Maintained' },
	{ version: '1.96', patch: '1.96.44', status: 'maintained', eom: '', ecp : 'Q4/2026', label: 'Maintained' },
	{ version: '1.96', patch: '1.96.43', status: 'maintained', eom: '', ecp : 'Q4/2026', label: 'Maintained' },
	{ version: '1.96', patch: '1.96.42', status: 'maintained', eom: '', ecp : 'Q3/2026', label: 'Maintained' },
	{ version: '1.96', patch: '1.96.41', status: 'maintained', eom: '', ecp : 'Q3/2026', label: 'Maintained' },
	{ version: '1.96', patch: '1.96.40', status: 'maintained', eom: '', ecp : 'Q2/2026', label: 'Maintained' },
	{ version: '1.96', patch: '1.96.39', status: 'eom', eom: '', ecp : '', label: 'End of Maintenance' },
	{ version: '1.96', patch: '1.96.0', status: 'eom', eom: '', ecp : '', label: 'End of Maintenance' },
  { version: '1.84', patch: '1.84.60', status: 'maintained', eom: '', ecp : 'To Be Determined', label: 'To Be Determined' },
	{ version: '1.84', patch: '1.84.59', status: 'maintained', eom: '', ecp : 'Q4/2026', label: 'Maintained' },
	{ version: '1.84', patch: '1.84.58', status: 'maintained', eom: '', ecp : 'Q4/2026', label: 'Maintained' },
	{ version: '1.84', patch: '1.84.57', status: 'maintained', eom: '', ecp : 'Q4/2026', label: 'Maintained' },
	{ version: '1.84', patch: '1.84.56', status: 'maintained', eom: '', ecp : 'Q4/2026', label: 'Maintained' },
	{ version: '1.84', patch: '1.84.55', status: 'maintained', eom: '', ecp : 'Q4/2026', label: 'Maintained' },
	{ version: '1.84', patch: '1.84.54', status: 'maintained', eom: '', ecp : 'Q3/2026', label: 'Maintained' },
	{ version: '1.84', patch: '1.84.53', status: 'maintained', eom: '', ecp : 'Q2/2026', label: 'Maintained' },
	{ version: '1.84', patch: '1.84.52', status: 'eom', eom: '', ecp : '', label: 'End of Maintenance' },
	{ version: '1.84', patch: '1.84.0', status: 'eom', eom: '', ecp : '', label: 'End of Maintenance' },
	{ version: '1.71', patch: '1.71.82', status: 'lts', eom: 'Q4/2030', ecp : 'Q4/2031', label: 'Maintained' },
	{ version: '1.71', patch: '1.71.81', status: 'maintained', eom: '', ecp : 'Q2/2027', label: 'Maintained' },
	{ version: '1.71', patch: '1.71.80', status: 'maintained', eom: '', ecp : 'Q1/2027', label: 'Maintained' },
	{ version: '1.71', patch: '1.71.79', status: 'maintained', eom: '', ecp : 'Q1/2027', label: 'Maintained' },
	{ version: '1.71', patch: '1.71.78', status: 'maintained', eom: '', ecp : 'Q4/2026', label: 'Maintained' },
	{ version: '1.71', patch: '1.71.77', status: 'maintained', eom: '', ecp : 'Q4/2026', label: 'Maintained' },
	{ version: '1.71', patch: '1.71.76', status: 'maintained', eom: '', ecp : 'Q3/2026', label: 'Maintained' },
	{ version: '1.71', patch: '1.71.75', status: 'maintained', eom: '', ecp : 'Q3/2026', label: 'Maintained' },
	{ version: '1.71', patch: '1.71.74', status: 'maintained', eom: '', ecp : 'Q2/2026', label: 'Maintained' },
	{ version: '1.71', patch: '1.71.73', status: 'eom', eom: '', ecp : '', label: 'End of Maintenance' },
	{ version: '1.71', patch: '1.84.0', status: 'eom', eom: '', ecp : '', label: 'End of Maintenance' },
	{ version: '1.38', patch: '1.38.68', status: 'lts', eom: 'Q4/2027', ecp : 'Q4/2028', label: 'Maintained' },
	{ version: '1.38', patch: '1.38.67', status: 'maintained', eom: '', ecp : 'Q2/2027', label: 'Maintained' },
	{ version: '1.38', patch: '1.38.66', status: 'maintained', eom: '', ecp : 'Q1/2027', label: 'Maintained' },
	{ version: '1.38', patch: '1.38.65', status: 'maintained', eom: '', ecp : 'Q4/2026', label: 'Maintained' },
	{ version: '1.38', patch: '1.38.64', status: 'maintained', eom: '', ecp : 'Q2/2026', label: 'Maintained' },
  { version: '1.38', patch: '1.38.63', status: 'eom', eom: '', ecp : '', label: 'End of Maintenance' },
	{ version: '1.38', patch: '1.38.0', status: 'eom', eom: '', ecp : '', label: 'End of Maintenance' },
  ],
};

// ---------------------------------------------------------------------------
// Dynamic variables — populated/refreshed by calling /api/sap/ui5/version
// ---------------------------------------------------------------------------

/**
 * Mirrors the structure of https://ui5.sap.com/versionoverview.json
 * null until the first successful refresh.
 */
let UI5_VERSION_OVERVIEW = null;

/**
 * Mirrors the structure of https://ui5.sap.com/version.json
 * null until the first successful refresh.
 */
let UI5_VERSION = null;

/**
 * Fetches both remote JSON files and updates the module-level variables.
 * Resolves to { UI5_VERSION_OVERVIEW, UI5_VERSION } on success.
 * Throws on network or parse errors.
 */
async function refreshUI5VersionData() {
  // Node 18+ has native fetch; for older versions require node-fetch or axios.
  const fetchFn = typeof fetch !== 'undefined' ? fetch : require('node-fetch');

  const [overviewRes, versionRes] = await Promise.all([
    fetchFn('https://ui5.sap.com/versionoverview.json'),
    fetchFn('https://ui5.sap.com/version.json'),
  ]);

  if (!overviewRes.ok) throw new Error(`versionoverview.json: HTTP ${overviewRes.status}`);
  if (!versionRes.ok)  throw new Error(`version.json: HTTP ${versionRes.status}`);

  UI5_VERSION_OVERVIEW = await overviewRes.json();
  UI5_VERSION         = await versionRes.json();

  return { UI5_VERSION_OVERVIEW, UI5_VERSION };
}

function quarterToMonth(q) {
  return { Q1: '03', Q2: '06', Q3: '09', Q4: '12' }[q];
}

function parseQuarterDate(value) {
  if (!value) return null;
  const match = value.match(/(Q[1-4])\/(\d{4})/);
  if (!match) return null;
  return new Date(`${match[2]}-${quarterToMonth(match[1])}-01`);
}

function ecpToNumber(ecp) {
    const match = ecp?.match(/Q([1-4])\/(\d{4})/);

    if (!match) {
        return -1; // ou Number.MIN_SAFE_INTEGER
    }

    const [, quarter, year] = match;
    return Number(year) * 10 + Number(quarter);
}
/**
 * Returns the best available "maintained" list for version checks:
 * live data when available, static fallback otherwise.
 */
function getEffectiveVersionData() {
  if (UI5_VERSION_OVERVIEW && Array.isArray(UI5_VERSION_OVERVIEW.patches)) {
    // versionoverview.json shape: { versions: [...], patches: [...], ... }
    const today = new Date();
    const data = [];
    for(const req of UI5_VERSION_OVERVIEW.patches) {
      const version = req.version.match(/^\d+\.\d+/)[0];
      const recherche = `${version}.*`;
      const version_data = UI5_VERSION_OVERVIEW.versions.find(v => v.version === recherche);

      let status = '';
      let eom = '';
      let ecp = req.eocp;
      let label = '';

      switch (version_data.support) {
          case "Maintenance":
              status = 'maintained';
              eom = version_data.eom;
              label = 'Maintained';
              break;

          case "Out of maintenance":
              status = 'eom';
              eom = ''
              label = 'End of Maintenance';
              break;

          case "Skipped":
              status = 'skipped';
              eom = version_data.eom;
              break;
          default:
              status = version_data.support;
              eom = version_data.eom;
      }
      
      if (version_data.lts === true) {
        status='lts';
        const match = version_data.eom.match(/Q[1-4]\/\d{4}/);
        eom =  match ? match[0] : null;
      }
      if ( ecp === 'To Be Determined') {
        label = 'To Be Determined';
        const matcheom = version_data.eom.match(/Q[1-4]\/\d{4}/);
        eom =  matcheom ? matcheom[0] : null;
        const matchecp = version_data.eocp.match(/Q[1-4]\/\d{4}/);
        ecp =  matchecp ? matchecp[0] : null;
      }
      const ecpDate = parseQuarterDate(ecp);
      if (ecpDate && ecpDate < today) {
        status = 'eom';
        eom = '';
      }
      const eomDate = parseQuarterDate(eom);
      if (eomDate > ecpDate) {
        eom = '';
      }
      data.push({
                  version:        version,
                  patch:          req.version,
                  status:         status,
                  eom:            eom,
                  ecp:            ecp,
                  extended_ecp:   req.extended_eocp,
                  label:          label,
                  sapuiversion:   req.sapuiversion,
                  frontendserver: req.frontendserver
      });
    }
    
    const maxItem = data.reduce((max, item) =>
      ecpToNumber(item.ecp) > ecpToNumber(max.ecp) ? item : max
  );

    const item = data.find(v => v.patch === maxItem.patch);
    if (item) item.label= 'LTS (Recommended)';

    const today = new Date().toISOString().split('T')[0];

    return {
      latest:     UI5_VERSION_OVERVIEW.activeVersion,
      lts:        maxItem.patch,
      lastupdate: today,
      maintained: data,
      source:     'ui5.sap.com',
    };
  }
  return UI5_VERSION_DATA;
}

// ---------------------------------------------------------------------------
// Security patterns (unchanged)
// ---------------------------------------------------------------------------

const UI5_SECURITY_PATTERNS = [
  { pattern: /new\s+sap\.ui\.core\.HTML\s*\(\s*\{[^}]*content\s*:\s*(?!['"`])/g, severity: 'HIGH',     code: 'UI5_XSS_HTML_CONTROL',  message: 'sap.ui.core.HTML with dynamic content - potential XSS' },
  { pattern: /\.innerHTML\s*=\s*(?!['"`])/g,                                       severity: 'HIGH',     code: 'UI5_XSS_INNERHTML',     message: 'Direct innerHTML assignment - XSS vulnerability' },
  { pattern: /\.outerHTML\s*=\s*/g,                                                 severity: 'HIGH',     code: 'UI5_XSS_OUTERHTML',     message: 'Avoid using `outerHTML` with unsanitized data' },
  { pattern: /eval\s*\(/g,                                                           severity: 'CRITICAL', code: 'UI5_EVAL',              message: 'Use of eval() - code injection risk' },
  { pattern: /document\.write\s*\(/g,                                               severity: 'HIGH',     code: 'UI5_DOCUMENT_WRITE',    message: 'document.write() - potential XSS' },
  { pattern: /sap\.ui\.getCore\(\)\.loadLibrary\s*\(/g,                             severity: 'MEDIUM',   code: 'UI5_DYNAMIC_LIBRARY',   message: 'Dynamic library loading detected' },
  { pattern: /jQuery\.ajax\s*\(/g,                                                  severity: 'MEDIUM',   code: 'UI5_JQUERY_AJAX',       message: 'Direct jQuery.ajax() usage - use sap.ui.model or fetch API' },
  { pattern: /new\s+sap\.ui\.model\.json\.JSONModel\s*\(\s*['"]http/g,             severity: 'MEDIUM',   code: 'UI5_JSONMODEL_HARDCODED_URL', message: 'JSONModel with hardcoded HTTP URL - use relative paths or destinations' },
];

const REDIRECT_PATTERNS = [
  { pattern: /window\.location\s*=\s*(?!['"`]\/)/g,                               severity: 'HIGH',   code: 'UI5_OPEN_REDIRECT',        message: 'Potential open redirect via window.location' },
  { pattern: /window\.location\.href\s*=\s*(?!['"`]\/)/g,                         severity: 'HIGH',   code: 'UI5_OPEN_REDIRECT_HREF',   message: 'Potential open redirect via window.location.href' },
  { pattern: /window\.open\s*\(\s*(?!['"`]\/|['"`]#|['"`]about)/g,               severity: 'MEDIUM', code: 'UI5_WINDOW_OPEN',          message: 'window.open() with non-static URL - validate target' },
];

const SENSITIVE_DATA_PATTERNS = [
  { pattern: /password\s*[:=]\s*['"][^'"]{3,}/gi,                                  severity: 'CRITICAL', code: 'UI5_HARDCODED_PASSWORD', message: 'Hardcoded password detected' },
  { pattern: /api[_-]?key\s*[:=]\s*['"][^'"]{8,}/gi,                              severity: 'CRITICAL', code: 'UI5_HARDCODED_APIKEY',   message: 'Hardcoded API key detected' },
  { pattern: /client[_-]?secret\s*[:=]\s*['"][^'"]{8,}/gi,                        severity: 'CRITICAL', code: 'UI5_HARDCODED_SECRET',   message: 'Hardcoded client secret detected' },
  { pattern: /localStorage\.setItem\s*\(\s*['"][^'"]*(?:token|auth|pass|secret)/gi, severity: 'HIGH',   code: 'UI5_LOCALSTORAGE_SENSITIVE', message: 'Sensitive data stored in localStorage' },
];

const OWASP_PATTERNS = [
  { pattern: /setTimeout\s*\(\s*(?!function|\(\))/g,                               severity: 'MEDIUM', code: 'UI5_SETTIMEOUT_STRING',    message: 'setTimeout with string argument - eval-like behaviour' },
  { pattern: /setInterval\s*\(\s*(?!function|\(\))/g,                              severity: 'MEDIUM', code: 'UI5_SETINTERVAL_STRING',   message: 'setInterval with string argument - eval-like behaviour' },
  { pattern: /prototype\s*\[/g,                                                    severity: 'HIGH',   code: 'UI5_PROTO_POLLUTION',      message: 'Potential prototype pollution via dynamic property access' },
  { pattern: /__proto__/g,                                                          severity: 'HIGH',   code: 'UI5_PROTO_DIRECT',         message: 'Direct __proto__ access - prototype pollution risk' },
];

const SAP_SPECIFIC_PATTERNS = [
  { pattern: /sap\.ui\.getCore\(\)\.getModel\(\)\.getData\(\)/g,                  severity: 'LOW',    code: 'UI5_MODEL_GETDATA',        message: 'Avoid getData() on large models; use bindings instead' },
  { pattern: /jQuery\.sap\./g,                                                     severity: 'MEDIUM', code: 'UI5_DEPRECATED_JQUERYSAP', message: 'jQuery.sap.* is deprecated - migrate to sap/base/* or native APIs' },
  { pattern: /sap\.ui\.commons\./g,                                                severity: 'HIGH',   code: 'UI5_DEPRECATED_COMMONS',   message: 'sap.ui.commons library is deprecated - migrate to sap.m' },
  { pattern: /sap\.ui\.ux3\./g,                                                    severity: 'HIGH',   code: 'UI5_DEPRECATED_UX3',       message: 'sap.ui.ux3 library is deprecated - migrate to sap.m' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function scanDefault(files, patterns) {
  const findings = [];
  const jsFiles = files.filter(f => /\.(js|ts|jsx|tsx)$/.test(f.name) && !f.name.includes('node_modules'));

  for (const file of jsFiles) {
    for (const { pattern, severity, code, message } of patterns) {
      const regex = new RegExp(pattern.source, pattern.flags);
      let match;
      while ((match = regex.exec(file.content)) !== null) {
        const lineNumber = file.content.substring(0, match.index).split('\n').length;
        findings.push({ severity, code, message, file: file.name, line: lineNumber });
      }
    }
  }
  return findings;
}

// ---------------------------------------------------------------------------
// Main scanner
// ---------------------------------------------------------------------------

function detectUI5Version(files) {
  const versionData = getEffectiveVersionData();

  const findings = {
    detectedVersion: null,
    latestVersion:   versionData.latest,
    ltsVersion:      versionData.lts,
    versionDate:     versionData.lastupdate,
    versionTable:    versionData.maintained,
    source:          versionData.source,
    sources:         [],
    issues:          [],
    currentStatus:   null,
    recommendations: [],
  };

  // Check bootstrap scripts
  const htmlFiles = files.filter(f => /\.html?$/.test(f.name));
  for (const file of htmlFiles) {
    const m = file.content.match(/sap-ui-bootstrap[^>]*?src=["'][^"']*\/(\d+\.\d+\.\d+)\//);
    if (m) {
      findings.sources.push({ file: file.name, key: 'bootstrap', value: m[1] });
      if (!findings.detectedVersion) findings.detectedVersion = m[1];
    }
  }

  // Check manifest.json
  const manifestFiles = files.filter(f => path.basename(f.name) === 'manifest.json');
  for (const file of manifestFiles) {
    try {
      const content = JSON.parse(file.content);
      const framework = content['sap.ui5']?.dependencies?.minUI5Version || content['sap.ui5']?.dependencies?.libs?.['sap.ui.core']?.minVersion;
      if (framework) {
        findings.sources.push({ file: file.name, key: 'manifest.minUI5Version', value: framework });
        if (!findings.detectedVersion) findings.detectedVersion = framework;
      }

      const fwEntry = content['sap.ui5']?.framework;
      if (fwEntry?.version) {
        findings.sources.push({ file: file.name, key: `framework.${fwEntry.name}`, value: fwEntry.version });
        if (!findings.detectedVersion) findings.detectedVersion = fwEntry.version;
      }

      // Missing CSP
      const csp = content['sap.ui5']?.contentSecurityPolicy;
      if (!csp && !content['sap.ui5']?.security?.['frame-options']) {
        findings.issues.push({ severity: 'MEDIUM', code: 'UI5_NO_CSP', message: 'No contentSecurityPolicy or frame-options defined in manifest.json sap.ui5 section - configure CSP headers via AppRouter instead', file: file.name });
      }

      // Wildcard CORS
      const allowedOrigins = content['sap.ui5']?.['allowed-cors-origins'];
      if (allowedOrigins && (allowedOrigins === '*' || allowedOrigins.includes('*'))) {
        findings.issues.push({ severity: 'HIGH', code: 'UI5_CORS_WILDCARD', message: 'sap.ui5 allowed-cors-origins contains wildcard "*" - restrict to known origins', file: file.name });
      }

      // Default version
      const appVersion = content['sap.app']?.applicationVersion?.version;
      if (appVersion && appVersion === '1.0.0') {
        findings.issues.push({ severity: 'INFO', code: 'UI5_DEFAULT_VERSION', message: 'sap.app.applicationVersion is "1.0.0" (default) - update for proper cache-busting and deployment tracking', file: file.name });
      }
    } catch (e) {
      findings.issues.push({ severity: 'LOW', message: `Cannot parse ${file.name}` });
    }
  }

  // Check ui5.yaml
  const ui5YamlFiles = files.filter(f => path.basename(f.name) === 'ui5.yaml');
  for (const file of ui5YamlFiles) {
    const m = file.content.match(/version:\s*["']?([\d.x]+)["']?/);
    if (m) {
      findings.sources.push({ file: file.name, key: 'framework.version', value: m[1] });
      if (!findings.detectedVersion) findings.detectedVersion = m[1];
    }
  }

  // Check package.json for UI5 CLI
  const pkgFiles = files.filter(f => path.basename(f.name) === 'package.json' && !f.name.includes('node_modules'));
  for (const file of pkgFiles) {
    try {
      const content = JSON.parse(file.content);
      const deps = { ...(content.dependencies || {}), ...(content.devDependencies || {}) };
      if (deps['@ui5/cli']) {
        findings.sources.push({ file: file.name, key: '@ui5/cli', value: deps['@ui5/cli'] });
      }
    } catch (e) {}
  }

  // Analyze detected version
  if (findings.detectedVersion) {
    const parts = findings.detectedVersion.replace(/[^0-9.]/g, '').split('.');
    const shortVer = `${parts[0]}.${parts[1] || '0'}`;
    const versionInfo = versionData.maintained.find(v => v.version === shortVer);

    if (versionInfo) {
      findings.currentStatus = versionInfo;
      if (versionInfo.status === 'eom') {
        findings.issues.push({ severity: 'HIGH', message: `UI5 version ${shortVer} is End of Maintenance (since ${versionInfo.eom})`, code: 'UI5_EOL' });
      } else if (versionInfo.status === 'maintained') {
        findings.issues.push({ severity: 'MEDIUM', message: `UI5 version ${shortVer} is maintained but not the LTS version (${versionData.lts})`, code: 'UI5_NOT_LTS' });
      }
    } else {
      findings.issues.push({ severity: 'CRITICAL', message: `UI5 version ${shortVer} is unknown or unsupported`, code: 'UI5_UNSUPPORTED' });
    }

    const latestMinor  = parseInt(versionData.latest.split('.')[1]);
    const detectedMinor = parseInt(parts[1] || 0);
    if (latestMinor - detectedMinor > 10) {
      findings.issues.push({ severity: 'MEDIUM', message: `${latestMinor - detectedMinor} minor versions behind latest release`, code: 'UI5_OUTDATED' });
    }
  } else {
    findings.issues.push({ severity: 'INFO', message: 'No UI5 version detected - may not be a UI5 project', code: 'UI5_NOT_DETECTED' });
  }

  findings.recommendations = [
    `Upgrade to LTS version ${versionData.lts} for longest support`,
    `Latest available: ${versionData.latest}`,
    'Reference: https://ui5.sap.com/versionoverview.html',
  ];

  // Scan code
  findings.codeVulnerabilities  = scanDefault(files, UI5_SECURITY_PATTERNS);
  findings.redirectVulnerabilities = scanDefault(files, REDIRECT_PATTERNS);
  findings.sensitiveData        = scanDefault(files, SENSITIVE_DATA_PATTERNS);
  findings.owasp                = scanDefault(files, OWASP_PATTERNS);
  findings.sapSpecific          = scanDefault(files, SAP_SPECIFIC_PATTERNS);

  return findings;
}

module.exports = {
  detectUI5Version,
  refreshUI5VersionData,
  getUI5VersionOverview: () => UI5_VERSION_OVERVIEW,
  getUI5Version:         () => UI5_VERSION,
};