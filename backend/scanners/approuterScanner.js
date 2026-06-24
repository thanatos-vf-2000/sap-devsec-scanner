'use strict';

/**
 * approuterScanner.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Scans SAP AppRouter configuration for security issues:
 *   - xs-app.json  : routes, authentication, CSRF, frame-options, CSP
 *   - xs-security.json (oauth2-configuration.redirect-uris)
 *   - package.json (@sap/approuter version)
 *   - Environment / mta.yaml approuter module settings
 *
 * Based on:
 *   • SAP AppRouter documentation (https://help.sap.com/docs/app-router)
 *   • capire Security Aspects (https://cap.cloud.sap/docs/guides/security/aspects)
 *   • SAP BTP Security Recommendations
 *   • btp-secure-development workshop exercises
 * ─────────────────────────────────────────────────────────────────────────────
 */

const path = require('path');

// ─── Minimum recommended @sap/approuter version ──────────────────────────────
const MIN_APPROUTER_VERSION = '14.0.0';

// ─── Dangerous authenticationType values ─────────────────────────────────────
const UNSAFE_AUTH_TYPES = new Set(['none', 'NoAuthentication']);

// ─── Required security response headers (should appear in httpHeaders or helmet) ─
const REQUIRED_SECURITY_HEADERS = [
  { header: 'Content-Security-Policy', code: 'AR_MISSING_CSP', severity: 'HIGH', message: 'Content-Security-Policy header not configured — set via httpHeaders in xs-app.json or use helmet in server.js' },
  { header: 'X-Frame-Options', code: 'AR_MISSING_XFO', severity: 'MEDIUM', message: 'X-Frame-Options not set — protects against clickjacking; use DENY or SAMEORIGIN' },
  { header: 'X-Content-Type-Options', code: 'AR_MISSING_XCTO', severity: 'MEDIUM', message: 'X-Content-Type-Options: nosniff not set — prevents MIME-type sniffing attacks' },
  { header: 'Strict-Transport-Security', code: 'AR_MISSING_HSTS', severity: 'MEDIUM', message: 'Strict-Transport-Security (HSTS) not configured — enforce HTTPS-only communication' },
  { header: 'Referrer-Policy', code: 'AR_MISSING_RP', severity: 'LOW', message: 'Referrer-Policy not set — consider "strict-origin-when-cross-origin" to limit referrer leakage' },
];

// ─── Unsafe CSP directive values ─────────────────────────────────────────────
const UNSAFE_CSP_VALUES = [
  { value: "'unsafe-inline'", code: 'AR_CSP_UNSAFE_INLINE', severity: 'HIGH', message: "CSP contains 'unsafe-inline' — allows inline scripts/styles, undermining XSS protection; use nonces or hashes instead" },
  { value: "'unsafe-eval'", code: 'AR_CSP_UNSAFE_EVAL', severity: 'HIGH', message: "CSP contains 'unsafe-eval' — allows eval() and Function() constructors; remove if possible" },
  { value: '*', code: 'AR_CSP_WILDCARD', severity: 'HIGH', message: "CSP directive uses wildcard '*' — restrict to specific trusted origins" },
];

function parseSemver(version) {
  const clean = (version || '').replace(/^[^0-9]*/, '');
  const parts = clean.split('.');
  return {
    major: parseInt(parts[0] || 0, 10),
    minor: parseInt(parts[1] || 0, 10),
    patch: parseInt(parts[2] || 0, 10),
  };
}

function isVersionBelow(version, threshold) {
  const v = parseSemver(version);
  const t = parseSemver(threshold);
  if (v.major !== t.major) return v.major < t.major;
  if (v.minor !== t.minor) return v.minor < t.minor;
  return v.patch < t.patch;
}

/**
 * Scan xs-app.json for security issues in route definitions and global settings.
 */
