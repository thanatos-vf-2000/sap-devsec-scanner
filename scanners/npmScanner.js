'use strict';

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Known vulnerable SAP package versions (static database supplement)
const SAP_KNOWN_VULNS = [
  {
    package: '@sap/xssec',
    affectedVersions: '<3.2.0',
    severity: 'HIGH',
    cve: 'CVE-2023-25615',
    description: 'Improper authorization in XSUAA validation',
    fix: '>=3.2.0',
  },
  {
    package: '@sap/cds',
    affectedVersions: '<6.0.0',
    severity: 'MEDIUM',
    cve: 'CVE-2022-39802',
    description: 'Path traversal vulnerability in CDS serve',
    fix: '>=6.0.0',
  },
  {
    package: '@sap/approuter',
    affectedVersions: '<12.0.0',
    severity: 'HIGH',
    cve: 'CVE-2022-41271',
    description: 'Log injection in approuter request handling',
    fix: '>=12.0.0',
  },
];

const OUTDATED_THRESHOLD_DAYS = 365;

function parseSemver(version) {
  const clean = version.replace(/^[^0-9]*/, '');
  const parts = clean.split('.');
  return {
    major: parseInt(parts[0] || 0),
    minor: parseInt(parts[1] || 0),
    patch: parseInt(parts[2] || 0),
    raw: version,
  };
}

function versionSatisfies(version, range) {
  // Simple range check for < operator
  const match = range.match(/^<([\d.]+)$/);
  if (!match) return false;
  const threshold = parseSemver(match[1]);
  const current = parseSemver(version);

  if (current.major !== threshold.major) return current.major < threshold.major;
  if (current.minor !== threshold.minor) return current.minor < threshold.minor;
  return current.patch < threshold.patch;
}

function checkSAPPackages(dependencies) {
  const issues = [];

  for (const vuln of SAP_KNOWN_VULNS) {
    const installedVersion = dependencies[vuln.package];
    if (!installedVersion) continue;

    const cleanVersion = installedVersion.replace(/^[^0-9]*/, '');
    if (versionSatisfies(cleanVersion, vuln.affectedVersions)) {
      issues.push({
        severity: vuln.severity,
        package: vuln.package,
        version: installedVersion,
        cve: vuln.cve,
        description: vuln.description,
        fix: vuln.fix,
        source: 'SAP Advisory',
      });
    }
  }

  return issues;
}

function analyzePackageJson(files) {
  const results = {
    packages: [],
    issues: [],
    sapPackages: [],
    auditResults: null,
    summary: { total: 0, sap: 0, critical: 0, high: 0, medium: 0, low: 0 },
  };

  const pkgFiles = files.filter(f =>
    path.basename(f.name) === 'package.json' &&
    !f.name.includes('node_modules')
  );

  for (const file of pkgFiles) {
    try {
      const pkg = JSON.parse(file.content);
      const allDeps = {
        ...(pkg.dependencies || {}),
        ...(pkg.devDependencies || {}),
      };

      results.packages.push({
        file: file.name,
        name: pkg.name,
        version: pkg.version,
        dependencies: allDeps,
        dependencyCount: Object.keys(allDeps).length,
      });

      results.summary.total += Object.keys(allDeps).length;

      // Find SAP packages
      for (const [name, version] of Object.entries(allDeps)) {
        if (name.startsWith('@sap/') || name.startsWith('sap-')) {
          results.sapPackages.push({ name, version, file: file.name });
          results.summary.sap++;
        }
      }

      // Check known SAP vulnerabilities
      const sapIssues = checkSAPPackages(allDeps);
      for (const issue of sapIssues) {
        results.issues.push({ ...issue, file: file.name });
        results.summary[issue.severity.toLowerCase()]++;
      }

      // Check for very old or risky patterns
      for (const [name, version] of Object.entries(allDeps)) {
        // Check for wildcard versions
        if (version === '*' || version === 'latest') {
          results.issues.push({
            severity: 'MEDIUM',
            package: name,
            version,
            description: 'Unpinned version (wildcard) - non-deterministic builds',
            source: 'Best Practice',
            file: file.name,
          });
        }
      }

      // Try npm audit if package.json has a lockfile neighbor
      const lockFile = files.find(f =>
        f.name.includes('package-lock.json') ||
        f.name.includes('yarn.lock')
      );

      if (lockFile) {
        results.issues.push({
          severity: 'INFO',
          package: 'npm audit',
          description: 'Lock file found - run "npm audit" in project directory for full vulnerability report',
          source: 'Recommendation',
          file: file.name,
        });
      } else {
        results.issues.push({
          severity: 'LOW',
          package: 'lockfile',
          description: 'No package-lock.json or yarn.lock found - run "npm install" to generate',
          source: 'Best Practice',
          file: file.name,
        });
      }
    } catch (e) {
      results.issues.push({
        severity: 'LOW',
        package: 'parse-error',
        description: `Cannot parse ${file.name}: ${e.message}`,
        source: 'Parser',
        file: file.name,
      });
    }
  }

  return results;
}

module.exports = { analyzePackageJson };
