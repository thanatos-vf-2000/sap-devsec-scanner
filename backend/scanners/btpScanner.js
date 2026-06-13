'use strict';

function scanBTPDestinations(files) {
  const issues = [];

  // Scan destination files (JSON)
  const destFiles = files.filter(f =>
    f.name.endsWith('.json') &&
    (f.name.toLowerCase().includes('destination') || f.name.toLowerCase().includes('dest'))
  );

  for (const file of destFiles) {
    try {
      let destinations = JSON.parse(file.content);
      if (!Array.isArray(destinations)) destinations = [destinations];

      for (const dest of destinations) {
        const name = dest.Name || dest.name || 'Unknown';

        if (dest.Authentication === 'NoAuthentication' || dest['authentication-type'] === 'NoAuthentication') {
          issues.push({ severity: 'HIGH', code: 'BTP_NO_AUTH', message: `Destination "${name}" uses NoAuthentication`, file: file.name, snippet: `Authentication: NoAuthentication` });
        }
        if (dest.TrustAll === 'true' || dest['trust-all'] === true) {
          issues.push({ severity: 'HIGH', code: 'BTP_TRUST_ALL', message: `Destination "${name}" has TrustAll=true (no TLS verification)`, file: file.name, snippet: `TrustAll: true` });
        }
        if ((dest.URL || dest.url || '').startsWith('http://')) {
          issues.push({ severity: 'HIGH', code: 'BTP_HTTP_URL', message: `Destination "${name}" uses plain HTTP`, file: file.name, snippet: dest.URL || dest.url });
        }
        if (dest.Password || dest.password) {
          issues.push({ severity: 'CRITICAL', code: 'BTP_DEST_PASSWORD', message: `Destination "${name}" has hardcoded password`, file: file.name, snippet: 'Password: ***' });
        }
      }
    } catch (e) {
      // not parseable JSON
    }
  }

  // Scan mta.yaml for destination resource configs
  const mtaFiles = files.filter(f => require('path').basename(f.name) === 'mta.yaml');
  for (const file of mtaFiles) {
    if (file.content.includes('NoAuthentication')) {
      const lines = file.content.split('\n');
      lines.forEach((line, idx) => {
        if (line.includes('NoAuthentication')) {
          issues.push({
            severity: 'HIGH',
            code: 'BTP_MTA_NO_AUTH',
            message: 'NoAuthentication found in MTA configuration',
            file: file.name,
            line: idx + 1,
            snippet: line.trim(),
          });
        }
      });
    }
  }

  // Check for XSUAA configuration issues
  const xsuaaFiles = files.filter(f => require('path').basename(f.name) === 'xs-security.json');
  for (const file of xsuaaFiles) {
    try {
      const config = JSON.parse(file.content);

      if (!config['xsappname']) {
        issues.push({ severity: 'MEDIUM', code: 'XSUAA_NO_APPNAME', message: 'xs-security.json missing xsappname', file: file.name });
      }

      if (!config['scopes'] || config['scopes'].length === 0) {
        issues.push({ severity: 'LOW', code: 'XSUAA_NO_SCOPES', message: 'No scopes defined in xs-security.json', file: file.name });
      }

      const roleTemplates = config['role-templates'] || [];
      for (const rt of roleTemplates) {
        if (rt['scope-references']?.includes('$XSAPPNAME.User') && roleTemplates.length === 1) {
          issues.push({ severity: 'LOW', code: 'XSUAA_GENERIC_ROLE', message: 'Only generic User scope in role templates - consider more granular roles', file: file.name });
        }
      }

      if (config['oauth2-configuration']?.['token-validity'] > 43200) {
        issues.push({ severity: 'MEDIUM', code: 'XSUAA_LONG_TOKEN', message: `Token validity too long (${config['oauth2-configuration']['token-validity']}s > 12h)`, file: file.name });
      }
    } catch (e) {
      issues.push({ severity: 'LOW', code: 'XSUAA_PARSE_ERR', message: 'Cannot parse xs-security.json', file: file.name });
    }
  }

  return issues;
}

module.exports = { scanBTPDestinations };
