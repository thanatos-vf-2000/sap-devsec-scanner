# Available Scanners

SAP DevSec Scanner includes **6 specialized scanners** that activate automatically based on the detected project type.

## 🎨 UI5 Version Scanner

Analyzes `manifest.json`, `ui5.yaml` and CDN bootstrap tags to identify the declared SAPUI5 version, then compares it against the official supported versions table.

**Files analyzed:** `manifest.json`, `ui5.yaml`, `*.html` (CDN bootstrap)

| Finding | Severity |
|---------|----------|
| EOL version (End of Life) | 🔴 CRITICAL |
| EOM version (End of Maintenance) | 🟠 HIGH |
| Unrecognized version | 🟡 MEDIUM |
| Up-to-date LTS version | ℹ️ INFO |

---

## 📦 NPM Security Scanner

Analyzes `package.json` files to inventory SAP dependencies and flag packages with known risks or outdated versions.

**Files analyzed:** all `package.json` files in the project

| Finding | Severity |
|---------|----------|
| Package with known CVE | 🔴 CRITICAL or 🟠 HIGH |
| Very old major version | 🟡 MEDIUM |
| Deprecated package | 🔵 LOW |

---

## ⚙️ CAP Security Scanner

Inspects CDS, MTA and XSUAA files to detect security misconfigurations in Cloud Application Programming projects.

**Files analyzed:** `*.cds`, `mta.yaml`, `xs-security.json`

| Rule | Severity | Description |
|------|----------|-------------|
| `NO_AUTH_REQUIRED` | 🟠 HIGH | CDS service without `@requires` |
| `ALLOW_ALL` | 🔴 CRITICAL | `@requires: 'any'` on sensitive entities |
| `XSUAA_WEAK_SCOPE` | 🟡 MEDIUM | Overly permissive XSUAA scopes |
| `MTA_NO_OAUTH` | 🟠 HIGH | MTA module without OAuth security |

---

## 🔍 UI5 Code Scanner

Scans JavaScript and TypeScript files in UI5/Fiori projects for dangerous code patterns that may introduce XSS vulnerabilities or insecure behavior.

**Files analyzed:** `*.js`, `*.ts` (excluding `node_modules`)

| Detected pattern | Severity | Risk |
|------------------|----------|------|
| `eval(` | 🔴 CRITICAL | Arbitrary code execution |
| `.innerHTML =` | 🟠 HIGH | XSS injection |
| `document.write(` | 🟠 HIGH | XSS injection |
| Open redirect (`location.href`) | 🟡 MEDIUM | Unvalidated redirect |
| Unsafe `sap.ui.require` | 🔵 LOW | Uncontrolled module loading |

---

## 🔐 Secrets Scanner

Detects hardcoded credentials, tokens and API keys in project sources. Analyzes both configuration files and source code.

**Files analyzed:** `*.env`, `.env*`, `default-env.json`, `*.json`, `*.js`, `*.ts`, `*.yaml`, `*.yml`

| Detected pattern | Severity |
|------------------|----------|
| JWT token (`eyJ...`) | 🔴 CRITICAL |
| Plaintext API key (`apiKey`, `api_key`) | 🔴 CRITICAL |
| Hardcoded password (`password =`) | 🟠 HIGH |
| XSUAA Client Secret | 🔴 CRITICAL |
| Credential in URL (`https://user:pass@`) | 🟠 HIGH |

::: tip
Always use environment variables or the **SAP Credential Store** to manage your secrets.
:::

---

## ☁️ BTP Destinations Scanner

Checks SAP BTP destination configurations and XSUAA files for weak authentication or configuration bad practices.

**Files analyzed:** `*.destinations`, `xs-security.json`, `default-env.json`

| Finding | Severity | Description |
|---------|----------|-------------|
| `NoAuthentication` | 🟠 HIGH | Destination without auth |
| Empty `allowedJwtClaims` | 🟡 MEDIUM | Insufficient JWT validation |
| Non-unique `xsappname` | 🔵 LOW | Namespace collision risk |
| Missing `oauth2-configuration` | 🟡 MEDIUM | Missing OAuth config |

## 🌐 AppRouter Security Scanner

It covers everything the btp-secure-development repository covers regarding the AppRouter

**Files analyzed:** `xs-app.json`, `package.json` et `mta.yaml`