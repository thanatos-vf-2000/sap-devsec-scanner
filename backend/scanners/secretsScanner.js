'use strict';

const SECRET_PATTERNS = [
  {
    pattern: /(?:password|passwd|pwd)\s*[=:]\s*['"`]([^'"`\s]{4,})['"`]/gi,
    severity: 'CRITICAL',
    code: 'SECRET_PASSWORD',
    message: 'Hardcoded password detected',
  },
  {
    pattern: /(?:client[-_]?secret|clientsecret)\s*[=:]\s*['"`]([^'"`\s]{8,})['"`]/gi,
    severity: 'CRITICAL',
    code: 'SECRET_CLIENT_SECRET',
    message: 'Hardcoded client secret detected',
  },
  {
    pattern: /(?:api[-_]?key|apikey)\s*[=:]\s*['"`]([^'"`\s]{8,})['"`]/gi,
    severity: 'CRITICAL',
    code: 'SECRET_API_KEY',
    message: 'Hardcoded API key detected',
  },
  {
    pattern: /(?:token|access[-_]?token|bearer)\s*[=:]\s*['"`]([^'"`\s]{10,})['"`]/gi,
    severity: 'CRITICAL',
    code: 'SECRET_TOKEN',
    message: 'Hardcoded token detected',
  },
  {
    pattern: /(?:secret[_-]?key|secretkey)\s*[=:]\s*['"]?([^'"\s\n]{8,})['"]?/gi,
    severity: 'CRITICAL',
    code: 'SECRET_KEY',
    message: 'Hardcoded client secret Key detected',
  },
  {
    pattern: /(?:private[_-]?key|privatekey)\s*[=:]\s*['"]?([^'"\s\n]{8,})['"]?/gi,
    severity: 'CRITICAL',
    code: 'SECRET_PRIVATE_KEY',
    message: 'Private key embedded in file',
  },
  {
    pattern: /BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY/g,
    severity: 'CRITICAL',
    code: 'SECRET_PRIVATE_KEY',
    message: 'Private key embedded in file',
  },
  {
    pattern: /(?:VCAP_SERVICES|vcap_services)\s*=\s*\{[^}]{20,}/g,
    severity: 'HIGH',
    code: 'SECRET_VCAP',
    message: 'VCAP_SERVICES with credentials in code',
  },
  {
    pattern: /['"`]clientid['"`]\s*:\s*['"`][^'"`]+['"`]/g,
    severity: 'HIGH',
    code: 'SECRET_CLIENT_ID',
    message: 'Hardcoded clientid (OAuth)',
  },
  {
    pattern: /(?:db[-_]?password|database[-_]?password)\s*[=:]\s*['"`]([^'"`\s]+)['"`]/gi,
    severity: 'CRITICAL',
    code: 'SECRET_DB_PASSWORD',
    message: 'Hardcoded database password',
  },
  {
    pattern: /(?:smtp[-_]?password|mail[-_]?password)\s*[=:]\s*['"`]([^'"`\s]+)['"`]/gi,
    severity: 'HIGH',
    code: 'SECRET_SMTP',
    message: 'Hardcoded SMTP/mail password',
  },
  {
    pattern: /(?:AWS_ACCESS_KEY_ID|aws_access_key)\s*[=:]\s*['"`]([A-Z0-9]{20})['"`]/g,
    severity: 'CRITICAL',
    code: 'SECRET_AWS_KEY',
    message: 'AWS access key detected',
  },
  {
    pattern: /xsuaa.*clientsecret\s*[=:]\s*['"]?([^'"\s\n]{8,})['"]?/gi, 
    severity: 'CRITICAL',
    code: 'SECRET_XSUAA',
    message: 'Secret XSUAA detected',
  },
  {
    pattern: /hdi[_-]?user\s*[=:]\s*['"]?([^'"\s\n]{4,})['"]?/gi, 
    severity: 'CRITICAL',
    code: 'SECRET_HDI_USER',
    message: 'User HDI detected',
  },
  {
    pattern: /hdi[_-]?password\s*[=:]\s*['"]?([^'"\s\n]{4,})['"]?/gi, 
    severity: 'CRITICAL',
    code: 'SECRET_HDI_PASSWORD',
    message: 'Password HDI detected',
  },
];

const SENSITIVE_FILES_CHECK = [
  {
    filename: '.env',
    check: (content) => {
      const issues = [];
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (line.startsWith('#') || !line.includes('=')) return;
        const [key, ...val] = line.split('=');
        const value = val.join('=').trim();
        if (value && value.length > 3 && !value.startsWith('${')) {
          const k = key.trim().toUpperCase();
          if (/PASSWORD|SECRET|KEY|TOKEN|CREDENTIAL|CERT/.test(k)) {
            issues.push({
              severity: 'HIGH',
              code: 'ENV_SECRET',
              message: `Sensitive key in .env: ${key.trim()}`,
              line: idx + 1,
              snippet: `${key.trim()}=***`,
            });
          }
        }
      });
      return issues;
    },
  },
  {
    filename: 'default-env.json',
    check: (content) => {
      const issues = [];
      try {
        const data = JSON.parse(content);
        const str = JSON.stringify(data);
        if (str.includes('clientsecret') || str.includes('password')) {
          issues.push({
            severity: 'CRITICAL',
            code: 'DEFAULT_ENV_SECRETS',
            message: 'default-env.json contains credentials - never commit this file',
            line: 1,
            snippet: 'Contains clientsecret or password fields',
          });
        }
        if (str.length > 100) {
          issues.push({
            severity: 'HIGH',
            code: 'DEFAULT_ENV_COMMITTED',
            message: 'default-env.json with data committed to project - add to .gitignore',
            line: 1,
            snippet: 'File should be in .gitignore',
          });
        }
      } catch (e) {}
      return issues;
    },
  },
];

function checkGitignore(files) {
  const issues = [];
  const gitignore = files.find(f => f.name.endsWith('.gitignore'));
  const sensitivePatterns = ['default-env.json', '.env', '*.env', 'default-env*.json'];

  if (!gitignore) {
    issues.push({
      severity: 'MEDIUM',
      code: 'NO_GITIGNORE',
      message: 'No .gitignore found - sensitive files may be committed',
      file: '.gitignore',
      line: 0,
    });
    return issues;
  }

  for (const pattern of sensitivePatterns) {
    if (!gitignore.content.includes(pattern)) {
      issues.push({
        severity: 'MEDIUM',
        code: 'GITIGNORE_MISSING',
        message: `${pattern} not in .gitignore`,
        file: '.gitignore',
        line: 0,
        snippet: `Add: ${pattern}`,
      });
    }
  }
  return issues;
}

function scanSecrets(files) {
  const findings = [];

  const excludedExts = ['.png', '.jpg', '.gif', '.svg', '.ico', '.woff', '.ttf', '.eot', '.min.js', '.map'];
  const excludedPaths = ['node_modules', '.git', 'dist', 'build', 'vendor'];

  const scanFiles = files.filter(f => {
    if (excludedPaths.some(p => f.name.includes(p))) return false;
    if (excludedExts.some(e => f.name.endsWith(e))) return false;
    return true;
  });

  for (const file of scanFiles) {
    const basename = require('path').basename(file.name);

    // Check special files
    for (const specialFile of SENSITIVE_FILES_CHECK) {
      if (basename === specialFile.filename) {
        const issues = specialFile.check(file.content);
        for (const issue of issues) {
          findings.push({ ...issue, file: file.name });
        }
      }
    }

    // General pattern matching
    const lines = file.content.split('\n');
    for (const rule of SECRET_PATTERNS) {
      const matches = [...file.content.matchAll(rule.pattern)];
      for (const match of matches) {
        const lineNum = file.content.substring(0, match.index).split('\n').length;
        const line = lines[lineNum - 1] || '';

        // Skip if in comment
        if (line.trim().startsWith('//') || line.trim().startsWith('#') || line.trim().startsWith('*')) continue;
        // Skip placeholder values
        if (/\<[^>]+\>|your[-_]|example|placeholder|change[-_]me|todo/i.test(match[0])) continue;

        findings.push({
          severity: rule.severity,
          code: rule.code,
          message: rule.message,
          file: file.name,
          line: lineNum,
          snippet: line.trim().replace(/(['"`][^'"`]{3})[^'"`]+(['"`])/g, '$1***$2').substring(0, 100),
        });
      }
    }
  }

  // Check .gitignore
  findings.push(...checkGitignore(files));

  return findings;
}

module.exports = { scanSecrets };
