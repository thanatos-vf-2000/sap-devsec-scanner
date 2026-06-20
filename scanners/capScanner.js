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

function parseCDSServices(content, filename) {
  const services = [];
  const lines = content.split('\n');

  const serviceRegex = /\bservice\s+(\w+)/g;
  let match;
  while ((match = serviceRegex.exec(content)) !== null) {
    const lineNum = content.substring(0, match.index).split('\n').length;
    const currentLine = lines[lineNum - 1] || '';
    const prevLine = lines[lineNum - 2] || '';

    // Exclure : "annotate service.X" sur la même ligne ou "using X as service from"
    if (
      /annotate\s+/.test(currentLine) ||
      /\bservice\s*\./.test(currentLine) ||        // service.Entity
      /\bas\s+service\b/.test(currentLine) ||      // using X as service from
      /annotate\s+$/.test(prevLine.trimEnd())      // annotate seul sur la ligne précédente
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

function scanCAPCode(files) {
  const results = {
    services: [],
    vulnerabilities: [],
    mtaIssues: [],
    xsuaaIssues: [],
  };

  // Scan .cds files
  const cdsFiles = files.filter(f => f.name.endsWith('.cds'));
  for (const file of cdsFiles) {
    const services = parseCDSServices(file.content, file.name);
    results.services.push(...services);

    // Check for other CDS issues
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
  }

  // Scan .js/.ts handler files
  const jsFiles = files.filter(f =>
    (f.name.endsWith('.js') || f.name.endsWith('.ts')) &&
    !f.name.includes('node_modules') &&
    !f.name.includes('.min.')
  );

  for (const file of jsFiles) {
    const lines = file.content.split('\n');
    for (const rule of CAP_JS_PATTERNS) {
      if (rule.code === 'CAP_AUTH_CHECK_OK') continue; // skip positive patterns for vuln list
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

    // Check for HTTP (non-HTTPS) endpoints
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

  return results;
}

module.exports = { scanCAPCode };