function scanXsAppJson(file) {
  const issues = [];
  let config;

  try {
    config = JSON.parse(file.content);
  } catch (e) {
    issues.push({
      severity: 'LOW',
      code: 'AR_PARSE_ERROR',
      message: 'Cannot parse xs-app.json — invalid JSON',
      file: file.name,
    });
    return issues;
  }

  // ── Global authenticationMethod ───────────────────────────────────────────
  const globalAuth = config.authenticationMethod || '';
  if (globalAuth === 'none') {
    issues.push({
      severity: 'HIGH',
      code: 'AR_AUTH_NONE_GLOBAL',
      message: 'xs-app.json: authenticationMethod is "none" — all routes are publicly accessible; set to "route" and secure individual routes',
      file: file.name,
      snippet: 'authenticationMethod: "none"',
    });
  }

  // ── CSRF Protection ────────────────────────────────────────────────────────
  // AppRouter enables CSRF by default; explicit false is a regression
  if (config.csrfProtection === false) {
    issues.push({
      severity: 'HIGH',
      code: 'AR_CSRF_DISABLED',
      message: 'xs-app.json: csrfProtection is explicitly false — re-enable to protect state-changing requests',
      file: file.name,
      snippet: 'csrfProtection: false',
    });
  }

  // ── Session timeout ────────────────────────────────────────────────────────
  if (config.sessionTimeout) {
    const timeoutMin = parseInt(config.sessionTimeout, 10);
    if (timeoutMin > 60) {
      issues.push({
        severity: 'MEDIUM',
        code: 'AR_SESSION_LONG',
        message: `xs-app.json: sessionTimeout is ${timeoutMin} minutes — sessions longer than 60 minutes increase session hijacking risk`,
        file: file.name,
        snippet: `sessionTimeout: ${timeoutMin}`,
      });
    }
  } else {
    issues.push({
      severity: 'INFO',
      code: 'AR_NO_SESSION_TIMEOUT',
      message: 'xs-app.json: no sessionTimeout configured — default is 15 minutes; verify this matches your security policy',
      file: file.name,
    });
  }

  // ── Logout endpoint ────────────────────────────────────────────────────────
  if (!config.logout || !config.logout.logoutEndpoint) {
    issues.push({
      severity: 'LOW',
      code: 'AR_NO_LOGOUT_ENDPOINT',
      message: 'xs-app.json: no logout.logoutEndpoint defined — users cannot explicitly invalidate their session',
      file: file.name,
    });
  }

  // ── HTTP Headers (CSP, XFO, etc.) ────────────────────────────────────────
  const httpHeaders = config.httpHeaders || [];
  const headerMap = {};
  for (const h of httpHeaders) {
    // Headers can be objects { <name>: <value> } or strings
    if (typeof h === 'object') {
      Object.assign(headerMap, h);
    }
  }
  const headerNames = Object.keys(headerMap).map(k => k.toLowerCase());

  for (const req of REQUIRED_SECURITY_HEADERS) {
    if (!headerNames.includes(req.header.toLowerCase())) {
      issues.push({
        severity: req.severity,
        code: req.code,
        message: req.message,
        file: file.name,
      });
    }
  }

  // ── Analyze CSP value for unsafe directives ───────────────────────────────
  const cspValue = headerMap['Content-Security-Policy'] || headerMap['content-security-policy'] || '';
  if (cspValue) {
    for (const check of UNSAFE_CSP_VALUES) {
      if (cspValue.includes(check.value)) {
        issues.push({
          severity: check.severity,
          code: check.code,
          message: check.message,
          file: file.name,
          snippet: `Content-Security-Policy: ...${check.value}...`,
        });
      }
    }
    // Check missing frame-ancestors (separate from X-Frame-Options, stronger)
    if (!cspValue.includes('frame-ancestors')) {
      issues.push({
        severity: 'LOW',
        code: 'AR_CSP_NO_FRAME_ANCESTORS',
        message: "CSP is present but missing 'frame-ancestors' directive — add frame-ancestors 'none' or 'self' for clickjacking protection (supersedes X-Frame-Options in modern browsers)",
        file: file.name,
      });
    }
  }

  // ── X-Frame-Options value check ───────────────────────────────────────────
  const xfo = headerMap['X-Frame-Options'] || headerMap['x-frame-options'] || '';
  if (xfo && !['DENY', 'SAMEORIGIN'].includes(xfo.toUpperCase())) {
    issues.push({
      severity: 'MEDIUM',
      code: 'AR_XFO_UNSAFE',
      message: `X-Frame-Options value "${xfo}" is not recommended — use DENY or SAMEORIGIN`,
      file: file.name,
      snippet: `X-Frame-Options: ${xfo}`,
    });
  }

  // ── Routes analysis ────────────────────────────────────────────────────────
  const routes = config.routes || [];
  if (routes.length === 0) {
    issues.push({
      severity: 'INFO',
      code: 'AR_NO_ROUTES',
      message: 'xs-app.json: no routes defined',
      file: file.name,
    });
  }

  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];
    const routeLabel = `route[${i}] (source: ${route.source || '?'})`;

    // Authentication type per route
    const authType = route.authenticationType || globalAuth || 'xsuaa';
    if (UNSAFE_AUTH_TYPES.has(authType)) {
      // Check if it's a deliberate public route to static CDN
      const dest = route.destination || route.localDir || '';
      const isPublicCDN = /ui5\.sap\.com|sapui5\.hana\.ondemand\.com|openui5\.hana\.ondemand\.com/i.test(dest);
      const isStaticPublic = route.localDir && !route.authenticationType;

      if (!isPublicCDN) {
        issues.push({
          severity: 'HIGH',
          code: 'AR_ROUTE_NO_AUTH',
          message: `${routeLabel}: authenticationType is "${authType}" — unauthenticated access to this route`,
          file: file.name,
          snippet: `source: ${route.source}`,
        });
      }
    }

    // CSRF protection per route
    if (route.csrfProtection === false) {
      issues.push({
        severity: 'MEDIUM',
        code: 'AR_ROUTE_CSRF_OFF',
        message: `${routeLabel}: csrfProtection disabled — state-changing requests on this route are not CSRF-protected`,
        file: file.name,
        snippet: `source: ${route.source}`,
      });
    }

    // HTTP destination URL
    if (route.destination && route.destination.startsWith && route.destination.startsWith('http://')) {
      issues.push({
        severity: 'HIGH',
        code: 'AR_ROUTE_HTTP_DEST',
        message: `${routeLabel}: destination uses plain HTTP — use HTTPS`,
        file: file.name,
        snippet: `destination: ${route.destination}`,
      });
    }

    // Wildcard source without scope check
    if (route.source === '^(.*)$' || route.source === '.*' || route.source === '(.*)') {
      if (authType === 'none' || authType === 'NoAuthentication') {
        issues.push({
          severity: 'CRITICAL',
          code: 'AR_WILDCARD_ROUTE_NO_AUTH',
          message: `${routeLabel}: catch-all route with no authentication — all unmatched paths are public`,
          file: file.name,
          snippet: `source: ${route.source}`,
        });
      }
    }

    // ForwardAuthToken without XSUAA auth
    if (route.forwardAuthToken === true && authType === 'none') {
      issues.push({
        severity: 'HIGH',
        code: 'AR_FORWARD_TOKEN_NO_AUTH',
        message: `${routeLabel}: forwardAuthToken:true but authenticationType is "none" — no token will be forwarded (route is unauthenticated)`,
        file: file.name,
        snippet: `source: ${route.source}`,
      });
    }

    // scope check — routes to sensitive APIs should require specific scopes
    if ((authType === 'xsuaa' || authType === 'ias') && !route.scope && !route.requiredScopes) {
      // Only warn for API/backend routes, not static resources
      if (route.destination && !route.localDir && !route.service) {
        issues.push({
          severity: 'LOW',
          code: 'AR_ROUTE_NO_SCOPE',
          message: `${routeLabel}: no scope restriction on authenticated route — consider adding a "scope" property for fine-grained access control`,
          file: file.name,
          snippet: `source: ${route.source}`,
        });
      }
    }

    // Service routes — html5-apps-repo-rt should use xsuaa
    if (route.service === 'html5-apps-repo-rt' && authType === 'none') {
      issues.push({
        severity: 'MEDIUM',
        code: 'AR_HTML5_REPO_NO_AUTH',
        message: `${routeLabel}: html5-apps-repo-rt service route has no authentication — static apps served without XSUAA protection`,
        file: file.name,
        snippet: `source: ${route.source}`,
      });
    }
  }

  return issues;
}

