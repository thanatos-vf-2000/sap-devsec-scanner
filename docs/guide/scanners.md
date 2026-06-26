# Référence des Scanners

SAP DevSec Scanner embarque **6 scanners spécialisés** qui s'activent automatiquement selon le type de projet détecté.

Cette page récapitule tous les scanners disponibles, les fichiers qu'ils analysent, et tous les codes d'erreur avec leur explication et comment les corriger.

## Vue d'ensemble

| Scanner | Fichiers analysés | Codes d'erreur |
|---|---|---|
| [UI5 Version](#ui5-version-scanner) | `manifest.json`, `ui5.yaml`, `package.json` | 8 |
| [UI5 Code](#ui5-code-scanner) | `*.js`, `*.ts`, `*.jsx`, `*.tsx` | 30+ |
| [NPM Security](#npm-security-scanner) | `package.json` | 11 |
| [CAP Security](#cap-security-scanner) | `*.cds`, `*.js`, `*.ts`, `mta.yaml`, `xs-security.json` | 21 |
| [Secrets](#secrets-scanner) | Tous les fichiers texte | 22 |
| [BTP Destinations](#btp-destinations-scanner) | `*destination*.json`, `xs-security.json`, `mta.yaml` | 18 |
| [AppRouter](#approuter-security-scanner) | `xs-app.json`, `package.json`, `mta.yaml` | 25 |

---

## UI5 Version Scanner

Détecte la version SAPUI5 déclarée dans votre projet et la compare au tableau officiel des versions maintenues par SAP. Il signale les versions en fin de vie, les versions obsolètes et les mauvaises configurations de manifest.

**Fichiers analysés :** `manifest.json`, `ui5.yaml`, `package.json`

---

### `UI5_UNSUPPORTED` - CRITICAL

**Version UI5 inconnue ou non supportée**

La version SAPUI5 détectée ne figure pas dans le tableau des versions officiellement maintenues par SAP.

**Correction :**
Migrez vers une version LTS maintenue. La version LTS recommandée est `1.136.x` (support jusqu'en Q4/2032). Consultez le [tableau officiel](https://ui5.sap.com/versionoverview.html) pour choisir la bonne version.

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

**Version UI5 en fin de maintenance (End of Maintenance)**

La version SAPUI5 utilisée n'est plus maintenue par SAP. Elle ne reçoit plus de correctifs de sécurité.

**Correction :**
Mettez à jour vers une version LTS activement maintenue. Privilégiez `1.136.x` ou `1.120.x`.

```yaml
# ui5.yaml
framework:
  name: SAPUI5
  version: "1.136.19"
```

---

### `UI5_NOT_LTS` - MEDIUM

**Version maintenue mais pas LTS**

La version UI5 est encore maintenue mais n'est pas une version LTS (Long-Term Support). Elle aura une durée de support plus courte.

**Correction :**
Considérez une migration vers une version LTS pour bénéficier d'un support prolongé et d'une meilleure stabilité. Versions LTS actuelles : `1.136`, `1.120`, `1.108`, `1.96`, `1.71`, `1.38`.

---

### `UI5_OUTDATED` - MEDIUM

**Version trop ancienne par rapport à la dernière version**

La version détectée est plus de 10 versions mineures derrière la dernière version disponible.

**Correction :**
Planifiez une mise à jour. Consultez le [guide de migration UI5](https://ui5.sap.com/sdk/#/topic/upgrading).

---

### `UI5_NOT_DETECTED` - INFO

**Aucune version UI5 détectée**

Le scanner n'a trouvé aucune déclaration de version UI5 dans `manifest.json`, `ui5.yaml` ou `package.json`. Le projet n'est peut-être pas un projet UI5/Fiori.

**Correction :**
Si c'est un projet UI5, vérifiez que le `manifest.json` contient bien la section `sap.ui5.dependencies.minUI5Version`.

---

### `UI5_NO_CSP` - MEDIUM

**Pas de Content-Security-Policy dans manifest.json**

La section `sap.ui5` du `manifest.json` ne définit pas de politique CSP ni de `frame-options`. Sans CSP, l'application est plus vulnérable aux attaques XSS.

**Correction :**
Configurez la CSP au niveau de l'AppRouter via `httpHeaders` dans `xs-app.json` (approche recommandée) :

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

**`allowed-cors-origins` avec wildcard `*`**

La configuration `sap.ui5.allowed-cors-origins` autorise les requêtes cross-origin depuis n'importe quelle origine, ce qui expose l'application à des attaques CSRF et à des fuites de données.

**Correction :**
Restreignez aux origines connues et de confiance :

```json
{
  "sap.ui5": {
    "allowed-cors-origins": "https://my-app.cfapps.eu10.hana.ondemand.com"
  }
}
```

---

### `UI5_DEFAULT_VERSION` - INFO

**Version applicative à `1.0.0` (valeur par défaut)**

La version de l'application (`sap.app.applicationVersion.version`) est encore à `1.0.0`, valeur par défaut qui empêche le cache-busting correct lors des déploiements.

**Correction :**
Mettez à jour la version à chaque déploiement :

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

Analyse statique des fichiers JavaScript et TypeScript à la recherche de patterns dangereux : XSS, injection de code, open redirect, mauvaises pratiques OWASP et SAP-spécifiques.

**Fichiers analysés :** `*.js`, `*.ts`, `*.jsx`, `*.tsx` (hors `node_modules` et fichiers minifiés)

---

### `UI5_EVAL` - CRITICAL

**Utilisation de `eval()`**

`eval()` exécute du code JavaScript arbitraire à partir d'une chaîne, ce qui constitue un vecteur d'injection de code majeur.

**Correction :**
Remplacez `eval()` par des alternatives sûres. Si vous devez parser du JSON, utilisez `JSON.parse()`. Si vous devez appeler des fonctions dynamiquement, utilisez un objet de mapping.

```js
// ❌ Dangereux
eval(userInput);

// ✅ Sûr
const fn = { myFunc: () => {} };
fn['myFunc']();
```

---

### `UI5_XSS_INNERHTML` - HIGH

**Assignation directe à `innerHTML`**

L'assignation de contenu non sanitizé à `innerHTML` est le vecteur XSS le plus courant dans les applications web.

**Correction :**
Utilisez `textContent` pour du texte brut, ou les fonctions d'encodage SAP pour du HTML :

```js
// ❌ Dangereux
element.innerHTML = userInput;

// ✅ Sûr (texte)
element.textContent = userInput;

// ✅ Sûr (HTML encodé)
const encoded = sap.base.security.encodeXML(userInput);
element.innerHTML = encoded;
```

---

### `UI5_XSS_OUTERHTML` - HIGH

**Utilisation de `outerHTML`**

`outerHTML` remplace l'élément entier avec du HTML brut. Si ce HTML provient d'une entrée utilisateur, c'est un vecteur XSS.

**Correction :**
Évitez `outerHTML` avec des données non sanitizées. Reconstruisez l'élément via l'API DOM.

---

### `UI5_XSS_HTML_CONTROL` - HIGH

**`sap.ui.core.HTML` avec contenu dynamique**

Le contrôle `sap.ui.core.HTML` insère du HTML brut dans le DOM. L'utilisation de contenu dynamique non sanitizé crée une vulnérabilité XSS.

**Correction :**
Sanitizez le contenu HTML avant de l'injecter, ou utilisez `sanitizeContent: true` :

```js
new sap.ui.core.HTML({
  content: "<div>" + sap.base.security.encodeXML(userInput) + "</div>",
  sanitizeContent: true
});
```

---

### `UI5_DOCUMENT_WRITE` - HIGH

**Utilisation de `document.write()`**

`document.write()` réécrit le document entier et peut injecter des scripts si le contenu provient d'une source non fiable.

**Correction :**
Utilisez les méthodes DOM modernes :

```js
// ❌ Dangereux
document.write('<script src="' + url + '"></script>');

// ✅ Sûr
const script = document.createElement('script');
script.src = trustedUrl; // URL validée statiquement
document.head.appendChild(script);
```

---

### `UI5_NEW_FUNCTION` - HIGH

**Constructeur `new Function()`**

`new Function()` crée une fonction à partir d'une chaîne, équivalent à `eval()` - même risque d'injection de code.

**Correction :**
Remplacez par une fonction définie statiquement ou un objet de mapping de fonctions.

---

### `UI5_XMLVIEW_TEMPLATE` - HIGH

**`XMLView.create` avec template literal**

`XMLView.create` avec une définition construite via un template literal permet d'injecter des balises XML/HTML arbitraires si des données utilisateur sont interpolées.

**Correction :**
Ne construisez jamais une définition de vue dynamiquement avec des données utilisateur. Utilisez des vues statiques et des bindings de modèle.

---

### `UI5_DEPRECATED_COMMONS` - HIGH

**Utilisation de `sap.ui.commons.*`**

La bibliothèque `sap.ui.commons` est dépréciée et ne reçoit plus de mises à jour de sécurité. Elle peut contenir des vulnérabilités non corrigées.

**Correction :**
Migrez vers `sap.m.*` ou `sap.f.*` :

```js
// ❌ Déprécié
new sap.ui.commons.Button({ text: "OK" });

// ✅ Actuel
new sap.m.Button({ text: "OK" });
```

---

### `UI5_OPEN_REDIRECT` - HIGH

**`window.location` dynamique**

Assigner une valeur dynamique à `window.location` sans validation peut permettre une attaque d'open redirect : un attaquant redirige les utilisateurs vers un site malveillant.

**Correction :**
Validez l'URL par rapport à une liste blanche avant toute redirection :

```js
// ❌ Dangereux
window.location = userInput;

// ✅ Sûr
const ALLOWED_PATHS = ['/home', '/dashboard'];
if (ALLOWED_PATHS.includes(path)) {
  window.location = path;
}
```

---

### `REDIRECT_LOCATION` / `REDIRECT_LOCATION_HREF` / `REDIRECT_OPEN` - MEDIUM

**Redirection vers URL dynamique**

`window.location`, `window.location.href` ou `window.open()` utilisés avec une URL construite dynamiquement exposent à un open redirect.

**Correction :**
Validez toujours l'URL de destination contre une liste blanche. Pour les URL externes, n'utilisez jamais directement `window.open(userInput)`.

---

### `UI5_SENSITIVE_LOG` / `SENSITIVE_DATA_CONSOLE` - MEDIUM/LOW

**Log de données sensibles**

Des données sensibles (password, token, key, auth…) sont journalisées via `console.log/debug/info`. En production, ces logs peuvent être capturés par des systèmes de monitoring et exposer des credentials.

**Correction :**
Ne loggez jamais de données sensibles. Utilisez des variables de masquage ou supprimez les logs en production :

```js
// ❌ Dangereux
console.log("Token:", authToken);

// ✅ Sûr
console.log("Authentification effectuée pour l'utilisateur:", userId);
```

---

### `UI5_LOCALSTORAGE_UNENCRYPTED` / `SENSITIVE_DATA_LOCAL` / `SENSITIVE_DATA_SESSION` - LOW

**Stockage de données sensibles dans localStorage/sessionStorage**

`localStorage` et `sessionStorage` sont accessibles via JavaScript - tout script XSS peut les lire. Ne jamais y stocker des secrets, tokens ou mots de passe.

**Correction :**
Stockez les tokens dans des cookies `HttpOnly` gérés par le serveur. Si vous devez utiliser le stockage Web, ne jamais y mettre de secrets.

---

### `UI5_SET_TIMEOUT` / `UI5_SET_INTERVAL` - MEDIUM

**Passage d'une chaîne à `setTimeout`/`setInterval`**

Passer une chaîne de caractères à `setTimeout` ou `setInterval` est équivalent à appeler `eval()` sur cette chaîne.

**Correction :**

```js
// ❌ Dangereux
setTimeout("myFunction()", 1000);

// ✅ Sûr
setTimeout(myFunction, 1000);
setTimeout(() => myFunction(), 1000);
```

---

### `UI5_DYNAMIC_FRAGMENT` - MEDIUM

**Nom de fragment dynamique dans `Fragment.load`**

Si le nom du fragment est construit à partir d'une entrée utilisateur, un attaquant pourrait charger un fragment inattendu (injection de module).

**Correction :**
N'utilisez que des noms de fragments statiques ou provenant d'une source de confiance :

```js
// ❌ Risqué
Fragment.load({ name: userInput + ".Dialog" });

// ✅ Sûr
Fragment.load({ name: "com.myapp.view.Dialog" });
```

---

### `SAP_DEPRECATED_JQUERY_SAP` - LOW

**APIs `jQuery.sap.*` dépréciées**

Les APIs `jQuery.sap.*` sont dépréciées depuis UI5 1.58 et ne reçoivent plus de mises à jour de sécurité.

**Correction :**
Migrez vers les équivalents modernes :

| Déprécié | Remplaçant |
|---|---|
| `jQuery.sap.log` | `sap/base/Log` |
| `jQuery.sap.encodeHTML` | `sap/base/security/encodeXML` |
| `jQuery.sap.resources` | `sap/base/i18n/ResourceBundle` |

---

### `SAP_POSTMESSAGE_NOCHECK` - MEDIUM

**Listener `postMessage` sans validation d'origine**

Un listener `window.addEventListener('message', ...)` sans vérification de `event.origin` peut traiter des messages provenant de n'importe quelle fenêtre, y compris des sites malveillants.

**Correction :**

```js
window.addEventListener('message', (event) => {
  // ✅ Toujours vérifier l'origine
  if (event.origin !== 'https://trusted-app.example.com') return;
  
  // Traiter le message
});
```

---

### `SAP_FORMATTER_CONCAT` - MEDIUM

**Concaténation de chaîne dans un formatter - risque XSS**

Une concaténation de données utilisateur dans un formatter retournant du HTML peut créer une vulnérabilité XSS si le résultat est affiché dans un contrôle HTML.

**Correction :**

```js
// ❌ Risqué
return "<b>" + value + "</b>";

// ✅ Sûr
return "<b>" + encodeXML(value) + "</b>";
// Ou mieux, utiliser du texte uniquement :
return value;
```

---

### `OWASP_CHILD_PROCESS` - CRITICAL

**`child_process.exec/spawn` avec entrée utilisateur**

Exécuter une commande système avec des données provenant d'une requête permet une injection de commande (RCE - Remote Code Execution).

**Correction :**
Ne jamais passer de données utilisateur à `exec`, `spawn` ou `execSync`. Utilisez `spawn` avec un tableau d'arguments (pas de shell) :

```js
// ❌ Dangereux
exec(`convert ${req.body.filename} output.pdf`);

// ✅ Sûr
spawn('convert', [sanitizedFilename, 'output.pdf'], { shell: false });
```

---

### `OWASP_FS` - HIGH

**Accès filesystem avec entrée utilisateur**

Utiliser des données de la requête dans des chemins de fichiers permet un path traversal (`../../etc/passwd`).

**Correction :**

```js
// ❌ Dangereux
fs.readFile(req.params.file, cb);

// ✅ Sûr
const safePath = path.join('/safe/dir', path.basename(req.params.file));
if (!safePath.startsWith('/safe/dir')) throw new Error('Invalid path');
fs.readFile(safePath, cb);
```

---

## NPM Security Scanner

Analyse les dépendances npm à la recherche de CVE connus dans les packages SAP et tiers, et vérifie les bonnes pratiques de gestion des dépendances.

**Fichiers analysés :** `package.json` (hors `node_modules`)

---

### CVE connus - HIGH/MEDIUM

Pour chaque CVE détecté, la correction consiste à mettre à jour le package vers la version minimale indiquée :

| CVE | Package | Version minimale | Commande |
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

**Version non épinglée (`*` ou `latest`)**

L'utilisation de `*` ou `latest` crée des builds non déterministes : la version installée peut changer sans avertissement et introduire une régression ou une vulnérabilité.

**Correction :**
Épinglez les versions dans `package.json` et committez le `package-lock.json` :

```json
{
  "dependencies": {
    "@sap/cds": "7.9.0"
  }
}
```

---

### `FORBIDDEN_IN_PROD` - LOW

**Package de développement en dépendance de production**

Des packages comme `nodemon`, `jest`, `mocha`, `@sap/cds-dk` sont en `dependencies` au lieu de `devDependencies`. Cela alourdit le bundle de production et peut exposer des fonctionnalités de debug.

**Correction :**
Déplacez-les dans `devDependencies` :

```bash
npm install --save-dev nodemon jest @sap/cds-dk
```

---

### `RECOMMENDED_PACKAGES` - INFO

**Packages sécurité recommandés absents**

Les packages suivants sont recommandés par SAP pour les applications BTP en production :

| Package | Rôle |
|---|---|
| `helmet` | Headers HTTP sécurisés (CSP, HSTS, X-Frame-Options…) |
| `@sap/xssec` | Validation JWT / XSUAA obligatoire |
| `@sap/audit-logging` | Audit log RGPD obligatoire sur BTP |

**Correction :**

```bash
npm install helmet @sap/xssec @sap/audit-logging
```

---

### `MISSING_ENGINES` - LOW

**Pas de champ `engines.node`**

Sans épinglage de la version Node.js, l'application peut se comporter différemment selon l'environnement (dev, CI, prod).

**Correction :**

```json
{
  "engines": {
    "node": ">=23.0.0"
  }
}
```

---

### `NPM_SCRIPT` - MEDIUM

**Hook npm lifecycle (`preinstall`, `postinstall`, `prepare`)**

Ces hooks s'exécutent automatiquement lors de `npm install`. Des dépendances malveillantes peuvent les utiliser pour exécuter du code arbitraire (attaque supply chain).

**Correction :**
Revoyez les scripts définis et assurez-vous qu'ils sont légitimes. Utilisez `npm install --ignore-scripts` si possible dans les pipelines CI.

---

### `NO_LOCK_FILE` - LOW

**Pas de fichier lock**

Sans `package-lock.json` ou `yarn.lock`, les dépendances ne sont pas déterministes. Des versions différentes peuvent être installées en dev et en production.

**Correction :**

```bash
npm install  # génère package-lock.json
git add package-lock.json
git commit -m "chore: add package-lock.json"
```

---

## CAP Security Scanner

Analyse les services CDS, les handlers JavaScript, `mta.yaml`, `xs-security.json` et `.cdsrc.json` pour détecter les problèmes de contrôle d'accès et d'injection dans les projets CAP.

**Fichiers analysés :** `*.cds`, `*.js`, `*.ts`, `mta.yaml`, `xs-security.json`, `.cdsrc.json`

---

### `CDS_NO_AUTH` - HIGH

**Service CDS sans `@requires` ou `@restrict`**

Un service CDS sans annotation d'autorisation est accessible à tous les utilisateurs non authentifiés si le service est publiquement exposé.

**Correction :**
Ajoutez `@requires` ou `@restrict` à chaque service :

```cds
// ❌ Dangereux - accessible sans auth
service OrderService {
  entity Orders as projection on db.Orders;
}

// ✅ Sûr
@requires: 'authenticated-user'
service OrderService {
  entity Orders as projection on db.Orders;
  
  @restrict: [{ grant: 'READ', to: 'Viewer' }, { grant: 'WRITE', to: 'Editor' }]
  entity Orders as projection on db.Orders;
}
```

---

### `CDS_OPEN_SERVICE` - HIGH

**Service annoté `@open`**

L'annotation `@open` désactive le modèle d'autorisation strict de CDS et rend le service accessible sans restriction.

**Correction :**
Supprimez `@open` et remplacez par des annotations `@requires` / `@restrict` appropriées. N'utilisez `@open` que pour des prototypes locaux.

---

### `CAP_SQL_INJECTION` - CRITICAL

**Injection SQL via template literal dans `cds.run()`**

Construire une requête SQL avec un template literal interpolant des données utilisateur crée une vulnérabilité d'injection SQL critique.

**Correction :**
Utilisez toujours les APIs CDS fluentes ou des requêtes paramétrées :

```js
// ❌ Dangereux
await cds.run(`SELECT * FROM Orders WHERE id = ${req.data.id}`);

// ✅ Sûr
await SELECT.from('Orders').where({ id: req.data.id });
// ou
await cds.run(SELECT.from('Orders').where({ id: req.data.id }));
```

---

### `CAP_DIRECT_HANA` - HIGH

**Client HANA direct utilisé**

L'utilisation directe du client `hdb` ou `@sap/hana-client` contourne complètement la couche d'autorisation CDS. Aucun contrôle d'accès automatique n'est appliqué.

**Correction :**
Utilisez les APIs CDS (`SELECT`, `INSERT`, `cds.run()`) qui appliquent automatiquement les annotations `@restrict`. Si le client direct est indispensable, implémentez des vérifications d'autorisation manuelles explicites.

---

### `CAP_SECURITY_DISABLED` - CRITICAL

**Sécurité CDS explicitement désactivée**

La configuration `"security": false` désactive entièrement le mécanisme de sécurité CDS. Aucune vérification d'autorisation n'est effectuée.

**Correction :**
Supprimez cette option immédiatement. Elle ne doit jamais être présente en production :

```json
// ❌ cdsrc.json
{
  "requires": {
    "security": false
  }
}
```

---

### `CAP_AUTH_MOCK` - HIGH

**`auth.kind` en mode `dummy`, `mock` ou `basic`**

Ces modes d'authentification sont conçus uniquement pour le développement local. En production, ils permettent à n'importe qui d'accéder au service sans authentification réelle.

**Correction :**

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

**Lecture de fichier avec entrée de la requête**

Utiliser `req.body`, `req.params` ou `req.query` dans un chemin de fichier permet à un attaquant de lire des fichiers arbitraires du serveur.

**Correction :**

```js
// ❌ Dangereux
const content = await fs.readFile(req.params.filename);

// ✅ Sûr
const filename = path.basename(req.params.filename); // retire les ..
const safePath = path.join('/safe/uploads', filename);
if (!safePath.startsWith('/safe/uploads')) throw new Error('Invalid');
const content = await fs.readFile(safePath);
```

---

### `CAP_EXPRESS_UNPROTECTED` - MEDIUM

**Route Express brute sans middleware d'authentification**

Une route Express enregistrée directement sans middleware XSUAA ou passport contourne la sécurité CDS.

**Correction :**

```js
// ❌ Dangereux
app.get('/internal/data', (req, res) => { ... });

// ✅ Sûr
const xsuaa = require('@sap/xssec');
app.get('/internal/data', passport.authenticate('JWT', { session: false }), (req, res) => { ... });
```

---

### `XSUAA_ACCEPT_GRANTED` - HIGH

**`$ACCEPT_GRANTED_AUTHORITIES` dans `xs-security.json`**

Cette configuration fait que le service accepte toutes les autorités de toutes les applications liées, sans restriction. Cela peut accorder des accès non intentionnels.

**Correction :**
Remplacez par des références de scope explicites :

```json
{
  "foreign-scope-references": ["$XSSERVICENAME(myapp).myScope"]
}
```

---

## Secrets Scanner

Détecte les credentials, tokens, clés API et mots de passe codés en dur dans les fichiers du projet.

**Fichiers analysés :** tous les fichiers texte (hors `node_modules`, `.git`, assets binaires)

---

### `SECRET_PASSWORD` / `SECRET_DB_PASSWORD` / `SECRET_SMTP` - CRITICAL/HIGH

**Mot de passe en clair dans le code**

Un mot de passe détecté dans le code source. Quiconque a accès au dépôt peut s'authentifier avec ce mot de passe.

**Correction :**
1. **Révoquez immédiatement** le mot de passe exposé.
2. Stockez-le dans les variables d'environnement ou dans les services de secrets BTP (Credential Store) :

```js
// ❌ Dangereux
const dbPassword = "MyP@ssw0rd123";

// ✅ Sûr
const dbPassword = process.env.DB_PASSWORD;
// ou via VCAP_SERVICES sur BTP (injection automatique)
```

---

### `SECRET_CLIENT_SECRET` / `SECRET_XSUAA` - CRITICAL

**Client secret OAuth2 / XSUAA en clair**

Le `clientsecret` XSUAA permet à quiconque de s'authentifier comme votre application auprès de XSUAA. Une exposition compromet toute la chaîne d'authentification.

**Correction :**
1. Régénérez le service key XSUAA dans le cockpit BTP.
2. N'utilisez jamais de service key dans le code - sur BTP, VCAP_SERVICES est injecté automatiquement par la plateforme.

---

### `SECRET_GITHUB_PAT` - CRITICAL

**Personal Access Token GitHub détecté**

Un PAT GitHub expose l'accès aux dépôts, aux packages et potentiellement aux pipelines CI/CD.

**Correction :**
1. Révoquez immédiatement le token sur https://github.com/settings/tokens
2. Utilisez les secrets GitHub Actions ou Azure Key Vault dans les pipelines.

---

### `SERVICE_KEY_COMMITTED` - CRITICAL

**`service-key.json` dans le dépôt**

Un fichier de service key contient toutes les credentials d'un service BTP (XSUAA, HANA, etc.). Son commit dans Git expose l'ensemble de l'infrastructure.

**Correction :**
1. Supprimez le fichier du dépôt : `git rm --cached service-key.json`
2. Ajoutez-le au `.gitignore`
3. Régénérez toutes les service keys exposées dans le cockpit BTP
4. Purgez l'historique Git si nécessaire : `git filter-branch` ou BFG Repo Cleaner

---

### `DEFAULT_ENV_SECRETS` / `DEFAULT_ENV_COMMITTED` - CRITICAL/HIGH

**`default-env.json` committée**

Ce fichier contient les credentials locaux de développement (souvent des service keys BTP). Il est conçu pour être ignoré par Git.

**Correction :**

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

**Fichiers sensibles non exclus de Git**

Un `.gitignore` manquant ou incomplet permet l'ajout accidentel de fichiers sensibles au dépôt.

**Correction :**
Assurez-vous que les entrées suivantes sont dans `.gitignore` :

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

**Secret codé en dur dans un fichier CI/CD**

Un secret dans un fichier GitHub Actions ou Azure DevOps est exposé à tous les contributeurs du dépôt.

**Correction :**
Utilisez les mécanismes de secrets natifs :

```yaml
# ✅ GitHub Actions
- name: Deploy
  env:
    CF_PASSWORD: ${{ secrets.CF_PASSWORD }}
  run: cf login -p "$CF_PASSWORD"
```

---

## BTP Destinations Scanner

Analyse les configurations de destinations SAP BTP et la sécurité XSUAA.

**Fichiers analysés :** `*destination*.json`, `*dest*.json`, `xs-security.json`, `mta.yaml`

---

### `BTP_NO_AUTH` / `BTP_MTA_NO_AUTH` - HIGH

**Destination sans authentification**

Une destination BTP avec `Authentication: NoAuthentication` transmet les requêtes sans aucun token d'authentification au backend.

**Correction :**
Utilisez une méthode d'authentification appropriée :
- `OAuth2ClientCredentials` pour les appels service-to-service
- `OAuth2UserTokenExchange` pour les appels en nom d'utilisateur
- `SAMLAssertion` pour les systèmes SAP on-premise

---

### `BTP_TRUST_ALL` - HIGH

**`TrustAll: true` - vérification TLS désactivée**

La désactivation de la vérification du certificat TLS permet les attaques Man-in-the-Middle : un attaquant peut intercepter et modifier le trafic.

**Correction :**
Supprimez `TrustAll: true`. Importez le certificat de confiance dans le Trust Store BTP si nécessaire.

---

### `BTP_DEST_PASSWORD` / `BTP_DEST_CLIENT_SECRET` - CRITICAL

**Credentials en dur dans la destination**

Un mot de passe ou un client secret stocké directement dans le fichier de destination est exposé à toute personne ayant accès au fichier.

**Correction :**
Sur BTP, utilisez le Credential Store ou configurez les destinations via le cockpit BTP sans stocker les credentials dans des fichiers versionés.

---

### `XSUAA_REDIRECT_LOCALHOST` - MEDIUM

**URI de redirection avec `localhost` ou HTTP**

Une URI de redirection pointant vers `localhost` ou utilisant HTTP ne doit pas être présente en production - elle permet des attaques de vol de token OAuth2.

**Correction :**

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

**Validité du token > 12 heures**

Un token avec une longue durée de validité reste exploitable longtemps après qu'un utilisateur a quitté ou qu'un accès a été révoqué.

**Correction :**

```json
{
  "oauth2-configuration": {
    "token-validity": 43200
  }
}
```

---

## AppRouter Security Scanner

Analyse complète de la configuration SAP AppRouter.

**Fichiers analysés :** `xs-app.json`, `package.json`, `mta.yaml`

---

### `AR_AUTH_NONE_GLOBAL` - HIGH

**`authenticationMethod: "none"` global**

Toutes les routes sont publiques. N'importe qui peut accéder à l'application sans s'authentifier.

**Correction :**

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

**CSRF désactivé dans `xs-app.json`**

La protection CSRF empêche les requêtes forgées depuis des sites tiers. La désactiver expose toutes les mutations (POST, PUT, DELETE) aux attaques CSRF.

**Correction :**
Supprimez `"csrfProtection": false` ou passez-le à `true`. L'AppRouter active le CSRF par défaut.

---

### `AR_WILDCARD_ROUTE_NO_AUTH` - CRITICAL

**Route catch-all sans authentification**

Une route `source: "^(.*)$"` sans authentification rend tout le contenu de l'application public.

**Correction :**

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

**`Content-Security-Policy` non configuré**

Sans CSP, le navigateur accepte des scripts depuis n'importe quelle origine, ce qui facilite les attaques XSS.

**Correction :**

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

**Strict-Transport-Security (HSTS) absent**

Sans HSTS, le navigateur peut tenter une connexion HTTP initiale, exposant l'utilisateur à un downgrade HTTPS.

**Correction :**

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

**CSP avec `'unsafe-inline'` ou `'unsafe-eval'`**

Ces directives annulent la protection XSS de la CSP : `unsafe-inline` autorise tous les scripts inline, `unsafe-eval` autorise `eval()`.

**Correction :**
Remplacez `unsafe-inline` par des nonces ou des hashes :

```json
{
  "Content-Security-Policy": "script-src 'self' 'nonce-{random}';"
}
```

Pour SAPUI5, SAP fournit un guide de compatibilité CSP : https://ui5.sap.com/sdk/#/topic/fe1a6dba940e479fb7c3bc753f92b28c

---

### `AR_JWT_TRUST_WILDCARD` - CRITICAL

**`SAP_JWT_TRUST_ACL` avec `clientid: "*"`**

Cette configuration fait confiance aux tokens JWT de **n'importe quel** client OAuth2, permettant à une application tierce de se faire passer pour votre application.

**Correction :**
Remplacez le wildcard par les IDs de clients autorisés explicites :

```yaml
# mta.yaml
env:
  SAP_JWT_TRUST_ACL: '[{"clientid":"sb-myapp!t123","identityzone":"my-subaccount"}]'
```

---

### `AR_OUTDATED_VERSION` - HIGH

**`@sap/approuter` < 14.0.0**

Les versions antérieures contiennent des vulnérabilités connues, notamment CVE-2022-41271 (log injection, patchée à partir de 12.0.0).

**Correction :**

```bash
npm install @sap/approuter@latest
```

---

### `AR_MTA_NO_XSUAA` - HIGH

**Module AppRouter sans binding XSUAA**

Sans service XSUAA lié, l'AppRouter ne peut pas valider les tokens JWT ni gérer l'authentification.

**Correction :**

```yaml
# mta.yaml
modules:
  - name: my-approuter
    type: approuter.nodejs
    requires:
      - name: my-xsuaa-service  # ← obligatoire
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

**`SEND_XFRAMEOPTIONS: false` dans l'environnement AppRouter**

Désactiver le header `X-Frame-Options` permet à n'importe quel site d'intégrer l'application dans une iframe, facilitant le clickjacking.

**Correction :**
Supprimez `SEND_XFRAMEOPTIONS: false` du `mta.yaml`, ou configurez explicitement `X-Frame-Options: DENY` via `httpHeaders` dans `xs-app.json`.
