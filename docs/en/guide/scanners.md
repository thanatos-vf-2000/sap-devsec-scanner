# Scanners Reference

SAP DevSec Scanner includes **6 specialized scanners** that activate automatically based on the detected project type.

This page covers all available scanners, the files they analyze, and every error code with its explanation and how to fix it.

## Overview

| Scanner | Files analyzed | Error codes |
|---|---|---|
| [UI5 Version](#ui5-version-scanner) | `manifest.json`, `ui5.yaml`, `package.json` | 8 |
| [UI5 Code](#ui5-code-scanner) | `*.js`, `*.ts`, `*.jsx`, `*.tsx` | 30+ |
| [NPM Security](#npm-security-scanner) | `package.json` | 11 |
| [CAP Security](#cap-security-scanner) | `*.cds`, `*.js`, `*.ts`, `mta.yaml`, `xs-security.json` | 21 |
| [Secrets](#secrets-scanner) | All text files | 22 |
| [BTP Destinations](#btp-destinations-scanner) | `*destination*.json`, `xs-security.json`, `mta.yaml` | 18 |
| [AppRouter](#approuter-security-scanner) | `xs-app.json`, `package.json`, `mta.yaml` | 25 |

---

## UI5 Version Scanner

Detects the SAPUI5 version declared in your project and compares it to the official SAP version maintenance table. It flags end-of-life versions, outdated versions, and manifest misconfigurations.

**Files analyzed:** `manifest.json`, `ui5.yaml`, `package.json`

---

### `UI5_UNSUPPORTED` - CRITICAL

**Unknown or unsupported UI5 version**

The detected SAPUI5 version does not appear in SAP's officially maintained version table.

**Fix:**
Migrate to a supported LTS version. The recommended LTS version is `1.136.x` (supported until Q4/2032). Check the [official version overview](https://ui5.sap.com/versionoverview.html).

```json
// manifest.json
{
  "sap.ui5": {
    "dependencies": {
      "minUI5Version": "1.136.0"
    }
  }
}
```

---

### `UI5_EOL` - HIGH

**UI5 version End of Maintenance**

The SAPUI5 version in use is no longer maintained by SAP and receives no security patches.

**Fix:**
Upgrade to an actively maintained LTS version such as `1.136.x` or `1.120.x`.

```yaml
# ui5.yaml
framework:
  name: SAPUI5
  version: "1.136.19"
```

---

### `UI5_NOT_LTS` - MEDIUM

**Maintained but not an LTS version**

The UI5 version is still maintained but is not a Long-Term Support release, meaning its support window is shorter.

**Fix:**
Consider migrating to an LTS version for extended support. Current LTS versions: `1.136`, `1.120`, `1.108`, `1.96`, `1.71`, `1.38`.

---

### `UI5_OUTDATED` - MEDIUM

**Version too far behind the latest release**

The detected version is more than 10 minor versions behind the latest available release.

**Fix:**
Plan an upgrade. See the [UI5 upgrade guide](https://ui5.sap.com/sdk/#/topic/upgrading).

---

### `UI5_NOT_DETECTED` - INFO

**No UI5 version detected**

The scanner found no UI5 version declaration in `manifest.json`, `ui5.yaml`, or `package.json`. The project may not be a UI5/Fiori project.

**Fix:**
If this is a UI5 project, verify that `manifest.json` contains the `sap.ui5.dependencies.minUI5Version` field.

---

### `UI5_NO_CSP` - MEDIUM

**No Content-Security-Policy defined in manifest.json**

The `sap.ui5` section of `manifest.json` defines no CSP or `frame-options`. Without CSP, the application is more vulnerable to XSS attacks.

**Fix:**
Configure CSP at the AppRouter level via `httpHeaders` in `xs-app.json` (recommended approach):

```json
// xs-app.json
{
  "httpHeaders": [
    {
      "Content-Security-Policy": "default-src 'self'; script-src 'self' https://ui5.sap.com;"
    }
  ]
}
```

---

### `UI5_CORS_WILDCARD` - HIGH

**`allowed-cors-origins` with wildcard `*`**

The `sap.ui5.allowed-cors-origins` setting permits cross-origin requests from any origin, exposing the app to CSRF attacks and data leakage.

**Fix:**
Restrict to known, trusted origins:

```json
{
  "sap.ui5": {
    "allowed-cors-origins": "https://my-app.cfapps.eu10.hana.ondemand.com"
  }
}
```

---

### `UI5_DEFAULT_VERSION` - INFO

**Application version still at `1.0.0` (default)**

The application version (`sap.app.applicationVersion.version`) is still the default `1.0.0`, which prevents proper cache-busting on deployments.

**Fix:**
Update the version with each deployment:

```json
{
  "sap.app": {
    "applicationVersion": {
      "version": "1.2.3"
    }
  }
}
```

---

## UI5 Code Scanner

Static analysis of JavaScript and TypeScript files for dangerous patterns: XSS, code injection, open redirect, and OWASP/SAP-specific bad practices.

**Files analyzed:** `*.js`, `*.ts`, `*.jsx`, `*.tsx` (excludes `node_modules` and minified files)

---

### `UI5_EVAL` - CRITICAL

**Use of `eval()`**

`eval()` executes arbitrary JavaScript from a string - a major code injection vector.

**Fix:**
Replace `eval()` with safe alternatives. Use `JSON.parse()` for parsing, or a function map for dynamic calls.

```js
// ❌ Dangerous
eval(userInput);

// ✅ Safe
const fn = { myFunc: () => {} };
fn['myFunc']();
```

---

### `UI5_XSS_INNERHTML` - HIGH

**Direct assignment to `innerHTML`**

Assigning unsanitized content to `innerHTML` is the most common XSS vector in web applications.

**Fix:**
Use `textContent` for plain text, or SAP encoding functions for HTML:

```js
// ❌ Dangerous
element.innerHTML = userInput;

// ✅ Safe (plain text)
element.textContent = userInput;

// ✅ Safe (encoded HTML)
const encoded = sap.base.security.encodeXML(userInput);
element.innerHTML = encoded;
```

---

### `UI5_XSS_OUTERHTML` - HIGH

**Use of `outerHTML`**

`outerHTML` replaces the entire element with raw HTML. If this HTML comes from user input, it is an XSS vector.

**Fix:**
Avoid `outerHTML` with unsanitized data. Rebuild the element through the DOM API instead.

---

### `UI5_XSS_HTML_CONTROL` - HIGH

**`sap.ui.core.HTML` with dynamic content**

The `sap.ui.core.HTML` control inserts raw HTML into the DOM. Using unsanitized dynamic content creates an XSS vulnerability.

**Fix:**
Sanitize HTML content before injecting it, or enable `sanitizeContent: true`:

```js
new sap.ui.core.HTML({
  content: "<div>" + sap.base.security.encodeXML(userInput) + "</div>",
  sanitizeContent: true
});
```

---

### `UI5_DOCUMENT_WRITE` - HIGH

**Use of `document.write()`**

`document.write()` rewrites the entire document and can inject scripts if content comes from an untrusted source.

**Fix:**
Use modern DOM methods:

```js
// ❌ Dangerous
document.write('<script src="' + url + '"></script>');

// ✅ Safe
const script = document.createElement('script');
script.src = trustedUrl; // statically validated URL
document.head.appendChild(script);
```

---

### `UI5_NEW_FUNCTION` - HIGH

**`new Function()` constructor**

`new Function()` creates a function from a string - equivalent to `eval()` with the same code injection risk.

**Fix:**
Replace with a statically defined function or a function mapping object.

---

### `UI5_XMLVIEW_TEMPLATE` - HIGH

**`XMLView.create` with a template literal**

`XMLView.create` with a definition built via a template literal allows injection of arbitrary XML/HTML tags if user data is interpolated.

**Fix:**
Never build a view definition dynamically from user data. Use static views and model bindings.

---

### `UI5_DEPRECATED_COMMONS` - HIGH

**Use of `sap.ui.commons.*`**

The `sap.ui.commons` library is deprecated and no longer receives security patches. It may contain unpatched vulnerabilities.

**Fix:**
Migrate to `sap.m.*` or `sap.f.*`:

```js
// ❌ Deprecated
new sap.ui.commons.Button({ text: "OK" });

// ✅ Current
new sap.m.Button({ text: "OK" });
```

---

### `UI5_OPEN_REDIRECT` - HIGH

**Dynamic `window.location` assignment**

Assigning a dynamic value to `window.location` without validation allows open redirect attacks: an attacker redirects users to a malicious site.

**Fix:**
Validate the URL against an allowlist before redirecting:

```js
// ❌ Dangerous
window.location = userInput;

// ✅ Safe
const ALLOWED_PATHS = ['/home', '/dashboard'];
if (ALLOWED_PATHS.includes(path)) {
  window.location = path;
}
```

---

### `REDIRECT_LOCATION` / `REDIRECT_LOCATION_HREF` / `REDIRECT_OPEN` - MEDIUM

**Redirect to dynamic URL**

`window.location`, `window.location.href`, or `window.open()` called with a dynamically constructed URL expose the app to open redirect.

**Fix:**
Always validate the target URL against an allowlist. Never call `window.open(userInput)` directly.

---

### `UI5_SENSITIVE_LOG` / `SENSITIVE_DATA_CONSOLE` - MEDIUM/LOW

**Logging sensitive data**

Sensitive data (password, token, key, auth…) is being logged via `console.log/debug/info`. In production, these logs can be captured by monitoring systems and expose credentials.

**Fix:**
Never log sensitive data. Use masking variables or remove production logs:

```js
// ❌ Dangerous
console.log("Token:", authToken);

// ✅ Safe
console.log("Authentication successful for user:", userId);
```

---

### `UI5_LOCALSTORAGE_UNENCRYPTED` / `SENSITIVE_DATA_LOCAL` / `SENSITIVE_DATA_SESSION` - LOW

**Sensitive data stored in localStorage/sessionStorage**

`localStorage` and `sessionStorage` are readable by any JavaScript on the page - an XSS attack can steal their contents. Never store secrets, tokens, or passwords there.

**Fix:**
Store tokens in `HttpOnly` cookies managed server-side. If Web storage must be used, never put secrets in it.

---

### `UI5_SET_TIMEOUT` / `UI5_SET_INTERVAL` - MEDIUM

**Passing a string to `setTimeout`/`setInterval`**

Passing a string to `setTimeout` or `setInterval` is equivalent to calling `eval()` on that string.

**Fix:**

```js
// ❌ Dangerous
setTimeout("myFunction()", 1000);

// ✅ Safe
setTimeout(myFunction, 1000);
setTimeout(() => myFunction(), 1000);
```

---

### `UI5_DYNAMIC_FRAGMENT` - MEDIUM

**Dynamic fragment name in `Fragment.load`**

If the fragment name is built from user input, an attacker could load an unintended fragment (module injection).

**Fix:**
Use only static fragment names or names from a trusted source:

```js
// ❌ Risky
Fragment.load({ name: userInput + ".Dialog" });

// ✅ Safe
Fragment.load({ name: "com.myapp.view.Dialog" });
```

---

### `SAP_DEPRECATED_JQUERY_SAP` - LOW

**Deprecated `jQuery.sap.*` APIs**

`jQuery.sap.*` APIs have been deprecated since UI5 1.58 and no longer receive security patches.

**Fix:**
Migrate to modern equivalents:

| Deprecated | Replacement |
|---|---|
| `jQuery.sap.log` | `sap/base/Log` |
| `jQuery.sap.encodeHTML` | `sap/base/security/encodeXML` |
| `jQuery.sap.resources` | `sap/base/i18n/ResourceBundle` |

---

### `SAP_POSTMESSAGE_NOCHECK` - MEDIUM

**`postMessage` listener without origin validation**

A `window.addEventListener('message', ...)` listener without checking `event.origin` will process messages from any window, including malicious sites.

**Fix:**

```js
window.addEventListener('message', (event) => {
  // ✅ Always validate the origin
  if (event.origin !== 'https://trusted-app.example.com') return;
  
  // Process the message
});
```

---

### `SAP_FORMATTER_CONCAT` - MEDIUM

**String concatenation in a formatter return - XSS risk**

Concatenating user data in a formatter that returns HTML can create an XSS vulnerability if the result is rendered in an HTML control.

**Fix:**

```js
// ❌ Risky
return "<b>" + value + "</b>";

// ✅ Safe
return "<b>" + encodeXML(value) + "</b>";
```

---

### `OWASP_CHILD_PROCESS` - CRITICAL

**`child_process.exec/spawn` with user input**

Executing a system command with request data enables command injection (RCE - Remote Code Execution).

**Fix:**
Never pass user data to `exec`, `spawn`, or `execSync`. Use `spawn` with an argument array (no shell):

```js
// ❌ Dangerous
exec(`convert ${req.body.filename} output.pdf`);

// ✅ Safe
spawn('convert', [sanitizedFilename, 'output.pdf'], { shell: false });
```

---

### `OWASP_FS` - HIGH

**Filesystem access with user input**

Using request data in file paths enables path traversal attacks (`../../etc/passwd`).

**Fix:**

```js
// ❌ Dangerous
fs.readFile(req.params.file, cb);

// ✅ Safe
const safePath = path.join('/safe/dir', path.basename(req.params.file));
if (!safePath.startsWith('/safe/dir')) throw new Error('Invalid path');
fs.readFile(safePath, cb);
```

---

## NPM Security Scanner

Analyzes npm dependencies for known CVEs in SAP and third-party packages, and verifies dependency management best practices.

**Files analyzed:** `package.json` (excludes `node_modules`)

---

### Known CVEs - HIGH/MEDIUM

For each detected CVE, the fix is to update the affected package to the indicated minimum version:

| CVE | Package | Minimum version | Command |
|---|---|---|---|
| `CVE-2023-25615` | `@sap/xssec` | `>=3.2.0` | `npm install @sap/xssec@latest` |
| `CVE-2022-39802` | `@sap/cds` | `>=6.0.0` | `npm install @sap/cds@latest` |
| `CVE-2022-41271` | `@sap/approuter` | `>=12.0.0` | `npm install @sap/approuter@latest` |
| `CVE-2022-28214` | `@sap/hdbext` | `>=7.0.0` | `npm install @sap/hdbext@latest` |
| `CVE-2021-33690` | `@sap/xsenv` | `>=3.1.0` | `npm install @sap/xsenv@latest` |
| `CVE-2022-25896` | `passport` | `>=0.6.0` | `npm install passport@latest` |
| `CVE-2022-23529` | `jsonwebtoken` | `>=9.0.0` | `npm install jsonwebtoken@latest` |
| `CVE-2024-29041` | `express` | `>=4.19.0` | `npm install express@latest` |
| `CVE-2023-45857` | `axios` | `>=1.6.0` | `npm install axios@latest` |

---

### `VERSION_WILCARD` - MEDIUM

**Unpinned version (`*` or `latest`)**

Using `*` or `latest` creates non-deterministic builds: the installed version can change without notice, introducing regressions or vulnerabilities.

**Fix:**
Pin versions in `package.json` and commit `package-lock.json`:

```json
{
  "dependencies": {
    "@sap/cds": "7.9.0"
  }
}
```

---

### `FORBIDDEN_IN_PROD` - LOW

**Dev package in production dependencies**

Packages like `nodemon`, `jest`, `mocha`, and `@sap/cds-dk` belong in `devDependencies`. Having them in `dependencies` bloats the production bundle and may expose debug features.

**Fix:**
Move them to `devDependencies`:

```bash
npm install --save-dev nodemon jest @sap/cds-dk
```

---

### `RECOMMENDED_PACKAGES` - INFO

**Recommended security packages missing**

The following packages are recommended by SAP for production BTP applications:

| Package | Purpose |
|---|---|
| `helmet` | Secure HTTP headers (CSP, HSTS, X-Frame-Options…) |
| `@sap/xssec` | Required for XSUAA JWT validation |
| `@sap/audit-logging` | Required for GDPR audit logging on BTP |

**Fix:**

```bash
npm install helmet @sap/xssec @sap/audit-logging
```

---

### `MISSING_ENGINES` - LOW

**No `engines.node` field**

Without a pinned Node.js version, the app may behave differently across environments (dev, CI, prod).

**Fix:**

```json
{
  "engines": {
    "node": ">=23.0.0"
  }
}
```

---

### `NPM_SCRIPT` - MEDIUM

**npm lifecycle hook detected (`preinstall`, `postinstall`, `prepare`)**

These hooks run automatically during `npm install`. Malicious dependencies can use them to execute arbitrary code (supply chain attack).

**Fix:**
Review defined scripts and ensure they are legitimate. Use `npm install --ignore-scripts` in CI pipelines where possible.

---

### `NO_LOCK_FILE` - LOW

**No lock file found**

Without `package-lock.json` or `yarn.lock`, dependencies are non-deterministic. Different versions may be installed in dev versus production.

**Fix:**

```bash
npm install  # generates package-lock.json
git add package-lock.json
git commit -m "chore: add package-lock.json"
```

---

## CAP Security Scanner

Analyzes CDS services, JavaScript handlers, `mta.yaml`, `xs-security.json`, and `.cdsrc.json` for access control issues and injection vulnerabilities in CAP projects.

**Files analyzed:** `*.cds`, `*.js`, `*.ts`, `mta.yaml`, `xs-security.json`, `.cdsrc.json`

---

### `CDS_NO_AUTH` - HIGH

**CDS service without `@requires` or `@restrict`**

A CDS service without an authorization annotation is accessible to any unauthenticated user if the service is publicly exposed.

**Fix:**
Add `@requires` or `@restrict` to every service:

```cds
// ❌ Dangerous - accessible without auth
service OrderService {
  entity Orders as projection on db.Orders;
}

// ✅ Safe
@requires: 'authenticated-user'
service OrderService {
  @restrict: [{ grant: 'READ', to: 'Viewer' }, { grant: 'WRITE', to: 'Editor' }]
  entity Orders as projection on db.Orders;
}
```

---

### `CDS_OPEN_SERVICE` - HIGH

**Service annotated with `@open`**

The `@open` annotation disables CDS's strict authorization model, making the service accessible without restrictions.

**Fix:**
Remove `@open` and replace with appropriate `@requires` / `@restrict` annotations. Only use `@open` in local prototypes.

---

### `CAP_SQL_INJECTION` - CRITICAL

**SQL injection via template literal in `cds.run()`**

Building an SQL query with a template literal that interpolates user data creates a critical SQL injection vulnerability.

**Fix:**
Always use the CDS fluent APIs or parameterized queries:

```js
// ❌ Dangerous
await cds.run(`SELECT * FROM Orders WHERE id = ${req.data.id}`);

// ✅ Safe
await SELECT.from('Orders').where({ id: req.data.id });
```

---

### `CAP_DIRECT_HANA` - HIGH

**Direct HANA client used**

Using the `hdb` or `@sap/hana-client` package directly completely bypasses the CDS authorization layer. No automatic access control is applied.

**Fix:**
Use CDS APIs (`SELECT`, `INSERT`, `cds.run()`) which automatically enforce `@restrict` annotations. If direct client access is unavoidable, implement explicit manual authorization checks.

---

### `CAP_SECURITY_DISABLED` - CRITICAL

**CDS security explicitly disabled**

The `"security": false` configuration entirely disables the CDS security mechanism. No authorization checks are performed.

**Fix:**
Remove this option immediately. It must never be present in production:

```json
// ❌ .cdsrc.json
{
  "requires": {
    "security": false
  }
}
```

---

### `CAP_AUTH_MOCK` - HIGH

**`auth.kind` set to `dummy`, `mock`, or `basic`**

These authentication modes are designed for local development only. In production, they allow anyone to access the service without real authentication.

**Fix:**

```json
// ✅ Production
{
  "requires": {
    "auth": {
      "kind": "xsuaa"
    }
  }
}
```

---

### `CAP_PATH_TRAVERSAL` - HIGH

**File read with request-supplied input**

Using `req.body`, `req.params`, or `req.query` in a file path allows an attacker to read arbitrary server files.

**Fix:**

```js
// ❌ Dangerous
const content = await fs.readFile(req.params.filename);

// ✅ Safe
const filename = path.basename(req.params.filename); // removes ..
const safePath = path.join('/safe/uploads', filename);
if (!safePath.startsWith('/safe/uploads')) throw new Error('Invalid path');
const content = await fs.readFile(safePath);
```

---

### `CAP_EXPRESS_UNPROTECTED` - MEDIUM

**Raw Express route without authentication middleware**

An Express route registered directly without XSUAA or passport middleware bypasses CDS security.

**Fix:**

```js
// ❌ Dangerous
app.get('/internal/data', (req, res) => { ... });

// ✅ Safe
app.get('/internal/data', passport.authenticate('JWT', { session: false }), (req, res) => { ... });
```

---

### `XSUAA_ACCEPT_GRANTED` - HIGH

**`$ACCEPT_GRANTED_AUTHORITIES` in `xs-security.json`**

This setting makes the service accept all authorities from all bound apps without restriction, potentially granting unintended access.

**Fix:**
Replace with explicit scope references:

```json
{
  "foreign-scope-references": ["$XSSERVICENAME(myapp).myScope"]
}
```

---

## Secrets Scanner

Detects credentials, tokens, API keys, and passwords hardcoded in project files.

**Files analyzed:** all text files (excludes `node_modules`, `.git`, binary assets)

---

### `SECRET_PASSWORD` / `SECRET_DB_PASSWORD` / `SECRET_SMTP` - CRITICAL/HIGH

**Plaintext password in code**

A password detected in source code. Anyone with repository access can authenticate with this password.

**Fix:**
1. **Immediately revoke** the exposed password.
2. Store it in environment variables or BTP Credential Store:

```js
// ❌ Dangerous
const dbPassword = "MyP@ssw0rd123";

// ✅ Safe
const dbPassword = process.env.DB_PASSWORD;
// Or via VCAP_SERVICES on BTP (auto-injected by the platform)
```

---

### `SECRET_CLIENT_SECRET` / `SECRET_XSUAA` - CRITICAL

**OAuth2/XSUAA client secret in plaintext**

The XSUAA `clientsecret` allows anyone to authenticate as your application against XSUAA. Exposure compromises the entire authentication chain.

**Fix:**
1. Regenerate the XSUAA service key in the BTP cockpit.
2. Never use a service key in code - on BTP, `VCAP_SERVICES` is injected automatically by the platform.

---

### `SECRET_GITHUB_PAT` - CRITICAL

**GitHub Personal Access Token detected**

A GitHub PAT exposes access to repositories, packages, and potentially CI/CD pipelines.

**Fix:**
1. Immediately revoke the token at https://github.com/settings/tokens
2. Use GitHub Actions secrets or Azure Key Vault in pipelines.

---

### `SERVICE_KEY_COMMITTED` - CRITICAL

**`service-key.json` in the repository**

A service key file contains all credentials for a BTP service (XSUAA, HANA, etc.). Committing it to Git exposes your entire infrastructure.

**Fix:**
1. Remove the file from the repo: `git rm --cached service-key.json`
2. Add it to `.gitignore`
3. Regenerate all exposed service keys in the BTP cockpit
4. Purge the Git history if necessary: `git filter-branch` or BFG Repo Cleaner

---

### `DEFAULT_ENV_SECRETS` / `DEFAULT_ENV_COMMITTED` - CRITICAL/HIGH

**`default-env.json` committed**

This file contains local development credentials (often BTP service keys). It is designed to be ignored by Git.

**Fix:**

```bash
# .gitignore
default-env.json
default-env*.json
```

```bash
git rm --cached default-env.json
git commit -m "remove default-env.json from tracking"
```

---

### `NO_GITIGNORE` / `GITIGNORE_MISSING` - MEDIUM

**Sensitive files not excluded from Git**

A missing or incomplete `.gitignore` allows accidental commit of sensitive files.

**Fix:**
Ensure the following entries are in `.gitignore`:

```
default-env.json
default-env*.json
.env
*.env
service-key.json
*.key
private-key.pem
.cdsrc-private.json
```

---

### `PIPELINE_SECRET` - CRITICAL

**Hardcoded secret in a CI/CD file**

A secret in a GitHub Actions or Azure DevOps file is exposed to all repository contributors.

**Fix:**
Use native secrets mechanisms:

```yaml
# ✅ GitHub Actions
- name: Deploy
  env:
    CF_PASSWORD: ${{ secrets.CF_PASSWORD }}
  run: cf login -p "$CF_PASSWORD"
```

---

## BTP Destinations Scanner

Analyzes SAP BTP destination configurations and XSUAA security settings.

**Files analyzed:** `*destination*.json`, `*dest*.json`, `xs-security.json`, `mta.yaml`

---

### `BTP_NO_AUTH` / `BTP_MTA_NO_AUTH` - HIGH

**Destination with no authentication**

A BTP destination with `Authentication: NoAuthentication` forwards requests to the backend without any authentication token.

**Fix:**
Use an appropriate authentication method:
- `OAuth2ClientCredentials` for service-to-service calls
- `OAuth2UserTokenExchange` for user-on-behalf-of calls
- `SAMLAssertion` for SAP on-premise systems

---

### `BTP_TRUST_ALL` - HIGH

**`TrustAll: true` - TLS verification disabled**

Disabling TLS certificate verification allows Man-in-the-Middle attacks: an attacker can intercept and modify traffic.

**Fix:**
Remove `TrustAll: true`. Import the trust certificate into the BTP Trust Store if needed.

---

### `BTP_DEST_PASSWORD` / `BTP_DEST_CLIENT_SECRET` - CRITICAL

**Credentials hardcoded in the destination**

A password or client secret stored directly in the destination file is exposed to anyone with access to the file.

**Fix:**
On BTP, use the Credential Store or configure destinations via the BTP cockpit without storing credentials in versioned files.

---

### `XSUAA_REDIRECT_LOCALHOST` - MEDIUM

**Redirect URI with `localhost` or HTTP**

A redirect URI pointing to `localhost` or using HTTP must not be present in production - it enables OAuth2 token theft attacks.

**Fix:**

```json
// xs-security.json
{
  "oauth2-configuration": {
    "redirect-uris": [
      "https://my-app.cfapps.eu10.hana.ondemand.com/**"
    ]
  }
}
```

---

### `XSUAA_LONG_TOKEN` - MEDIUM

**Token validity > 12 hours**

A token with a long validity period remains exploitable long after a user has left or an access has been revoked.

**Fix:**

```json
{
  "oauth2-configuration": {
    "token-validity": 43200
  }
}
```

---

## AppRouter Security Scanner

Comprehensive analysis of the SAP AppRouter configuration.

**Files analyzed:** `xs-app.json`, `package.json`, `mta.yaml`

---

### `AR_AUTH_NONE_GLOBAL` - HIGH

**`authenticationMethod: "none"` globally set**

All routes are public. Anyone can access the application without authenticating.

**Fix:**

```json
// xs-app.json
{
  "authenticationMethod": "route",
  "routes": [
    {
      "source": "^/api/(.*)",
      "destination": "backend",
      "authenticationType": "xsuaa"
    }
  ]
}
```

---

### `AR_CSRF_DISABLED` - HIGH

**CSRF disabled in `xs-app.json`**

CSRF protection prevents forged requests from third-party sites. Disabling it exposes all state-changing operations (POST, PUT, DELETE) to CSRF attacks.

**Fix:**
Remove `"csrfProtection": false` or set it to `true`. The AppRouter enables CSRF by default.

---

### `AR_WILDCARD_ROUTE_NO_AUTH` - CRITICAL

**Catch-all route with no authentication**

A route `source: "^(.*)$"` without authentication makes all application content public.

**Fix:**

```json
{
  "routes": [
    {
      "source": "^(.*)$",
      "localDir": ".",
      "authenticationType": "xsuaa"
    }
  ]
}
```

---

### `AR_MISSING_CSP` - HIGH

**`Content-Security-Policy` not configured**

Without CSP, the browser accepts scripts from any origin, facilitating XSS attacks.

**Fix:**

```json
// xs-app.json
{
  "httpHeaders": [
    {
      "Content-Security-Policy": "default-src 'self'; script-src 'self' https://ui5.sap.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none';"
    }
  ]
}
```

---

### `AR_MISSING_HSTS` - MEDIUM

**Strict-Transport-Security (HSTS) missing**

Without HSTS, the browser may attempt an initial HTTP connection, exposing the user to an HTTPS downgrade attack.

**Fix:**

```json
{
  "httpHeaders": [
    {
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains"
    }
  ]
}
```

---

### `AR_CSP_UNSAFE_INLINE` / `AR_CSP_UNSAFE_EVAL` - HIGH

**CSP with `'unsafe-inline'` or `'unsafe-eval'`**

These directives undermine XSS protection: `unsafe-inline` allows all inline scripts, `unsafe-eval` allows `eval()`.

**Fix:**
Replace `unsafe-inline` with nonces or hashes:

```json
{
  "Content-Security-Policy": "script-src 'self' 'nonce-{random}';"
}
```

For SAPUI5, SAP provides a CSP compatibility guide: https://ui5.sap.com/sdk/#/topic/fe1a6dba940e479fb7c3bc753f92b28c

---

### `AR_JWT_TRUST_WILDCARD` - CRITICAL

**`SAP_JWT_TRUST_ACL` with `clientid: "*"`**

This configuration trusts JWT tokens from **any** OAuth2 client, allowing a third-party application to impersonate your application.

**Fix:**
Replace the wildcard with explicit allowed client IDs:

```yaml
# mta.yaml
env:
  SAP_JWT_TRUST_ACL: '[{"clientid":"sb-myapp!t123","identityzone":"my-subaccount"}]'
```

---

### `AR_OUTDATED_VERSION` - HIGH

**`@sap/approuter` < 14.0.0**

Earlier versions contain known vulnerabilities, including CVE-2022-41271 (log injection, patched from 12.0.0).

**Fix:**

```bash
npm install @sap/approuter@latest
```

---

### `AR_MTA_NO_XSUAA` - HIGH

**AppRouter module without XSUAA binding**

Without a bound XSUAA service, the AppRouter cannot validate JWT tokens or manage authentication.

**Fix:**

```yaml
# mta.yaml
modules:
  - name: my-approuter
    type: approuter.nodejs
    requires:
      - name: my-xsuaa-service  # ← required
      - name: my-destination-service

resources:
  - name: my-xsuaa-service
    type: org.cloudfoundry.managed-service
    parameters:
      service: xsuaa
      service-plan: application
```

---

### `AR_XFO_DISABLED` - HIGH

**`SEND_XFRAMEOPTIONS: false` in AppRouter environment**

Disabling the `X-Frame-Options` header allows any site to embed the application in an iframe, enabling clickjacking attacks.

**Fix:**
Remove `SEND_XFRAMEOPTIONS: false` from `mta.yaml`, or explicitly configure `X-Frame-Options: DENY` via `httpHeaders` in `xs-app.json`.