/**
 * Scan @sap/approuter version in package.json files.
 */
function scanApprouterVersion(files) {
  const issues = [];
  const pkgFiles = files.filter(f =>
    path.basename(f.name) === 'package.json' && !f.name.includes('node_modules')
  );

  for (const file of pkgFiles) {
    try {
      const pkg = JSON.parse(file.content);
      const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
      const arVersion = allDeps['@sap/approuter'];
      if (arVersion) {
        const cleanVersion = arVersion.replace(/^[^0-9]*/, '');
        if (isVersionBelow(cleanVersion, MIN_APPROUTER_VERSION)) {
          issues.push({
            severity: 'HIGH',
            code: 'AR_OUTDATED_VERSION',
            message: `@sap/approuter version "${arVersion}" is below the recommended minimum ${MIN_APPROUTER_VERSION} — update to get security fixes (log injection CVE-2022-41271 patched in >=12.0.0)`,
            file: file.name,
            snippet: `"@sap/approuter": "${arVersion}"`,
            fix: `>=${MIN_APPROUTER_VERSION}`,
          });
        }
      }
    } catch (e) {
      // silent
    }
  }
  return issues;
}

/**
 * Scan mta.yaml for AppRouter module configuration issues.
 */
function scanMtaApprouter(files) {
  const issues = [];
  const mtaFiles = files.filter(f => path.basename(f.name) === 'mta.yaml');

  for (const file of mtaFiles) {
    const content = file.content;
    const lines = content.split('\n');

    // Detect approuter modules
    lines.forEach((line, idx) => {
      if (/type:\s*approuter\.nodejs/.test(line)) {
        const moduleBlock = lines.slice(Math.max(0, idx - 15), idx + 40).join('\n');

        // Check for missing XSUAA binding
        if (!moduleBlock.includes('xsuaa') && !moduleBlock.includes('ias')) {
          issues.push({
            severity: 'HIGH',
            code: 'AR_MTA_NO_XSUAA',
            message: 'AppRouter module in mta.yaml has no XSUAA or IAS binding — authentication cannot work without a bound UAA service',
            file: file.name,
            line: idx + 1,
            snippet: line.trim(),
          });
        }

        // Check for missing connectivity binding when OnPremise is used elsewhere
        if (content.includes('OnPremise') && !moduleBlock.includes('connectivity')) {
          issues.push({
            severity: 'MEDIUM',
            code: 'AR_MTA_NO_CONNECTIVITY',
            message: 'mta.yaml has OnPremise destinations but AppRouter module does not bind the connectivity service',
            file: file.name,
            line: idx + 1,
            snippet: line.trim(),
          });
        }

        // Check for SESSION_TIMEOUT env variable
        if (!moduleBlock.includes('SESSION_TIMEOUT') && !moduleBlock.includes('sessionTimeout')) {
          issues.push({
            severity: 'INFO',
            code: 'AR_MTA_NO_SESSION_TIMEOUT',
            message: 'AppRouter module does not configure SESSION_TIMEOUT — verify the default 15-minute timeout suits your security policy',
            file: file.name,
            line: idx + 1,
            snippet: line.trim(),
          });
        }
      }
    });

    // Check for SAP_JWT_TRUST_ACL too permissive
    if (content.includes('SAP_JWT_TRUST_ACL')) {
      const jwtAclMatch = content.match(/SAP_JWT_TRUST_ACL\s*:\s*['"]?([^'"\n]+)/);
      if (jwtAclMatch) {
        const aclValue = jwtAclMatch[1].trim();
        if (aclValue.includes('"clientid":"*"') || aclValue.includes("'clientid':'*'")) {
          issues.push({
            severity: 'CRITICAL',
            code: 'AR_JWT_TRUST_WILDCARD',
            message: 'SAP_JWT_TRUST_ACL contains wildcard clientid "*" — this trusts JWT tokens from ANY client, remove or restrict',
            file: file.name,
            snippet: `SAP_JWT_TRUST_ACL: ${aclValue.substring(0, 80)}`,
          });
        }
      }
    }

    // Check for SEND_XFRAMEOPTIONS explicitly disabled
    if (/SEND_XFRAMEOPTIONS\s*:\s*(?:false|'false'|"false")/i.test(content)) {
      issues.push({
        severity: 'HIGH',
        code: 'AR_XFO_DISABLED',
        message: 'SEND_XFRAMEOPTIONS is set to false in AppRouter environment — X-Frame-Options header will not be sent, enabling clickjacking',
        file: file.name,
        snippet: 'SEND_XFRAMEOPTIONS: false',
      });
    }
  }

  return issues;
}

/**
 * Check for xs-app.json committed to the repository root without an AppRouter package.json.
 * This can indicate a misconfigured managed AppRouter scenario.
 */
function checkManagedApprouter(files) {
  const issues = [];
  const xsAppFiles = files.filter(f => path.basename(f.name) === 'xs-app.json');
  const hasApprouterPkg = files.some(f =>
    path.basename(f.name) === 'package.json' &&
    !f.name.includes('node_modules') &&
    (() => { try { return !!JSON.parse(f.content).dependencies?.['@sap/approuter']; } catch (e) { return false; } })()
  );

  for (const file of xsAppFiles) {
    // Warn about xs-app.json at root level without a nearby package.json declaring @sap/approuter
    const dir = path.dirname(file.name);
    const nearbyPkg = files.find(f =>
      path.dirname(f.name) === dir && path.basename(f.name) === 'package.json'
    );
    if (!nearbyPkg && !hasApprouterPkg) {
      issues.push({
        severity: 'INFO',
        code: 'AR_XSAPP_NO_PKG',
        message: `xs-app.json found at ${file.name} but no nearby package.json with @sap/approuter — this may be a managed AppRouter config; ensure the file is intentionally at this location`,
        file: file.name,
      });
    }
  }
  return issues;
}

/**
 * Main entry point.
 */
function scanApprouter(files) {
  const results = {
    routeIssues: [],
    versionIssues: [],
    mtaIssues: [],
    configIssues: [],
  };

  // Scan all xs-app.json files found
  const xsAppFiles = files.filter(f => path.basename(f.name) === 'xs-app.json');
  for (const file of xsAppFiles) {
    results.routeIssues.push(...scanXsAppJson(file));
  }

  // AppRouter version check
  results.versionIssues.push(...scanApprouterVersion(files));

  // MTA configuration
  results.mtaIssues.push(...scanMtaApprouter(files));

  // Managed approuter scenario check
  results.configIssues.push(...checkManagedApprouter(files));

  return results;
}

module.exports = { scanApprouter };