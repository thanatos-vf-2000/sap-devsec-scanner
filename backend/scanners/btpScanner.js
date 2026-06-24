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

        // NEW: Check for missing TokenServiceURL with OAuth2 authentication types
        const authType = dest.Authentication || dest['authentication-type'] || '';
        const oauthTypes = ['OAuth2ClientCredentials', 'OAuth2UserTokenExchange', 'OAuth2SAMLBearerAssertion', 'OAuth2JWTBearer'];
        if (oauthTypes.includes(authType) && !dest.TokenServiceURL && !dest['token-service-url']) {
          issues.push({ severity: 'MEDIUM', code: 'BTP_DEST_NO_TOKEN_URL', message: `Destination "${name}" uses OAuth2 but has no TokenServiceURL`, file: file.name, snippet: `Authentication: ${authType}` });
        }

        // NEW: Check for OAuth2ClientCredentials with hardcoded client secret
        if ((authType === 'OAuth2ClientCredentials' || authType === 'OAuth2SAMLBearerAssertion') &&
            (dest.clientSecret || dest.ClientSecret || dest['client-secret'])) {
          issues.push({ severity: 'CRITICAL', code: 'BTP_DEST_CLIENT_SECRET', message: `Destination "${name}" has hardcoded OAuth2 client secret`, file: file.name, snippet: 'clientSecret: ***' });
        }

        // NEW: ProxyType check - OnPremise without CloudConnector may be misconfigured
        if ((dest.ProxyType === 'OnPremise' || dest['proxy-type'] === 'OnPremise') &&
            !(dest.CloudConnectorLocationId || dest['cloud-connector-location-id'])) {
          issues.push({ severity: 'LOW', code: 'BTP_DEST_NO_CC_LOCATION', message: `Destination "${name}" uses OnPremise proxy without CloudConnectorLocationId (single Cloud Connector)`, file: file.name, snippet: 'ProxyType: OnPremise' });
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
        if (!line.includes('NoAuthentication')) return;

        const contextLines = lines.slice(Math.max(0, idx - 10), idx + 5).join('\n');

        // Exclude SAP public CDN
        if (/URL:\s*https?:\/\/ui5\.sap\.com/.test(contextLines)) return;

        // ForwardAuthToken — lower severity
        if (/HTML5\.ForwardAuthToken:\s*true/.test(contextLines)) {
          issues.push({
            severity: 'LOW',
            code: 'BTP_MTA_NO_AUTH_FORWARD',
            message: 'NoAuthentication avec ForwardAuthToken:true - token XSUAA transmis au backend',
            file: file.name,
            line: idx + 1,
            snippet: line.trim(),
          });
          return;
        }

        issues.push({
          severity: 'HIGH',
          code: 'BTP_MTA_NO_AUTH',
          message: 'NoAuthentication found in MTA configuration',
          file: file.name,
          line: idx + 1,
          snippet: line.trim(),
        });
      });
    }

    // NEW: Detect missing memory/disk quotas — can lead to DoS via resource exhaustion
    const lines = file.content.split('\n');
    let inModuleBlock = false;
    let moduleHasMemory = false;
    let moduleName = null;
    let moduleStartLine = 0;
    lines.forEach((line, idx) => {
      if (/^\s*-\s+name:/.test(line) && lines[idx + 1] && /type:/.test(lines.slice(idx, idx + 5).join('\n'))) {
        if (inModuleBlock && !moduleHasMemory && moduleName) {
          issues.push({
            severity: 'LOW',
            code: 'BTP_MTA_NO_MEMORY',
            message: `MTA module "${moduleName}" has no memory quota set — consider specifying memory: in parameters`,
            file: file.name,
            line: moduleStartLine + 1,
            snippet: `- name: ${moduleName}`,
          });
        }
        inModuleBlock = true;
        moduleHasMemory = false;
        moduleName = line.match(/-\s+name:\s*(\S+)/)?.[1] || null;
        moduleStartLine = idx;
      }
      if (inModuleBlock && /memory:/.test(line)) moduleHasMemory = true;
    });

    // NEW: Check for missing health-check configuration
    if (!file.content.includes('health-check-type') && file.content.includes('type: nodejs')) {
      issues.push({
        severity: 'INFO',
        code: 'BTP_MTA_NO_HEALTHCHECK',
        message: 'No health-check-type defined for Node.js modules in mta.yaml — consider adding health-check-type: http',
        file: file.name,
        snippet: 'type: nodejs',
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

      // NEW: Check redirect-uris for wildcards (broad redirect URI = open redirect risk)
      const redirectUris = config['oauth2-configuration']?.['redirect-uris'] || [];
      for (const uri of redirectUris) {
        if (uri.includes('localhost') || uri.startsWith('http://')) {
          issues.push({ severity: 'MEDIUM', code: 'XSUAA_REDIRECT_LOCALHOST', message: `Redirect URI contains localhost or HTTP — remove before production: ${uri}`, file: file.name, snippet: uri });
        }
        if (uri.includes('*') && !uri.startsWith('https://')) {
          issues.push({ severity: 'HIGH', code: 'XSUAA_WILDCARD_REDIRECT', message: `Wildcard redirect URI over non-HTTPS is an open redirect risk: ${uri}`, file: file.name, snippet: uri });
        }
      }

      // NEW: Warn if tenant-mode is shared without foreign-scope-references (multi-tenant risk)
      if (config['tenant-mode'] === 'shared') {
        const hasForeignRef = (config['role-templates'] || []).some(rt =>
          (rt['scope-references'] || []).some(s => s.includes('$XSSERVICENAME'))
        );
        if (!hasForeignRef) {
          issues.push({ severity: 'LOW', code: 'XSUAA_SHARED_NO_FOREIGN_SCOPE', message: 'tenant-mode is "shared" — ensure cross-tenant access uses $XSSERVICENAME scope references, not $XSAPPNAME', file: file.name });
        }
      }

      // NEW: Check for ACCEPT_GRANTED_AUTHORITIES (accepts all authorities from bound services)
      const foreignScopeRefs = config['foreign-scope-references'] || [];
      if (foreignScopeRefs.includes('$ACCEPT_GRANTED_AUTHORITIES')) {
        issues.push({ severity: 'HIGH', code: 'XSUAA_ACCEPT_GRANTED', message: 'ACCEPT_GRANTED_AUTHORITIES in foreign-scope-references — service accepts ALL authorities from bound apps', file: file.name });
      }

      // NEW: Check missing role-collections (easier onboarding but security review needed)
      if (!config['role-collections'] || config['role-collections'].length === 0) {
        issues.push({ severity: 'INFO', code: 'XSUAA_NO_ROLE_COLLECTIONS', message: 'No role-collections defined — administrators must manually assemble roles, consider pre-defining role-collections', file: file.name });
      }

    } catch (e) {
      issues.push({ severity: 'LOW', code: 'XSUAA_PARSE_ERR', message: 'Cannot parse xs-security.json', file: file.name });
    }
  }

  return issues;
}

module.exports = { scanBTPDestinations };