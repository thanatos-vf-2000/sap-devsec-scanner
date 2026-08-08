'use strict';

const path = require('path');
const semver = require('semver');

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
  // NEW entries
  {
    package: '@sap/hdbext',
    affectedVersions: '<7.0.0',
    severity: 'MEDIUM',
    cve: 'CVE-2022-28214',
    description: 'Improper error handling exposes internal HANA connection details',
    fix: '>=7.0.0',
  },
  {
    package: '@sap/xsenv',
    affectedVersions: '<3.1.0',
    severity: 'LOW',
    cve: 'CVE-2021-33690',
    description: 'Server-side request forgery via proxy configuration in xsenv',
    fix: '>=3.1.0',
  },
  {
    package: 'passport',
    affectedVersions: '<0.6.0',
    severity: 'HIGH',
    cve: 'CVE-2022-25896',
    description: 'Session fixation attack in passport.js',
    fix: '>=0.6.0',
  },
  {
    package: 'jsonwebtoken',
    affectedVersions: '<9.0.0',
    severity: 'HIGH',
    cve: 'CVE-2022-23529',
    description: 'Insecure implementation allows JWT token forgery',
    fix: '>=9.0.0',
  },
  {
    package: 'express',
    affectedVersions: '<4.19.0',
    severity: 'HIGH',
    cve: 'CVE-2024-29041',
    description: 'Open redirect via malformed URL in express',
    fix: '>=4.19.0',
  },
  {
    package: 'axios',
    affectedVersions: '<1.6.0',
    severity: 'HIGH',
    cve: 'CVE-2023-45857',
    description: 'CSRF vulnerability - confidential headers sent to third-party redirects',
    fix: '>=1.6.0',
  },
  {
    package: 'helmet',
    affectedVersions: '<7.0.0',
    severity: 'MEDIUM',
    cve: null,
    description: 'helmet <7.0.0 does not enable all modern security headers by default',
    fix: '>=7.0.0',
  },
];

// NEW: Security-relevant packages that should be present in SAP BTP apps
const RECOMMENDED_PACKAGES = [
  { package: 'helmet', reason: 'Sets secure HTTP headers (CSP, HSTS, X-Frame-Options, etc.)' },
  { package: '@sap/xssec', reason: 'Required for XSUAA JWT validation' },
  { package: '@sap/audit-logging', reason: 'Required for GDPR audit logging on BTP' },
];

// NEW: Packages that should never be in production dependencies
const FORBIDDEN_IN_PROD = [
  { package: '@sap/cds-dk', reason: 'Development toolkit - move to devDependencies' },
  { package: 'nodemon', reason: 'Dev auto-restart tool - move to devDependencies' },
  { package: 'jest', reason: 'Test framework - move to devDependencies' },
  { package: 'mocha', reason: 'Test framework - move to devDependencies' },
  { package: 'chai', reason: 'Assertion library - move to devDependencies' },
  { package: 'sinon', reason: 'Test stub library - move to devDependencies' },
];

const OUTDATED_THRESHOLD_DAYS = 365;

const NPM_REGISTRY_URL = 'https://registry.npmjs.org';
const LATEST_CONCURRENCY = 8;

function isResolvableVersionSpec(spec) {
  if (typeof spec !== 'string' || !spec.trim()) return false;
  const value = spec.trim();
  return !/^(?:\*|latest|workspace:|file:|link:|git\+|git:|https?:|github:)/i.test(value);
}

function getDeclaredVersion(spec) {
  if (!isResolvableVersionSpec(spec)) return null;
  try {
    return semver.minVersion(spec)?.version || null;
  } catch (e) {
    return null;
  }
}

function getPackageLockVersions(lockFile) {
  const versions = new Map();
  let lock;
  try {
    lock = JSON.parse(lockFile.content);
  } catch (e) {
    return versions;
  }

  // npm lockfile v2/v3: prefer top-level node_modules entries.
  if (lock.packages && typeof lock.packages === 'object') {
    for (const [key, entry] of Object.entries(lock.packages)) {
      if (!key.startsWith('node_modules/') || !entry?.version) continue;
      const packageName = key.slice('node_modules/'.length);
      if (!packageName.includes('/node_modules/')) versions.set(packageName, entry.version);
    }
  }

  // npm lockfile v1 fallback.
  function walkDependencies(deps) {
    if (!deps || typeof deps !== 'object') return;
    for (const [name, entry] of Object.entries(deps)) {
      if (entry?.version && !versions.has(name)) versions.set(name, entry.version);
      if (entry?.dependencies) walkDependencies(entry.dependencies);
    }
  }
  walkDependencies(lock.dependencies);
  return versions;
}

