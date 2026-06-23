'use strict';

const path = require('path');

const UI5_VERSION_DATA = {
  latest: '1.148.1',
  lts: '1.136.19',
  lastupdate: '2026-06-08',
  maintained: [
	{ version: '1.148', patch: '1.148.1', status: 'lts', eom: 'Q3/2027', ecp : 'Q3/2028', label: 'Latest' },
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
	{ version: '1.139', patch: '1.139.4', status: 'maintained', eom: '', ecp : 'Q1/2027', label: 'Maintained' },
	{ version: '1.139', patch: '1.139.3', status: 'maintained', eom: '', ecp : 'Q4/2026', label: 'Maintained' },
	{ version: '1.139', patch: '1.139.2', status: 'maintained', eom: '', ecp : 'Q4/2026', label: 'Maintained' },
	{ version: '1.139', patch: '1.139.1', status: 'maintained', eom: '', ecp : 'Q4/2026', label: 'Maintained' },
	{ version: '1.139', patch: '1.139.0', status: 'maintained', eom: '', ecp : 'Q4/2026', label: 'Maintained' },
	{ version: '1.138', patch: '1.138.1', status: 'maintained', eom: '', ecp : 'Q3/2026', label: 'Maintained' },
	{ version: '1.138', patch: '1.138.0', status: 'maintained', eom: '', ecp : 'Q3/2026', label: 'Maintained' },
	{ version: '1.136', patch: '1.136.19', status: 'lts', eom: 'Q4/2032', ecp : 'Q4/2033', label: 'LTS (Recommended)' },
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
	{ version: '1.120', patch: '1.120.46', status: 'lts', eom: 'Q4/2030', ecp : 'Q4/2031', label: 'Maintained' },
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
	{ version: '1.108', patch: '1.108.53', status: 'lts', eom: 'Q4/2030', ecp : 'Q4/2031', label: 'Maintained' },
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
	{ version: '1.96', patch: '1.96.48', status: 'lts', eom: 'Q4/2026', ecp : 'Q4/2027', label: 'Maintained' },
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
	{ version: '1.84', patch: '1.84.59', status: 'maintained', eom: '', ecp : 'To Be Determined', label: 'To Be Determined' },
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

const UI5_SECURITY_PATTERNS = [
  {
    pattern: /new\s+sap\.ui\.core\.HTML\s*\(\s*\{[^}]*content\s*:\s*(?!['"`])/g,
    severity: 'HIGH',
    code: 'UI5_XSS_HTML_CONTROL',
    message: 'sap.ui.core.HTML with dynamic content - potential XSS',
  },
  {
    pattern: /\.innerHTML\s*=\s*(?!['"`])/g,
    severity: 'HIGH',
    code: 'UI5_XSS_INNERHTML',
    message: 'Direct innerHTML assignment - XSS vulnerability',
  },
  {
    pattern: /\.outerHTML\s*=\s*/g,
    severity: 'HIGH',
    code: 'UI5_XSS_OUTERHTML',
    message: 'Avoid using `outerHTML` with unsanitized data',
  },
  {
    pattern: /eval\s*\(/g,
    severity: 'CRITICAL',
    code: 'UI5_EVAL',
    message: 'Use of eval() - code injection risk',
  },
  {
    pattern: /window\.location\s*=\s*(?!['"`])/g,
    severity: 'HIGH',
    code: 'UI5_OPEN_REDIRECT',
    message: 'Dynamic window.location assignment - open redirect risk',
  },
  {
    pattern: /jQuery\.sap\.encodeHTML|sap\.base\.security\.encodeXML/g,
    severity: 'INFO',
    code: 'UI5_ENCODE_OK',
    message: 'Good practice: using SAP encoding functions',
  },
  {
    pattern: /document\.write\s*\(/g,
    severity: 'HIGH',
    code: 'UI5_DOCUMENT_WRITE',
    message: 'document.write() usage - XSS risk',
  },
  {
    pattern: /new\s+Function\s*\(/g,
    severity: 'HIGH',
    code: 'UI5_NEW_FUNCTION',
    message: 'new Function() constructor - code injection risk',
  },
  {
    pattern: /\$\.ajax\s*\(\s*\{[^}]*url\s*:\s*(?!['"`])/g,
    severity: 'MEDIUM',
    code: 'UI5_DYNAMIC_AJAX',
    message: 'Dynamic AJAX URL - potential SSRF',
  },
  {
    pattern: /localStorage\s*\.\s*setItem\s*\([^,]*,\s*(?!JSON)/g,
    severity: 'LOW',
    code: 'UI5_LOCALSTORAGE_UNENCRYPTED',
    message: 'Storing potentially sensitive data in localStorage without serialization',
  },
  {
    pattern: /console\.(log|debug|info)\s*\([^)]*(?:password|token|secret|key|auth)/gi,
    severity: 'MEDIUM',
    code: 'UI5_SENSITIVE_LOG',
    message: 'Logging potentially sensitive information',
  },
  {
    pattern: /setTimeout\s*\(\s*['"`]/g,
    severity: 'MEDIUM',
    code: 'UI5_SET_TIMEOUT',
    message: 'Pass a function to `setTimeout`, not a string',
  },
  {
    pattern: /setInterval\s*\(\s*['"`]/g,
    severity: 'MEDIUM',
    code: 'UI5_SET_INTERVAL',
    message: 'Pass a function to `setInterval`, not a string',
  },
];

const REDIRECT_PATTERNS = [
  {
    pattern: /window\.location\s*=\s*(?!['"`][^'"`]*['"`])/g,
    severity: 'MEDIUM',
    code: 'REDIRECT_LOCATION',
    message: 'Validate and whitelist URLs before redirecting',
  },
  {
    pattern: /window\.location\.href\s*=\s*(?!['"`][^'"`]*['"`])/g,
    severity: 'MEDIUM',
    code: 'REDIRECT_LOCATION_HREF',
    message: 'Validate URLs using a whitelist',
  },
  {
    pattern: /window\.open\s*\(\s*(?!['"`][^'"`]*['"`])/g,
    severity: 'MEDIUM',
    code: 'REDIRECT_OPEN',
    message: 'Verify URLs before opening them',
  },
];

const SENSITIVE_DATA_PATTERNS = [
  {
    pattern: /localStorage\.(setItem|getItem)\s*\([^,)]+,?\s*(?:password|token|secret|key)/gi,
    severity: 'LOW',
    code: 'SENSITIVE_DATA_LOCAL',
    message: 'Do not store secrets in localStorage (accessible via XSS)',
  },
  {
    pattern: /sessionStorage\.(setItem|getItem)\s*\([^,)]+,?\s*(?:password|token|secret|key)/gi,
    severity: 'LOW',
    code: 'SENSITIVE_DATA_SESSION',
    message: 'Avoid storing sensitive tokens in sessionStorage',
  },
  {
    pattern: /console\.(log|info|debug|warn)\s*\([^)]*(?:password|token|secret|key)/gi,
    severity: 'LOW',
    code: 'SENSITIVE_DATA_CONSOLE',
    message: 'Never log sensitive data in production',
  },
]

const OWASP_PATTERNS = [
  {
    pattern: /require\s*\(\s*['"`]\.\.\/\.\.\/\.\.\/\.\.\/\//g,
    severity: 'HIGH',
    code: 'OWASP_REQUIRE',
    message: 'Validate and sanitize file paths',
  },
  {
    pattern: /fs\.(readFile|writeFile|unlink|readdir)\s*\([^,)]*(?:req\.|request\.|params\.|body\.)/g,
    severity: 'HIGH',
    code: 'OWASP_FS',
    message: 'Strictly sanitize and validate paths from user requests',
  },
  {
    pattern: /child_process\.(exec|spawn|execSync)\s*\([^,)]*(?:\+|\$\{)/g,
    severity: 'CRITICAL',
    code: 'OWASP_CHILD_PROCESS',
    message: 'Never use user data in `child_process` without sanitizing it first',
  },
  {
    pattern: /(?:http|https)\.request\s*\([^)]*(?:req\.|request\.|params\.|body\.)/g,
    severity: 'HIGH',
    code: 'OWASP_HTTP',
    message: 'Validate and whitelist the URLs used in outbound HTTP requests',
  },
  {
    pattern: /deserializ/gi,
    severity: 'MEDIUM',
    code: 'OWASP_DESERIALIZ',
    message: 'Verify that deserialization is secure and does not come from untrusted sources',
  },
];

const SAP_SPECIFIC_PATTERNS = [
  {
    pattern: /sap\.ui\.getCore\(\)\.getConfiguration\(\)\.setSecurityTokenHandlers/g,
    severity: 'HIGH',
    code: 'SAP_SPECIFIC_GETCORE',
    message: 'Don t modify security token handlers without validation',
  },
  {
    pattern: /jQuery\.sap\.loadResource\s*\([^)]*(?:\+|\$\{)/g,
    severity: 'MEDIUM',
    code: 'SAP_SPECIFIC_JQUERY',
    message: 'Avoid dynamically constructed resource paths',
  },
  {
    pattern: /sap\.ui\.require\s*\(\s*\[[^\]]*(?:\+|\$\{)/g,
    severity: 'MEDIUM',
    code: 'SAP_SPECIFIC_REQUIRE',
    message: 'Avoid dynamically constructed module names',
  },
  {
    pattern: /jQuery\.ajax\s*\(\s*\{[^}]*url\s*:\s*(?!['"`][^'"`]*['"`])/g,
    severity: 'MEDIUM',
    code: 'SAP_SPECIFIC_JQUERY_AJAX',
    message: 'Validate the URLs used in jQuery.ajax calls',
  },
  {
    pattern: /sap\.ui\.core\.BusyIndicator\.(show|hide)/g,
    severity: 'INFO',
    code: 'SAP_SPECIFIC_JQUERY_AJAX',
    message: 'Make sure the BusyIndicator remains hidden even if an error occurs',
  },

];

function scanDefault(files, patterns) {
  const vulnerabilities = [];

  const jsFiles = files.filter(f =>
    (f.name.endsWith('.js') || f.name.endsWith('.ts') || f.name.endsWith('.jsx') || f.name.endsWith('.tsx')) &&
    !f.name.includes('node_modules') &&
    !f.name.includes('.min.')
  );

  for (const file of jsFiles) {
    const lines = file.content.split('\n');
    for (const rule of patterns) {
      const matches = [...file.content.matchAll(rule.pattern)];
      for (const match of matches) {
        const lineNum = file.content.substring(0, match.index).split('\n').length;
        if (rule.code !== 'UI5_ENCODE_OK') {
          vulnerabilities.push({
            severity: rule.severity,
            code: rule.code,
            message: rule.message,
            file: file.name,
            line: lineNum,
            snippet: lines[lineNum - 1]?.trim().substring(0, 100) || '',
          });
        }
      }
    }
  }

  return vulnerabilities;
}


function detectUI5Version(files) {
  const findings = {
    detectedVersion: null,
    sources: [],
    currentStatus: null,
    latestVersion: UI5_VERSION_DATA.latest,
    ltsVersion: UI5_VERSION_DATA.lts,
    versionTable: UI5_VERSION_DATA.maintained,
	  versionDate: UI5_VERSION_DATA.lastupdate,
    issues: [],
    recommendations: [],
    codeVulnerabilities: [],
    redirectVulnerabilities: [],
    sensitiveData: [],
    owasp: [],
    sapSpecific: [],
  };

  // Check manifest.json
  const manifestFiles = files.filter(f => path.basename(f.name) === 'manifest.json');
  for (const file of manifestFiles) {
    try {
      const content = JSON.parse(file.content);
      const minVersion = content['sap.ui5']?.dependencies?.minUI5Version;
      if (minVersion) {
        findings.detectedVersion = minVersion;
        findings.sources.push({ file: file.name, key: 'sap.ui5.dependencies.minUI5Version', value: minVersion });
      }
      const framework = content['sap.ui5']?.framework;
      if (framework?.version) {
        findings.sources.push({ file: file.name, key: `framework.${framework.name}`, value: framework.version });
        if (!findings.detectedVersion) findings.detectedVersion = framework.version;
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
    const versionInfo = UI5_VERSION_DATA.maintained.find(v => v.version === shortVer);

    if (versionInfo) {
      findings.currentStatus = versionInfo;
      if (versionInfo.status === 'eom') {
        findings.issues.push({ severity: 'HIGH', message: `UI5 version ${shortVer} is End of Maintenance (since ${versionInfo.eom})`, code: 'UI5_EOL' });
      } else if (versionInfo.status === 'maintained') {
        findings.issues.push({ severity: 'MEDIUM', message: `UI5 version ${shortVer} is maintained but not the LTS version (${UI5_VERSION_DATA.lts})`, code: 'UI5_NOT_LTS' });
      }
    } else {
      findings.issues.push({ severity: 'CRITICAL', message: `UI5 version ${shortVer} is unknown or unsupported`, code: 'UI5_UNSUPPORTED' });
    }

    const latestMinor = parseInt(UI5_VERSION_DATA.latest.split('.')[1]);
    const detectedMinor = parseInt(parts[1] || 0);
    if (latestMinor - detectedMinor > 10) {
      findings.issues.push({ severity: 'MEDIUM', message: `${latestMinor - detectedMinor} minor versions behind latest release`, code: 'UI5_OUTDATED' });
    }
  } else {
    findings.issues.push({ severity: 'INFO', message: 'No UI5 version detected - may not be a UI5 project', code: 'UI5_NOT_DETECTED' });
  }

  findings.recommendations = [
    `Upgrade to LTS version ${UI5_VERSION_DATA.lts} for longest support`,
    `Latest available: ${UI5_VERSION_DATA.latest}`,
    'Reference: https://ui5.sap.com/versionoverview.html',
  ];

  // Scan code
  findings.codeVulnerabilities = scanDefault(files, UI5_SECURITY_PATTERNS);
  findings.redirectVulnerabilities = scanDefault(files, REDIRECT_PATTERNS);
  findings.sensitiveData = scanDefault(files, SENSITIVE_DATA_PATTERNS);
  findings.owasp = scanDefault(files, OWASP_PATTERNS);
  findings.sapSpecific = scanDefault(files, SAP_SPECIFIC_PATTERNS);

  return findings;
}

module.exports = { detectUI5Version };
