'use strict';

const path = require('path');

// CAP/CDS security checks
const CDS_AUTH_PATTERNS = [
  {
    pattern: /(?:@requires|[\(@,\s]requires)\s*:\s*['"`]([^'"`]+)['"`]/g,
    type: 'auth_found',
    message: 'Authorization restriction found',
  },
  {
    pattern: /@\(?restrict\s*(?:to\s*[^;{]+|\s*:\s*\[)/g,
    type: 'restrict_found',
    message: 'Restrict annotation found',
  },
];

const CDS_VULN_PATTERNS = [
  {
    pattern: /service\s+(\w+)\s*(?:@\([^)]*\))?\s*\{/g,
    type: 'service_def',
  },
];

const CAP_JS_PATTERNS = [
  {
    pattern: /srv\.on\s*\(\s*['"`][^'"`]+['"`]\s*,\s*(?:req\s*=>|async\s*\(req\)|async\s*req\s*=>)/g,
    severity: 'MEDIUM',
    code: 'CAP_HANDLER_NOAUTH',
    message: 'Event handler without visible authorization check',
  },
  {
    pattern: /SELECT\.from\s*\([^)]*\)\s*(?!\.where)/g,
    severity: 'LOW',
    code: 'CAP_SELECT_NOFILTER',
    message: 'SELECT without WHERE clause - potential data exposure',
  },
  {
    pattern: /req\.data\b(?!\s*\.\s*(?:ID|id))/g,
    severity: 'LOW',
    code: 'CAP_UNVALIDATED_INPUT',
    message: 'Using req.data without apparent validation',
  },
  {
    pattern: /cds\.run\s*\(`[^`]*\$\{/g,
    severity: 'CRITICAL',
    code: 'CAP_SQL_INJECTION',
    message: 'Potential SQL injection via template literal in cds.run()',
  },
  {
    pattern: /process\.env\.\w+/g,
    severity: 'INFO',
    code: 'CAP_ENV_ACCESS',
    message: 'Accessing environment variable - ensure no secrets in code',
  },
  {
    pattern: /req\.user\.is\s*\(/g,
    severity: 'INFO',
    code: 'CAP_AUTH_CHECK_OK',
    message: 'Good practice: req.user.is() authorization check',
  },
  {
    pattern: /console\.(log|debug)\s*\([^)]*req\./g,
    severity: 'MEDIUM',
    code: 'CAP_LOG_REQUEST',
    message: 'Logging request object - may expose sensitive data',
  },
  // NEW: Detect direct DB access bypassing CDS authorization layer
  {
    pattern: /require\s*\(\s*['"`]hdb['"`]\s*\)|require\s*\(\s*['"`]@sap\/hana-client['"`]\s*\)/g,
    severity: 'HIGH',
    code: 'CAP_DIRECT_HANA',
    message: 'Direct HANA client used - bypasses CDS authorization layer, ensure manual auth checks',
  },
  // NEW: Detect disabled authentication in cds config
  {
    pattern: /['"`]security['"`]\s*:\s*false/g,
    severity: 'CRITICAL',
    code: 'CAP_SECURITY_DISABLED',
    message: 'CDS security is explicitly disabled',
  },
  // NEW: Detect raw express routes bypassing CDS middleware
  {
    pattern: /app\.(?:get|post|put|delete|patch)\s*\(\s*['"`][^'"`]+['"`]\s*,\s*(?!.*passport|.*xsuaa|.*auth)/g,
    severity: 'MEDIUM',
    code: 'CAP_EXPRESS_UNPROTECTED',
    message: 'Raw Express route registered - ensure it is protected by XSUAA/passport middleware',
  },
  // NEW: Insecure deserialization via JSON.parse on request input
  {
    pattern: /JSON\.parse\s*\(\s*req\.(body|data|query|params)/g,
    severity: 'MEDIUM',
    code: 'CAP_JSON_PARSE_INPUT',
    message: 'JSON.parse on raw request input - validate schema before deserialization',
  },
  // NEW: Potential path traversal via user-supplied file paths
  {
    pattern: /(?:readFile|readFileSync|createReadStream)\s*\([^)]*req\./g,
    severity: 'HIGH',
    code: 'CAP_PATH_TRAVERSAL',
    message: 'File read using request-supplied input - potential path traversal',
  },
];

const MTA_PATTERNS = [
  {
    pattern: /authentication-type:\s*(?:none|NoAuthentication)/gi,
    severity: 'HIGH',
    code: 'MTA_NO_AUTH',
    message: 'No authentication configured for module',
  },
  {
    pattern: /security-patch:\s*false/gi,
    severity: 'MEDIUM',
    code: 'MTA_SEC_PATCH_OFF',
    message: 'Security patching disabled',
  },
];

const XSUAA_PATTERNS = [
  {
    pattern: /"allowedproviders"\s*:\s*\[\s*\]/g,
    severity: 'MEDIUM',
    code: 'XSUAA_NO_PROVIDERS',
    message: 'Empty allowedproviders - no IdP restriction',
  },
  {
    pattern: /"xsappname"\s*:\s*"[^"]*\*[^"]*"/g,
    severity: 'MEDIUM',
    code: 'XSUAA_WILDCARD',
    message: 'Wildcard in xsappname - overly permissive',
  },
  {
    pattern: /"grant-as-authority-to-apps"\s*:\s*\[[^\]]*"\$ACCEPT_GRANTED_AUTHORITIES"[^\]]*\]/g,
    severity: 'HIGH',
    code: 'XSUAA_ACCEPT_GRANTED',
    message: 'ACCEPT_GRANTED_AUTHORITIES - service accepts all authorities',
  },
];

// NEW: .cdsrc.json / package.json cds config security checks
const CDS_CONFIG_CHECKS = [
  {
    key: 'requires.auth.kind',
    dangerValues: ['dummy', 'mock'],
    severity: 'HIGH',
    code: 'CAP_AUTH_MOCK',
    message: 'CDS auth kind is set to dummy/mock - never use in production',
  },
];

function parseCDSServices(content, filename) {
  const services = [];
  const lines = content.split('\n');

  const serviceRegex = /\bservice\s+(\w+)/g;
  let match;
  while ((match = serviceRegex.exec(content)) !== null) {
    const lineNum = content.substring(0, match.index).split('\n').length;
    const currentLine = lines[lineNum - 1] || '';
    const prevLine = lines[lineNum - 2] || '';

    if (
      /annotate\s+/.test(currentLine) ||
      /\bservice\s*\./.test(currentLine) ||
      /\bas\s+service\b/.test(currentLine) ||
      /annotate\s+$/.test(prevLine.trimEnd())
    ) {
      continue;
    }

    const contextBefore = content.substring(Math.max(0, match.index - 200), match.index);
    const contextAfter = content.substring(match.index, Math.min(content.length, match.index + 500));
    const context = contextBefore + contextAfter;

    const hasRequires = /@requires|[\(@,\s]requires\s*:/i.test(context);
    const hasRestrict = /@restrict|[\(@,\s]restrict\s*:/i.test(context);
    const requiresMatch =
      context.match(/@requires\s*:\s*['"`]([^'"`]+)['"`]/) ||
      context.match(/[\(@,\s]requires\s*:\s*['"`]([^'"`]+)['"`]/);

    services.push({
      name: match[1],
      file: filename,
      line: lineNum,
      hasAuth: hasRequires || hasRestrict,
      authType: requiresMatch ? requiresMatch[1] : null,
      severity: hasRequires || hasRestrict ? 'OK' : 'HIGH',
      message: hasRequires || hasRestrict
        ? `Authorization found: @requires '${requiresMatch?.[1] || 'see code'}'`
        : 'No @requires or @restrict annotation - service may be publicly accessible',
    });
  }

  return services;
}

// NEW: Check .cdsrc.json / package.json[cds] for insecure auth config
function checkCDSConfig(files) {
  const issues = [];

  const cdsrcFiles = files.filter(f =>
    path.basename(f.name) === '.cdsrc.json' ||
    (path.basename(f.name) === 'package.json' && f.content.includes('"cds"'))
  );

  for (const file of cdsrcFiles) {
    try {
      const cfg = JSON.parse(file.content);
      const cds = path.basename(file.name) === 'package.json' ? (cfg.cds || {}) : cfg;

      const authKind = cds?.requires?.auth?.kind || cds?.requires?.['auth']?.kind;
      if (authKind && ['dummy', 'mock', 'basic'].includes(authKind.toLowerCase())) {
        issues.push({
          severity: 'HIGH',
          code: 'CAP_AUTH_MOCK',
          message: `CDS auth kind is "${authKind}" - remove before production, must use "xsuaa" or "ias"`,
          file: file.name,
          snippet: `requires.auth.kind: ${authKind}`,
        });
      }

      // Check for csrf disabled in CAP server config
      if (cds?.server?.['csrf-protection'] === false) {
        issues.push({
          severity: 'HIGH',
          code: 'CAP_CSRF_DISABLED',
          message: 'CSRF protection explicitly disabled in CDS server config',
          file: file.name,
          snippet: 'server.csrf-protection: false',
        });
      }

      // Check for insecure profile (development/hybrid used in non-dev)
      const profiles = cds?.profiles || [];
      if (profiles.includes('development') || profiles.includes('hybrid')) {
        issues.push({
          severity: 'MEDIUM',
          code: 'CAP_INSECURE_PROFILE',
          message: `CDS profile includes "development" or "hybrid" - verify this is intentional and not deployed to production`,
          file: file.name,
          snippet: `profiles: ${JSON.stringify(profiles)}`,
        });
      }
    } catch (e) {
      // not parseable
    }
  }

  return issues;
}

function scanCAPCode(files) {
  const results = {
    services: [],
    vulnerabilities: [],
    mtaIssues: [],
    xsuaaIssues: [],
    configIssues: [],  // NEW
  };

  // Scan .cds files
  const cdsFiles = files.filter(f => f.name.endsWith('.cds'));
  for (const file of cdsFiles) {
    const services = parseCDSServices(file.content, file.name);
    results.services.push(...services);

    if (file.content.includes('@open') || file.content.includes('annotate')) {
      const lines = file.content.split('\n');
      lines.forEach((line, idx) => {
        if (line.includes('@open')) {
          results.vulnerabilities.push({
            severity: 'HIGH',
            code: 'CDS_OPEN_SERVICE',
            message: 'Service annotated with @open - unrestricted access',
            file: file.name,
            line: idx + 1,
            snippet: line.trim(),
          });
        }
      });
    }

    // NEW: Detect @PersonalData without @EndUserText.label (GDPR annotation check)
    if (file.content.includes('@PersonalData') && !file.content.includes('@EndUserText.label')) {
      results.vulnerabilities.push({
        severity: 'INFO',
        code: 'CDS_PERSONAL_DATA_NO_LABEL',
        message: '@PersonalData annotation present but @EndUserText.label is missing - required for GDPR audit log readability',
        file: file.name,
        snippet: '@PersonalData',
      });
    }

    // NEW: Detect @cds.autoexpose without auth (auto-exposed entities are accessible via API)
    const lines = file.content.split('\n');
    lines.forEach((line, idx) => {
      if (/@cds\.autoexpose/.test(line)) {
        const nearContext = file.content.substring(
          Math.max(0, file.content.indexOf(line) - 100),
          file.content.indexOf(line) + 200
        );
        if (!/@requires|@restrict/.test(nearContext)) {
          results.vulnerabilities.push({
            severity: 'MEDIUM',
            code: 'CDS_AUTOEXPOSE_NO_AUTH',
            message: '@cds.autoexpose entity without @requires or @restrict - auto-exposed entities inherit service auth, verify this is intended',
            file: file.name,
            line: idx + 1,
            snippet: line.trim(),
          });
        }
      }
    });
  }

  // Scan .js/.ts handler files
  const jsFiles = files.filter(f =>
    (f.name.endsWith('.js') || f.name.endsWith('.ts') || f.name.endsWith('.jsx') || f.name.endsWith('.tsx')) &&
    !f.name.includes('node_modules') &&
    !f.name.includes('.min.')
  );

  for (const file of jsFiles) {
    const lines = file.content.split('\n');
    for (const rule of CAP_JS_PATTERNS) {
      if (rule.code === 'CAP_AUTH_CHECK_OK') continue;
      const matches = [...file.content.matchAll(rule.pattern)];
      for (const match of matches) {
        const lineNum = file.content.substring(0, match.index).split('\n').length;
        results.vulnerabilities.push({
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

  // Scan mta.yaml
  const mtaFiles = files.filter(f => path.basename(f.name) === 'mta.yaml');
  for (const file of mtaFiles) {
    for (const rule of MTA_PATTERNS) {
      const matches = [...file.content.matchAll(rule.pattern)];
      for (const match of matches) {
        const lineNum = file.content.substring(0, match.index).split('\n').length;
        results.mtaIssues.push({
          severity: rule.severity,
          code: rule.code,
          message: rule.message,
          file: file.name,
          line: lineNum,
          snippet: match[0].trim(),
        });
      }
    }

    const httpMatches = [...file.content.matchAll(/url:\s*http:\/\//g)];
    for (const match of httpMatches) {
      const lineNum = file.content.substring(0, match.index).split('\n').length;
      results.mtaIssues.push({
        severity: 'HIGH',
        code: 'MTA_HTTP_ENDPOINT',
        message: 'Non-HTTPS endpoint configured',
        file: file.name,
        line: lineNum,
        snippet: match[0].trim(),
      });
    }
  }

  // Scan xs-security.json
  const xsuaaFiles = files.filter(f => path.basename(f.name) === 'xs-security.json');
  for (const file of xsuaaFiles) {
    for (const rule of XSUAA_PATTERNS) {
      const matches = [...file.content.matchAll(rule.pattern)];
      for (const match of matches) {
        const lineNum = file.content.substring(0, match.index).split('\n').length;
        results.xsuaaIssues.push({
          severity: rule.severity,
          code: rule.code,
          message: rule.message,
          file: file.name,
          line: lineNum,
          snippet: match[0].trim().substring(0, 80),
        });
      }
    }
  }

  // NEW: Scan .cdsrc.json and package.json[cds]
  results.configIssues.push(...checkCDSConfig(files));

  return results;
}

module.exports = { scanCAPCode };