function getYarnLockVersions(lockFile) {
  const versions = new Map();
  const lines = String(lockFile.content || '').split(/\r?\n/);
  let currentNames = [];
  let currentVersion = null;

  const flush = () => {
    if (!currentVersion) return;
    for (const name of currentNames) {
      if (!versions.has(name)) versions.set(name, currentVersion);
    }
    currentNames = [];
    currentVersion = null;
  };

  for (const line of lines) {
    if (!line.trim() || line.startsWith('#')) continue;
    if (!/^\s/.test(line)) {
      flush();
      const key = line.replace(/:$/, '').trim();
      const tokens = [...key.matchAll(/(?:^|,\s*)["']?([^,"']+)["']?/g)].map(m => m[1].trim());
      currentNames = tokens.map(value => {
        const match = value.match(/^(@[^/]+\/[^@]+|[^@]+)@/);
        return match ? match[1] : null;
      }).filter(Boolean);
      continue;
    }
    const versionMatch = line.match(/^\s+version\s+["']([^"']+)["']/);
    if (versionMatch) currentVersion = versionMatch[1];
  }
  flush();
  return versions;
}

function getLockFileInfo(files, packageFileName) {
  const packageDir = path.posix.dirname(packageFileName || '');
  const lockCandidates = files.filter(f =>
    ['package-lock.json', 'npm-shrinkwrap.json', 'yarn.lock'].includes(path.basename(f.name))
  );

  // Prefer a lock file in the same directory, then the closest ancestor.
  const ranked = lockCandidates
    .map(file => {
      const lockDir = path.posix.dirname(file.name);
      const relative = path.posix.relative(lockDir, packageDir);
      const isAncestor = relative === '' || (!relative.startsWith('..') && !path.posix.isAbsolute(relative));
      const distance = isAncestor ? relative.split('/').filter(Boolean).length : Number.MAX_SAFE_INTEGER;
      return { file, isAncestor, distance };
    })
    .sort((a, b) => {
      if (a.isAncestor !== b.isAncestor) return a.isAncestor ? -1 : 1;
      return a.distance - b.distance;
    });

  const selected = ranked[0]?.file;
  if (!selected) return null;

  const basename = path.basename(selected.name);
  if (basename === 'package-lock.json') {
    return { type: 'package-lock', file: selected, versions: getPackageLockVersions(selected) };
  }
  if (basename === 'npm-shrinkwrap.json') {
    return { type: 'npm-shrinkwrap', file: selected, versions: getPackageLockVersions(selected) };
  }
  return { type: 'yarn.lock', file: selected, versions: getYarnLockVersions(selected) };
}

async function fetchLatestVersion(packageName, cache) {
  if (cache.has(packageName)) return cache.get(packageName);

  const promise = (async () => {
    try {
      const encodedName = encodeURIComponent(packageName).replace('%2F', '/');
      const response = await fetch(`${NPM_REGISTRY_URL}/${encodedName}/latest`, {
        headers: { accept: 'application/json' },
      });
      if (!response.ok) return null;
      const data = await response.json();
      return semver.valid(data?.version) ? data.version : null;
    } catch (e) {
      return null;
    }
  })();

  cache.set(packageName, promise);
  return promise;
}

function classifyVersionUpdate(currentVersion, latestVersion) {
  const current = semver.valid(currentVersion);
  const latest = semver.valid(latestVersion);
  if (!current || !latest || !semver.lt(current, latest)) return null;

  const diff = semver.diff(current, latest);
  if (diff === 'major' || diff === 'premajor') return 'HIGH';
  if (diff === 'minor' || diff === 'preminor') return 'MEDIUM';
  return 'LOW';
}

async function checkLatestVersions(dependencies, lockInfo, fileName) {
  const entries = Object.entries(dependencies)
    .map(([name, spec]) => {
      const lockedVersion = lockInfo?.versions.get(name);
      const currentVersion = lockedVersion || getDeclaredVersion(spec);
      return {
        name,
        spec,
        currentVersion,
        source: lockedVersion ? lockInfo.type : 'package.json',
      };
    })
    .filter(item => item.currentVersion && semver.valid(item.currentVersion));

  const cache = new Map();
  const updates = [];
  let cursor = 0;

  async function worker() {
    while (cursor < entries.length) {
      const item = entries[cursor++];
      const latestVersion = await fetchLatestVersion(item.name, cache);
      if (!latestVersion) continue;

      const severity = classifyVersionUpdate(item.currentVersion, latestVersion);
      if (!severity) continue;

      updates.push({
        severity,
        package: item.name,
        version: item.currentVersion,
        latestVersion,
        requested: item.spec,
        versionSource: item.source,
        code: 'NPM_OUTDATED',
        description: `${item.name}: Current version ${item.currentVersion} is behind the latest npm version ${latestVersion}`,
        source: 'npm registry',
        file: fileName,
      });
    }
  }

  await Promise.all(Array.from(
    { length: Math.min(LATEST_CONCURRENCY, Math.max(1, entries.length)) },
    () => worker()
  ));

  return updates.sort((a, b) => a.package.localeCompare(b.package));
}

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
        code: vuln.cve,
        description: `${vuln.description} (fix: ${vuln.fix})`,
        fix: vuln.fix,
        source: vuln.cve ? 'SAP Advisory / NVD' : 'Best Practice',
      });
    }
  }

  return issues;
}

