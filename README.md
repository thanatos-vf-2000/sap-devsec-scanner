# SAP DevSec Scanner

Language: EN | [FR](README-fr.md)

> Open-source security analysis tool for SAP BTP projects (SAPUI5/Fiori & CAP)

![Node.js](https://img.shields.io/badge/Node.js-23%2B-green)
![Vue.js](https://img.shields.io/badge/Vue.js-3.4-brightgreen)
![Express](https://img.shields.io/badge/Express-4.18-lightgrey)
![GitHub License](https://img.shields.io/github/license/thanatos-vf-2000/sap-devsec-scanner)

[![Docs](https://img.shields.io/badge/docs-online-brightgreen)](https://thanatos-vf-2000.github.io/sap-devsec-scanner/) [![Workflow Status](https://github.com/thanatos-vf-2000/sap-devsec-scanner/actions/workflows/docs.yml/badge.svg?branch=master)](https://github.com/thanatos-vf-2000/sap-devsec-scanner/actions)

---

## Table des matières

- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Language Management](#language-management)
- [Project Structure](#project-structure)
- [REST API](#rest-api)
- [Available Scanners](#available-scanners)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**SAP DevSec Scanner** automatically analyzes SAP BTP projects to identify common security vulnerabilities. It supports **SAPUI5/Fiori** and **CAP (Cloud Application Programming)** projects.

The scanner accepts:
- a project **ZIP archive** uploaded through the web interface;
- a **server-side directory path** for direct filesystem analysis.

---

## Features

| Feature | Description |
|---|---|
| **UI5 Version Scanner** | Detects obsolete or EOL (End of Life) SAPUI5 versions |
| **UI5 Code Scanner** | XSS detection, `eval()`, `innerHTML`, open redirect, OWASP Top 10 |
| **NPM Security Scanner** | Audits npm dependencies, detects known CVEs, best practices |
| **CAP Security Scanner** | CDS access control, SQL injection, service and handler security |
| **Secrets Scanner** | Plaintext credentials, JWT tokens, API keys, secrets in CI/CD |
| **BTP Destinations Scanner** | Analysis of XSUAA configurations, BTP destinations, and mta.yaml |
| **AppRouter Security Scanner** | xs-app.json, HTTP headers, CSRF, scopes, @sap/approuter version |
| **Risk Score** | 0–100 score weighted by severity (CRITICAL / HIGH / MEDIUM / LOW) |
| **Scan History** | Session reports stored in memory |

---

## Prerequisites

- **Node.js** ≥ 23
- **npm** ≥ 11

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/thanatos-vf-2000/sap-devsec-scanner.git
cd sap-devsec-scanner
```

### 2. Install backend dependencies

```bash
npm install
```

---

## Usage

### Production Mode (Express serving the built frontend)

```bash
npm start
# → http://localhost:3001
```

---

## Language Management

The user interface is automatically displayed in **French** or **English**, depending on the language configured in the user's browser.

### Frontend (Vue.js)

The language is detected at startup using `navigator.language` in `src/i18n/index.js`:

```js
function detectLang() {
  const lang = navigator.language || navigator.userLanguage || 'en';
  return lang.toLowerCase().startsWith('fr') ? 'fr' : 'en';
}
```

All UI strings are centralized in this file. To add a new language:
1. Add a new `xx: { ... }` object to the `messages` collection.
2. Extend the `detectLang()` logic accordingly.

### Backend (Express.js)

The backend detects the preferred language through the HTTP `Accept-Language` header automatically sent by the browser.

```js
app.use((req, res, next) => {
  const acceptLang = req.headers['accept-language'] || '';
  const isFrench = acceptLang.toLowerCase().split(',').some(lang =>
    lang.trim().startsWith('fr')
  );
  req.lang = isFrench ? 'fr' : 'en';
  req.t = i18n[req.lang];
  next();
});
```

API error messages are translated using `backend/utils/i18n.js`.

---

## Project Structure

> The project source code is only available in the **dev** branch.

```
Root/
├── backend/           # Express server (REST API + built frontend)
│   ├── scanners/      # Scanner modules (one file per scanner)
│   ├── routes/        # Express API routes
│   ├── utils/         # Utilities (fileParser, i18n)
│   └── server.js      # Application entry point
├── frontend/          # Vue.js application source
└── docs/              # GitHub Pages documentation (VitePress)
```

---

## REST API

| Method | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/health` | Server status, application version, detected language |
| `POST` | `/api/scan/upload` | Scan an uploaded ZIP archive (`multipart/form-data`, field `project`) |
| `POST` | `/api/scan/directory` | Scan a local directory (`{ dirPath, projectName }`) |
| `GET` | `/api/scan/history` | List all scans performed during the current session |
| `GET` | `/api/scan/:scanId` | Retrieve the complete scan report |
| `DELETE` | `/api/scan/:scanId` | Delete a scan report from the session history |

### `/api/health` Response Example

```json
{
  "status": "ok",
  "version": "1.3.0",
  "service": "SAP DevSec Scanner",
  "lang": "fr"
}
```

### `/api/scan/:scanId` Response Example

```json
{
  "scanId": "uuid",
  "projectName": "my-fiori-app",
  "projectTypes": ["UI5", "CAP"],
  "scannedAt": "2026-06-25T10:00:00.000Z",
  "filesScanned": 42,
  "riskScore": 73,
  "riskLevel": "MEDIUM",
  "summary": {
    "critical": 0, "high": 2, "medium": 3, "low": 5, "info": 1, "total": 11
  },
  "results": {
    "ui5": { ... },
    "cap": { ... },
    "secrets": { "findings": [] },
    "btp": { "issues": [] },
    "npm": { ... },
    "approuter": { ... }
  }
}
```

---

## Available Scanners

### UI5 Version Scanner

The **UI5 Version Scanner** detects the SAPUI5 version declared in `manifest.json`, `ui5.yaml`, `package.json`, and UI5 CDN bootstrap URLs. It compares the detected version against the official SAP-supported release matrix (LTS, Latest, Maintenance, End of Maintenance).

**Analyzed files:** `manifest.json`, `ui5.yaml`, `package.json`

| Code | Severity | Description |
|------|:--------:|-------------|
| `UI5_EOL` | HIGH | SAPUI5 version has reached End of Maintenance (EOM). |
| `UI5_NOT_LTS` | MEDIUM | Supported version, but not a Long-Term Support (LTS) release. |
| `UI5_UNSUPPORTED` | CRITICAL | Unknown or unsupported SAPUI5 version. |
| `UI5_OUTDATED` | MEDIUM | More than 10 minor releases behind the latest supported version. |
| `UI5_NOT_DETECTED` | INFO | No SAPUI5 version could be detected. |
| `UI5_NO_CSP` | MEDIUM | Missing Content Security Policy (CSP) in `manifest.json`. |
| `UI5_CORS_WILDCARD` | HIGH | `allowed-cors-origins` contains the wildcard (`*`). |
| `UI5_DEFAULT_VERSION` | INFO | Application version is still set to the default value (`1.0.0`). |

---

### UI5 Code Scanner

The **UI5 Code Scanner** inspects JavaScript and TypeScript source files for common security vulnerabilities, insecure coding patterns, SAPUI5-specific risks, and OWASP Top 10 issues.

**Analyzed files:** `*.js`, `*.ts`, `*.jsx`, `*.tsx` (excluding `node_modules` and minified files)

#### XSS & Code Injection

| Code | Severity | Description |
|------|:--------:|-------------|
| `UI5_XSS_HTML_CONTROL` | HIGH | Dynamic content passed to `sap.ui.core.HTML`. |
| `UI5_XSS_INNERHTML` | HIGH | Direct assignment to `innerHTML`. |
| `UI5_XSS_OUTERHTML` | HIGH | Direct assignment to `outerHTML`. |
| `UI5_EVAL` | CRITICAL | Usage of `eval()`. |
| `UI5_DOCUMENT_WRITE` | HIGH | Usage of `document.write()`. |
| `UI5_NEW_FUNCTION` | HIGH | Usage of the `new Function()` constructor. |
| `UI5_XMLVIEW_TEMPLATE` | HIGH | `XMLView.create()` invoked with template literals. |
| `UI5_DEPRECATED_COMMONS` | HIGH | Deprecated `sap.ui.commons.*` controls detected (no longer receiving security fixes). |

#### Open Redirect

| Code | Severity | Description |
|------|:--------:|-------------|
| `UI5_OPEN_REDIRECT` | HIGH | Dynamic `window.location` assignment. |
| `REDIRECT_LOCATION` | MEDIUM | `window.location =` without a static URL. |
| `REDIRECT_LOCATION_HREF` | MEDIUM | `window.location.href =` without a static URL. |
| `REDIRECT_OPEN` | MEDIUM | `window.open()` called with a dynamic URL. |

#### Sensitive Data Exposure

| Code | Severity | Description |
|------|:--------:|-------------|
| `UI5_SENSITIVE_LOG` | MEDIUM | Sensitive information (passwords, tokens, etc.) written to logs. |
| `UI5_LOCALSTORAGE_UNENCRYPTED` | LOW | Data stored in `localStorage` without proper protection. |
| `SENSITIVE_DATA_LOCAL` | LOW | Sensitive information stored in `localStorage`. |
| `SENSITIVE_DATA_SESSION` | LOW | Sensitive information stored in `sessionStorage`. |
| `SENSITIVE_DATA_CONSOLE` | LOW | Sensitive information printed to the browser console. |

#### SAPUI5 Security Best Practices

| Code | Severity | Description |
|------|:--------:|-------------|
| `UI5_SET_TIMEOUT` | MEDIUM | `setTimeout()` called with a string instead of a callback function. |
| `UI5_SET_INTERVAL` | MEDIUM | `setInterval()` called with a string instead of a callback function. |
| `UI5_DYNAMIC_FRAGMENT` | MEDIUM | Dynamic fragment name used in `Fragment.load()`. |
| `UI5_RENDER_WHITESPACE` | INFO | `renderWhitespace: true` detected. Ensure rendered content is properly sanitized. |
| `SAP_DEPRECATED_JQUERY_SAP` | LOW | Deprecated `jQuery.sap.*` APIs (obsolete since SAPUI5 1.58). |
| `SAP_POSTMESSAGE_NOCHECK` | MEDIUM | `postMessage` event listener without validating `event.origin`. |
| `SAP_FORMATTER_CONCAT` | MEDIUM | String concatenation inside a formatter may introduce XSS vulnerabilities. |
| `SAP_SPECIFIC_GETCORE` | HIGH | Modification of SAPUI5 security token handlers. |
| `SAP_SPECIFIC_JQUERY` | MEDIUM | Dynamically constructed resource path. |
| `SAP_SPECIFIC_REQUIRE` | MEDIUM | Dynamic module name passed to `sap.ui.require()`. |
| `SAP_SPECIFIC_JQUERY_AJAX` | MEDIUM | Dynamic URL passed to `jQuery.ajax()`. |

#### OWASP Top 10

| Code | Severity | Description |
|------|:--------:|-------------|
| `OWASP_REQUIRE` | HIGH | Potential path traversal through `require()`. |
| `OWASP_FS` | HIGH | File system access using user-controlled input. |
| `OWASP_CHILD_PROCESS` | CRITICAL | `child_process.exec()` or `spawn()` invoked with user-controlled input. |
| `OWASP_HTTP` | HIGH | Outbound HTTP request built from user input. |
| `OWASP_DESERIALIZ` | MEDIUM | Potentially unsafe deserialization detected. |

---

### NPM Security Scanner

The **NPM Security Scanner** analyzes `package.json` files to inventory project dependencies, identify known vulnerabilities (CVEs), and verify dependency management best practices.

**Analyzed files:** `package.json` (excluding `node_modules`)

#### Known Vulnerabilities (CVEs)

| Code / CVE | Severity | Affected Package | Description |
|------------|:--------:|------------------|-------------|
| `CVE-2023-25615` | HIGH | `@sap/xssec < 3.2.0` | Improper authorization validation in XSUAA authentication. |
| `CVE-2022-39802` | MEDIUM | `@sap/cds < 6.0.0` | Path traversal vulnerability in `cds serve`. |
| `CVE-2022-41271` | HIGH | `@sap/approuter < 12.0.0` | Log injection vulnerability during request processing. |
| `CVE-2022-28214` | MEDIUM | `@sap/hdbext < 7.0.0` | Improper error handling exposing SAP HANA details. |
| `CVE-2021-33690` | LOW | `@sap/xsenv < 3.1.0` | Server-Side Request Forgery (SSRF) through proxy configuration. |
| `CVE-2022-25896` | HIGH | `passport < 0.6.0` | Session fixation vulnerability. |
| `CVE-2022-23529` | HIGH | `jsonwebtoken < 9.0.0` | JWT token forgery vulnerability. |
| `CVE-2024-29041` | HIGH | `express < 4.19.0` | Open Redirect vulnerability. |
| `CVE-2023-45857` | HIGH | `axios < 1.6.0` | Sensitive HTTP headers leaked during third-party redirects. |
| *(Best Practice)* | MEDIUM | `helmet < 7.0.0` | Recommended HTTP security headers are not enabled by default. |

#### Dependency Best Practices

| Code | Severity | Description |
|------|:--------:|-------------|
| `VERSION_WILDCARD` | MEDIUM | Dependency version uses `*` or `latest` instead of a fixed version. |
| `FORBIDDEN_IN_PROD` | LOW | Development packages (`nodemon`, `jest`, etc.) are included in production dependencies. |
| `RECOMMENDED_PACKAGES` | INFO | Recommended security packages are missing (`helmet`, `@sap/xssec`, `@sap/audit-logging`). |
| `MISSING_ENGINES` | LOW | Missing `engines.node` declaration. |
| `NPM_SCRIPT` | MEDIUM | Lifecycle scripts (`preinstall`, `postinstall`, `prepare`) detected. |
| `NO_LOCK_FILE` | LOW | No dependency lock file (`package-lock.json` or `yarn.lock`). |
| `LOCK_FILE` | INFO | Dependency lock file detected. Running `npm audit` is recommended. |

---

### CAP Security Scanner

The **CAP Security Scanner** inspects CDS models, CAP service handlers, application configuration files, and deployment descriptors to detect authorization issues, SQL injection risks, insecure configuration, and SAP CAP security misconfigurations.

**Analyzed files:** `*.cds`, `*.js`, `*.ts`, `mta.yaml`, `xs-security.json`, `.cdsrc.json`, and the `cds` section of `package.json`.

#### CDS Services

| Code | Severity | Description |
|------|:--------:|-------------|
| `CDS_NO_AUTH` | HIGH | Service is missing both `@requires` and `@restrict` authorization annotations. |
| `CDS_OPEN_SERVICE` | HIGH | Service is annotated with `@open`, allowing unrestricted access. |
| `CDS_PERSONAL_DATA_NO_LABEL` | INFO | `@PersonalData` annotation detected without an `@EndUserText.label` (GDPR recommendation). |
| `CDS_AUTOEXPOSE_NO_AUTH` | MEDIUM | Auto-exposed entity without access restrictions. |

#### CAP Service Handlers (JavaScript / TypeScript)

| Code | Severity | Description |
|------|:--------:|-------------|
| `CAP_HANDLER_NOAUTH` | MEDIUM | CAP event handler (`srv.on()`) without visible authorization checks. |
| `CAP_SELECT_NOFILTER` | LOW | `SELECT.from()` statement without a `WHERE` clause. |
| `CAP_UNVALIDATED_INPUT` | LOW | `req.data` used without visible input validation. |
| `CAP_SQL_INJECTION` | CRITICAL | SQL injection risk through template literals passed to `cds.run()`. |
| `CAP_ENV_ACCESS` | INFO | Access to `process.env`; verify that no secrets are hardcoded. |
| `CAP_LOG_REQUEST` | MEDIUM | Request object logged, potentially exposing sensitive information. |
| `CAP_DIRECT_HANA` | HIGH | Direct SAP HANA client (`hdb` or `@sap/hana-client`) bypassing CAP authorization. |
| `CAP_SECURITY_DISABLED` | CRITICAL | CAP security explicitly disabled (`"security": false`). |
| `CAP_EXPRESS_UNPROTECTED` | MEDIUM | Native Express route without XSUAA or Passport authentication middleware. |
| `CAP_JSON_PARSE_INPUT` | MEDIUM | `JSON.parse()` applied to raw user input. |
| `CAP_PATH_TRAVERSAL` | HIGH | File access using user-controlled input. |

#### CDS Configuration

(`.cdsrc.json` / `package.json`)

| Code | Severity | Description |
|------|:--------:|-------------|
| `CAP_AUTH_MOCK` | HIGH | Authentication mode set to `dummy`, `mock`, or `basic`. Never use in production. |
| `CAP_CSRF_DISABLED` | HIGH | CSRF protection disabled in CAP server configuration. |
| `CAP_INSECURE_PROFILE` | MEDIUM | Development or Hybrid profile enabled. |

#### Multi-Target Application (MTA)

| Code | Severity | Description |
|------|:--------:|-------------|
| `MTA_NO_AUTH` | HIGH | Module deployed without authentication configuration. |
| `MTA_SEC_PATCH_OFF` | MEDIUM | Automatic security patching disabled. |
| `MTA_HTTP_ENDPOINT` | HIGH | HTTP endpoint configured instead of HTTPS. |

#### XSUAA Configuration (`xs-security.json`)

| Code | Severity | Description |
|------|:--------:|-------------|
| `XSUAA_NO_PROVIDERS` | MEDIUM | `allowedproviders` is empty, allowing unrestricted Identity Providers. |
| `XSUAA_WILDCARD` | MEDIUM | Wildcard detected in `xsappname`. |
| `XSUAA_ACCEPT_GRANTED` | HIGH | `$ACCEPT_GRANTED_AUTHORITIES` enabled, accepting all granted authorities. |

---

### Secrets Scanner

The **Secrets Scanner** detects hardcoded credentials, API keys, JWT tokens, private keys, passwords, and other sensitive information embedded in source code, configuration files, and CI/CD pipelines.

**Analyzed files:** All text files (excluding `node_modules`, `.git`, `dist`, `build`, and binary assets).

#### Hardcoded Secrets

| Code | Severity | Description |
|------|:--------:|-------------|
| `SECRET_PASSWORD` | CRITICAL | Plain-text password detected (`password=`, `pwd:`...). |
| `SECRET_CLIENT_SECRET` | CRITICAL | Hardcoded OAuth2 Client Secret. |
| `SECRET_API_KEY` | CRITICAL | Hardcoded API key. |
| `SECRET_TOKEN` | CRITICAL | Hardcoded access token or bearer token. |
| `SECRET_KEY` | CRITICAL | Hardcoded secret key. |
| `SECRET_PRIVATE_KEY` | CRITICAL | Private key embedded in the repository. |
| `SECRET_VCAP` | HIGH | `VCAP_SERVICES` credentials detected inside source code. |
| `SECRET_CLIENT_ID` | HIGH | Hardcoded OAuth2 Client ID. |
| `SECRET_DB_PASSWORD` | CRITICAL | Hardcoded database password. |
| `SECRET_SMTP` | HIGH | SMTP credentials exposed. |
| `SECRET_AWS_KEY` | CRITICAL | AWS Access Key detected. |
| `SECRET_XSUAA` | CRITICAL | Hardcoded XSUAA client secret. |
| `SECRET_HDI_USER` | CRITICAL | HDI container username exposed. |
| `SECRET_HDI_PASSWORD` | CRITICAL | HDI container password exposed. |
| `SECRET_IAS_SECRET` | CRITICAL | SAP Identity Authentication Service (IAS) secret detected. |
| `SECRET_AI_CORE` | CRITICAL | SAP AI Core secret detected. |
| `SECRET_CONNECTIVITY` | HIGH | SAP Connectivity / Cloud Connector credentials detected. |
| `SECRET_HANA_CLOUD_URL` | CRITICAL | SAP HANA Cloud connection URL contains embedded credentials. |
| `SECRET_CF_PASSWORD` | CRITICAL | Cloud Foundry administrator/user password detected. |
| `SECRET_GITHUB_PAT` | CRITICAL | GitHub Personal Access Token detected. |
| `SECRET_BASE64_CANDIDATE` | INFO | 52-character Base64 string detected (potential encoded secret). |

#### Sensitive Configuration Files

| Code | Severity | Description |
|------|:--------:|-------------|
| `ENV_SECRET` | HIGH | Sensitive variables detected inside `.env`. |
| `DEFAULT_ENV_SECRETS` | CRITICAL | `default-env.json` contains credentials. |
| `DEFAULT_ENV_COMMITTED` | HIGH | `default-env.json` is committed to the repository. |
| `MANIFEST_SECRET` | HIGH | Potential secret detected in `manifest.yml`. |
| `SERVICE_KEY_COMMITTED` | CRITICAL | `service-key.json` found in the repository. |
| `PIPELINE_SECRET` | CRITICAL | Hardcoded secret detected in CI/CD configuration. |

#### Git Ignore Verification

| Code | Severity | Description |
|------|:--------:|-------------|
| `NO_GITIGNORE` | MEDIUM | Missing `.gitignore`; sensitive files may accidentally be committed. |
| `GITIGNORE_MISSING` | MEDIUM | Sensitive files (`.env`, `default-env.json`, `service-key.json`, etc.) are not ignored. |

---

### BTP Destinations Scanner

The **BTP Destinations Scanner** validates SAP BTP Destination configurations, XSUAA definitions, and MTA descriptors to detect weak authentication mechanisms and insecure deployment settings.

**Analyzed files:** `*destination*.json`, `*dest*.json`, `xs-security.json`, `mta.yaml`

#### Destination Configuration

| Code | Severity | Description |
|------|:--------:|-------------|
| `BTP_NO_AUTH` | HIGH | Destination configured with `NoAuthentication`. |
| `BTP_TRUST_ALL` | HIGH | `TrustAll: true` disables TLS certificate validation. |
| `BTP_HTTP_URL` | HIGH | Destination uses an insecure HTTP endpoint. |
| `BTP_DEST_PASSWORD` | CRITICAL | Hardcoded destination password detected. |
| `BTP_DEST_NO_TOKEN_URL` | MEDIUM | OAuth2 destination missing `TokenServiceURL`. |
| `BTP_DEST_CLIENT_SECRET` | CRITICAL | Hardcoded OAuth2 Client Secret detected. |
| `BTP_DEST_NO_CC_LOCATION` | LOW | On-Premise destination missing `CloudConnectorLocationId`. |

#### MTA Configuration

| Code | Severity | Description |
|------|:--------:|-------------|
| `BTP_MTA_NO_AUTH` | HIGH | `NoAuthentication` detected in MTA configuration. |
| `BTP_MTA_NO_AUTH_FORWARD` | LOW | `NoAuthentication` combined with `ForwardAuthToken: true`. |
| `BTP_MTA_NO_MEMORY` | LOW | Module deployed without a memory quota. |
| `BTP_MTA_NO_HEALTHCHECK` | INFO | Missing `health-check-type` for Node.js modules. |

#### XSUAA Configuration

| Code | Severity | Description |
|------|:--------:|-------------|
| `XSUAA_NO_APPNAME` | MEDIUM | Missing `xsappname`. |
| `XSUAA_NO_SCOPES` | LOW | No authorization scopes defined. |
| `XSUAA_GENERIC_ROLE` | LOW | Only one generic role (`User`) is defined. |
| `XSUAA_LONG_TOKEN` | MEDIUM | Token lifetime exceeds 12 hours. |
| `XSUAA_REDIRECT_LOCALHOST` | MEDIUM | Redirect URI points to `localhost` or uses HTTP. |
| `XSUAA_WILDCARD_REDIRECT` | HIGH | Wildcard redirect URI detected without HTTPS. |
| `XSUAA_SHARED_NO_FOREIGN_SCOPE` | LOW | Shared tenant mode without `$XSSERVICENAME` reference. |
| `XSUAA_ACCEPT_GRANTED` | HIGH | `$ACCEPT_GRANTED_AUTHORITIES` enabled. |
| `XSUAA_NO_ROLE_COLLECTIONS` | INFO | No role collections defined. |
| `XSUAA_PARSE_ERR` | LOW | Unable to parse `xs-security.json`. |

---

### AppRouter Security Scanner

The **AppRouter Security Scanner** performs a comprehensive security assessment of SAP BTP AppRouter configurations by analyzing `xs-app.json`, `package.json`, and `mta.yaml`.

**Analyzed files:** `xs-app.json`, `package.json` (with `@sap/approuter`), `mta.yaml`

#### Global Configuration (`xs-app.json`)

| Code | Severity | Description |
|------|:--------:|-------------|
| `AR_AUTH_NONE_GLOBAL` | HIGH | Global `authenticationMethod: "none"` exposes all routes publicly. |
| `AR_CSRF_DISABLED` | HIGH | `csrfProtection: false` disables CSRF protection. |
| `AR_SESSION_LONG` | MEDIUM | `sessionTimeout` exceeds 60 minutes. |
| `AR_NO_SESSION_TIMEOUT` | INFO | No session timeout configured. |
| `AR_NO_LOGOUT_ENDPOINT` | LOW | No logout endpoint configured. |
| `AR_PARSE_ERROR` | LOW | Invalid `xs-app.json` (malformed JSON). |
| `AR_NO_ROUTES` | INFO | No routes defined. |

#### HTTP Security Headers

| Code | Severity | Description |
|------|:--------:|-------------|
| `AR_MISSING_CSP` | HIGH | Missing `Content-Security-Policy` header. |
| `AR_MISSING_XFO` | MEDIUM | Missing `X-Frame-Options` header. |
| `AR_MISSING_XCTO` | MEDIUM | Missing `X-Content-Type-Options: nosniff`. |
| `AR_MISSING_HSTS` | MEDIUM | Missing `Strict-Transport-Security` (HSTS). |
| `AR_MISSING_RP` | LOW | Missing `Referrer-Policy`. |
| `AR_CSP_UNSAFE_INLINE` | HIGH | CSP contains `'unsafe-inline'`. |
| `AR_CSP_UNSAFE_EVAL` | HIGH | CSP contains `'unsafe-eval'`. |
| `AR_CSP_WILDCARD` | HIGH | CSP contains wildcard (`*`). |
| `AR_CSP_NO_FRAME_ANCESTORS` | LOW | Missing `frame-ancestors` directive in CSP. |
| `AR_XFO_UNSAFE` | MEDIUM | Unsafe `X-Frame-Options` value detected. |

#### Route Configuration

| Code | Severity | Description |
|------|:--------:|-------------|
| `AR_ROUTE_NO_AUTH` | HIGH | Route configured with `authenticationType: "none"`. |
| `AR_ROUTE_CSRF_OFF` | MEDIUM | CSRF protection disabled for a route. |
| `AR_ROUTE_HTTP_DEST` | HIGH | Route destination uses HTTP instead of HTTPS. |
| `AR_WILDCARD_ROUTE_NO_AUTH` | CRITICAL | Catch-all route (`.*`) without authentication. |
| `AR_FORWARD_TOKEN_NO_AUTH` | HIGH | `forwardAuthToken: true` enabled on an unauthenticated route. |
| `AR_ROUTE_NO_SCOPE` | LOW | Authenticated API route without scope restrictions. |
| `AR_HTML5_REPO_NO_AUTH` | MEDIUM | HTML5 Application Repository route without authentication. |

#### AppRouter Version

| Code | Severity | Description |
|------|:--------:|-------------|
| `AR_OUTDATED_VERSION` | HIGH | `@sap/approuter` version earlier than **14.0.0**. |

#### MTA Configuration

| Code | Severity | Description |
|------|:--------:|-------------|
| `AR_MTA_NO_XSUAA` | HIGH | AppRouter module is not bound to an XSUAA or IAS service instance. |
| `AR_MTA_NO_CONNECTIVITY` | MEDIUM | On-Premise destinations configured without the Connectivity service. |
| `AR_MTA_NO_SESSION_TIMEOUT` | INFO | `SESSION_TIMEOUT` environment variable not configured. |
| `AR_JWT_TRUST_WILDCARD` | CRITICAL | `SAP_JWT_TRUST_ACL` allows wildcard client IDs (`clientid: "*"`) |
| `AR_XFO_DISABLED` | HIGH | `SEND_XFRAMEOPTIONS: false` disables clickjacking protection. |

#### Managed AppRouter

| Code | Severity | Description |
|------|:--------:|-------------|
| `AR_XSAPP_NO_PKG` | INFO | `xs-app.json` found without a neighboring `package.json` declaring `@sap/approuter`. |

---

## Contributing

Contributions are welcome! To contribute:

1. Fork the **dev** branch,
2. Create a feature branch (`git checkout -b feature/ma-feature`),
3. Commit your changes (`git commit -m 'feat: ajouter ...'`),
4. Push your branch (`git push origin feature/ma-feature`),
5. Open a Pull Request.

---

## License

Copyright © 2026 Franck VANHOUCKE

Licensed under the Apache License, Version 2.0.

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an **"AS IS" BASIS**, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

See the `LICENSE` file for more information.

---

> **SAP DevSec Scanner** is an independent community-driven open-source project and is **not affiliated with, endorsed by, or sponsored by SAP SE.**