async function analyzePackageJson(files) {
  const results = {
    packages: [],
    issues: [],
    sapPackages: [],
    auditResults: null,
    versionUpdates: [],
    summary: { total: 0, sap: 0, critical: 0, high: 0, medium: 0, low: 0, info: 0 },
  };

  const pkgFiles = files.filter(f =>
    path.basename(f.name) === 'package.json' &&
    !f.name.includes('node_modules')
  );

  for (const file of pkgFiles) {
    try {
      const pkg = JSON.parse(file.content);
      const prodDeps = pkg.dependencies || {};
      const devDeps = pkg.devDependencies || {};
      const allDeps = { ...prodDeps, ...devDeps };
      const lockInfo = getLockFileInfo(files, file.name);

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

      // Check known vulnerabilities
      const sapIssues = checkSAPPackages(allDeps);
      for (const issue of sapIssues) {
        results.issues.push({ ...issue, file: file.name });
        results.summary[(issue.severity || 'low').toLowerCase()]++;
      }

      // Compare the current/installed version with the latest version published on npm.
      // When a lock file exists, its installed version takes precedence over package.json.
      const versionUpdates = await checkLatestVersions(allDeps, lockInfo, file.name);
      for (const update of versionUpdates) {
        results.versionUpdates.push(update);
        results.issues.push(update);
        results.summary[update.severity.toLowerCase()]++;
      }

      // Check for wildcard versions
      for (const [name, version] of Object.entries(allDeps)) {
        if (version === '*' || version === 'latest') {
          results.issues.push({
            severity: 'MEDIUM',
            package: name,
            version,
            code: 'VERSION_WILCARD',
            description: 'Unpinned version (wildcard) - non-deterministic builds',
            source: 'Best Practice',
            file: file.name,
          });
          results.summary.medium++;
        }
      }

      // NEW: Check for dev-only packages in production dependencies
      for (const forbidden of FORBIDDEN_IN_PROD) {
        if (prodDeps[forbidden.package]) {
          results.issues.push({
            severity: 'LOW',
            package: forbidden.package,
            version: prodDeps[forbidden.package],
            description: `${forbidden.package} in production dependencies: ${forbidden.reason}`,
            code: 'FORBIDDEN_IN_PROD',
            source: 'Best Practice',
            file: file.name,
          });
          results.summary.low++;
        }
      }

      // NEW: Check for recommended security packages missing from production deps
      for (const rec of RECOMMENDED_PACKAGES) {
        if (!prodDeps[rec.package] && !allDeps[rec.package]) {
          results.issues.push({
            severity: 'INFO',
            package: rec.package,
            version: null,
            code: 'RECOMMENDED_PACKAGES',
            description: `Recommended security package missing: ${rec.package} - ${rec.reason}`,
            source: 'SAP Best Practice',
            file: file.name,
          });
          results.summary.info++;
        }
      }

      // NEW: Check for missing "engines" field (node version pinning)
      if (!pkg.engines || !pkg.engines.node) {
        results.issues.push({
          severity: 'LOW',
          package: pkg.name || 'unknown',
          description: 'No "engines.node" field - pin the Node.js version to avoid supply-chain runtime differences',
          source: 'Best Practice',
          code: 'MISSING_ENGINES',
          file: file.name,
        });
      }

      // NEW: Detect use of npm scripts that could be exploited (preinstall/postinstall)
      const scripts = pkg.scripts || {};
      for (const hook of ['preinstall', 'postinstall', 'prepare']) {
        if (scripts[hook]) {
          results.issues.push({
            severity: 'MEDIUM',
            package: pkg.name || 'unknown',
            description: `npm lifecycle hook "${hook}" detected: "${scripts[hook]}" - review for supply-chain risk`,
            code: 'NPM_SCRIPT',
            source: 'Supply Chain',
            file: file.name,
          });
        }
      }

      // Lockfile recommendation
      const lockFile = lockInfo?.file || null;

      if (lockFile) {
        results.issues.push({
          severity: 'INFO',
          package: 'npm audit',
          description: 'Lock file found - run "npm audit" in project directory for full vulnerability report',
          code: 'LOCK_FILE',
          source: 'Recommendation',
          file: file.name,
        });
      } else {
        results.issues.push({
          severity: 'LOW',
          package: 'lockfile',
          description: 'No package-lock.json, npm-shrinkwrap.json or yarn.lock found - run "npm install" to generate',
          code: 'NO_LOCK_FILE',
          source: 'Best Practice',
          file: file.name,
        });
        results.summary.low++;
      }
    } catch (e) {
      results.issues.push({
        severity: 'LOW',
        package: 'parse-error',
        description: `Cannot parse ${file.name}: ${e.message}`,
        code: 'PARSE_ERROR',
        source: 'Parser',
        file: file.name,
      });
    }
  }

  return results;
}

module.exports = { analyzePackageJson };