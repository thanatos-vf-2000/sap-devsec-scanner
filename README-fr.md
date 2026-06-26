# SAP DevSec Scanner

Langue : [EN](README.md) | FR

> Outil open-source d'analyse de sécurité pour projets SAP BTP (SAPUI5/Fiori & CAP)

![Node.js](https://img.shields.io/badge/Node.js-23%2B-green)
![Vue.js](https://img.shields.io/badge/Vue.js-3.4-brightgreen)
![Express](https://img.shields.io/badge/Express-4.18-lightgrey)
![GitHub License](https://img.shields.io/github/license/thanatos-vf-2000/sap-devsec-scanner)

[![Docs](https://img.shields.io/badge/docs-online-brightgreen)](https://thanatos-vf-2000.github.io/sap-devsec-scanner/) [![Workflow Status](https://github.com/thanatos-vf-2000/sap-devsec-scanner/actions/workflows/docs.yml/badge.svg?branch=master)](https://github.com/thanatos-vf-2000/sap-devsec-scanner/actions)

---

## Table des matières

- [Présentation](#présentation)
- [Fonctionnalités](#fonctionnalités)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Utilisation](#utilisation)
- [Gestion des langues](#gestion-des-langues)
- [Structure du projet](#structure-du-projet)
- [API REST](#api-rest)
- [Scanners disponibles](#scanners-disponibles)
- [Contribution](#contribution)
- [Licence](#licence)

---

## Présentation

**SAP DevSec Scanner** analyse automatiquement vos projets SAP BTP pour détecter les vulnérabilités de sécurité courantes. Il prend en charge les projets **SAPUI5/Fiori** et **CAP (Cloud Application Programming)**.

Le scanner accepte :
- un **fichier ZIP** de projet uploadé depuis le navigateur,
- un **chemin de répertoire** sur le serveur (accès direct au filesystem).

---

## Fonctionnalités

| Fonctionnalité | Description |
|---|---|
| **UI5 Version Scanner** | Détecte les versions SAPUI5 obsolètes ou EOL (End of Life) |
| **UI5 Code Scanner** | Détection XSS, `eval()`, `innerHTML`, open redirect, OWASP Top 10 |
| **NPM Security Scanner** | Audit des dépendances npm, détection de CVE connus, bonnes pratiques |
| **CAP Security Scanner** | Contrôle d'accès CDS, injection SQL, sécurité des services et handlers |
| **Secrets Scanner** | Credentials en clair, tokens JWT, clés API, secrets dans CI/CD |
| **BTP Destinations Scanner** | Analyse des configurations XSUAA, destinations BTP et mta.yaml |
| **AppRouter Security Scanner** | xs-app.json, headers HTTP, CSRF, scopes, version @sap/approuter |
| **Score de risque** | Score 0-100 pondéré par sévérité (CRITICAL / HIGH / MEDIUM / LOW) |
| **Historique des scans** | Conservation en mémoire des rapports de session |

---

## Prérequis

- **Node.js** ≥ 23
- **npm** ≥ 11

---

## Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/thanatos-vf-2000/sap-devsec-scanner.git
cd sap-devsec-scanner
```

### 2. Installer les dépendances backend

```bash
npm install
```

---

## Utilisation

### Mode production (frontend buildé servi par Express)

```bash
npm start
# → http://localhost:3001
```

---

## Gestion des langues

L'interface est automatiquement affichée en **français** ou en **anglais** selon la langue configurée dans le navigateur.

### Frontend (Vue.js)

La détection se fait au chargement via `navigator.language` dans `src/i18n/index.js` :

```js
function detectLang() {
  const lang = navigator.language || navigator.userLanguage || 'en';
  return lang.toLowerCase().startsWith('fr') ? 'fr' : 'en';
}
```

Toutes les chaînes de l'interface sont centralisées dans ce fichier. Pour ajouter une langue :
1. Ajouter un bloc `xx: { ... }` dans `messages`
2. Étendre la logique `detectLang()`

### Backend (Express.js)

Le backend détecte la langue via l'en-tête HTTP `Accept-Language` (envoyé automatiquement par le navigateur) :

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

Les messages d'erreur API sont traduits via `backend/utils/i18n.js`.

---

## Structure du projet

> Source du projet uniquement disponible dans la branche **dev**.

```
Racine/
├── backend/           # Serveur Express (API + serveur du frontend buildé)
│   ├── scanners/      # Modules de scan (un fichier par scanner)
│   ├── routes/        # Routes API Express
│   ├── utils/         # Utilitaires (fileParser, i18n)
│   └── server.js      # Point d'entrée
├── frontend/          # Sources Vue.js (développement)
└── docs/              # Documentation GitHub Pages (VitePress)
```

---

## API REST

| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Status du serveur, version, langue détectée |
| `POST` | `/api/scan/upload` | Scanner un ZIP (multipart, champ `project`) |
| `POST` | `/api/scan/directory` | Scanner un répertoire local (`{ dirPath, projectName }`) |
| `GET` | `/api/scan/history` | Liste des scans de la session |
| `GET` | `/api/scan/:scanId` | Rapport complet d'un scan |
| `DELETE` | `/api/scan/:scanId` | Supprimer un scan de l'historique |

### Exemple de réponse `/api/health`

```json
{
  "status": "ok",
  "version": "1.3.0",
  "service": "SAP DevSec Scanner",
  "lang": "fr"
}
```

### Exemple de rapport `/api/scan/:scanId`

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

## Scanners disponibles

### UI5 Version Scanner

Détecte la version SAPUI5 déclarée dans `manifest.json`, `ui5.yaml`, et les CDN bootstrap, puis la compare au tableau officiel des versions supportées (LTS, latest, EOM).

**Fichiers analysés :** `manifest.json`, `ui5.yaml`, `package.json`

| Code | Sévérité | Description |
|---|:---:|---|
| `UI5_EOL` | HIGH | Version en fin de maintenance |
| `UI5_NOT_LTS` | MEDIUM | Version maintenue mais pas LTS |
| `UI5_UNSUPPORTED` | CRITICAL | Version inconnue ou non supportée |
| `UI5_OUTDATED` | MEDIUM | Plus de 10 versions mineures de retard |
| `UI5_NOT_DETECTED` | INFO | Pas de version UI5 détectée |
| `UI5_NO_CSP` | MEDIUM | Pas de Content-Security-Policy dans manifest.json |
| `UI5_CORS_WILDCARD` | HIGH | `allowed-cors-origins` contient un wildcard `*` |
| `UI5_DEFAULT_VERSION` | INFO | Version applicative à `1.0.0` (valeur par défaut) |

---

### UI5 Code Scanner

Parcourt les fichiers `.js` et `.ts` des projets UI5/Fiori à la recherche de patterns dangereux : XSS, injection de code, open redirect, mauvaises pratiques OWASP.

**Fichiers analysés :** `*.js`, `*.ts`, `*.jsx`, `*.tsx` (hors `node_modules`, `.min.`)

#### Vulnérabilités XSS / Injection

| Code | Sévérité | Description |
|---|:---:|---|
| `UI5_XSS_HTML_CONTROL` | HIGH | `sap.ui.core.HTML` avec contenu dynamique |
| `UI5_XSS_INNERHTML` | HIGH | Assignation directe à `innerHTML` |
| `UI5_XSS_OUTERHTML` | HIGH | Utilisation de `outerHTML` |
| `UI5_EVAL` | CRITICAL | Utilisation de `eval()` |
| `UI5_DOCUMENT_WRITE` | HIGH | Utilisation de `document.write()` |
| `UI5_NEW_FUNCTION` | HIGH | Constructeur `new Function()` |
| `UI5_XMLVIEW_TEMPLATE` | HIGH | `XMLView.create` avec template literal |
| `UI5_DEPRECATED_COMMONS` | HIGH | Utilisation de `sap.ui.commons.*` (déprécié, sans patches sécu) |

#### Open Redirect

| Code | Sévérité | Description |
|---|:---:|---|
| `UI5_OPEN_REDIRECT` | HIGH | `window.location` dynamique |
| `REDIRECT_LOCATION` | MEDIUM | `window.location =` sans URL statique |
| `REDIRECT_LOCATION_HREF` | MEDIUM | `window.location.href =` sans URL statique |
| `REDIRECT_OPEN` | MEDIUM | `window.open()` avec URL dynamique |

#### Données sensibles

| Code | Sévérité | Description |
|---|:---:|---|
| `UI5_SENSITIVE_LOG` | MEDIUM | Log de données sensibles (password, token…) |
| `UI5_LOCALSTORAGE_UNENCRYPTED` | LOW | Stockage localStorage sans sérialisation |
| `SENSITIVE_DATA_LOCAL` | LOW | Secrets dans `localStorage` |
| `SENSITIVE_DATA_SESSION` | LOW | Secrets dans `sessionStorage` |
| `SENSITIVE_DATA_CONSOLE` | LOW | Log de données sensibles en console |

#### Bonnes pratiques / SAP spécifique

| Code | Sévérité | Description |
|---|:---:|---|
| `UI5_SET_TIMEOUT` | MEDIUM | `setTimeout` avec une chaîne au lieu d'une fonction |
| `UI5_SET_INTERVAL` | MEDIUM | `setInterval` avec une chaîne au lieu d'une fonction |
| `UI5_DYNAMIC_FRAGMENT` | MEDIUM | Nom de fragment dynamique dans `Fragment.load` |
| `UI5_RENDER_WHITESPACE` | INFO | `renderWhitespace: true` - vérifier que le contenu est sanitizé |
| `SAP_DEPRECATED_JQUERY_SAP` | LOW | APIs `jQuery.sap.*` dépréciées depuis UI5 1.58 |
| `SAP_POSTMESSAGE_NOCHECK` | MEDIUM | Listener `postMessage` sans validation de `event.origin` |
| `SAP_FORMATTER_CONCAT` | MEDIUM | Concaténation de chaîne dans un formatter - risque XSS |
| `SAP_SPECIFIC_GETCORE` | HIGH | Modification des security token handlers |
| `SAP_SPECIFIC_JQUERY` | MEDIUM | Chemin de ressource construit dynamiquement |
| `SAP_SPECIFIC_REQUIRE` | MEDIUM | Nom de module construit dynamiquement dans `sap.ui.require` |
| `SAP_SPECIFIC_JQUERY_AJAX` | MEDIUM | URL dynamique dans `jQuery.ajax` |

#### OWASP

| Code | Sévérité | Description |
|---|:---:|---|
| `OWASP_REQUIRE` | HIGH | Path traversal via `require()` |
| `OWASP_FS` | HIGH | Accès filesystem avec entrée utilisateur |
| `OWASP_CHILD_PROCESS` | CRITICAL | `child_process.exec/spawn` avec entrée utilisateur |
| `OWASP_HTTP` | HIGH | Requête HTTP outbound avec URL depuis requête utilisateur |
| `OWASP_DESERIALIZ` | MEDIUM | Désérialisation potentiellement non sécurisée |

---

### NPM Security Scanner

Analyse les `package.json` pour inventorier les dépendances SAP, signaler les CVE connus et vérifier les bonnes pratiques de gestion des dépendances.

**Fichiers analysés :** `package.json` (hors `node_modules`)

#### CVE connus

| Code / CVE | Sévérité | Package affecté | Description |
|---|:---:|---|---|
| `CVE-2023-25615` | HIGH | `@sap/xssec < 3.2.0` | Autorisation incorrecte dans la validation XSUAA |
| `CVE-2022-39802` | MEDIUM | `@sap/cds < 6.0.0` | Path traversal dans `cds serve` |
| `CVE-2022-41271` | HIGH | `@sap/approuter < 12.0.0` | Log injection dans le traitement des requêtes |
| `CVE-2022-28214` | MEDIUM | `@sap/hdbext < 7.0.0` | Gestion d'erreur inappropriée, exposition des détails HANA |
| `CVE-2021-33690` | LOW | `@sap/xsenv < 3.1.0` | SSRF via configuration proxy |
| `CVE-2022-25896` | HIGH | `passport < 0.6.0` | Session fixation |
| `CVE-2022-23529` | HIGH | `jsonwebtoken < 9.0.0` | Falsification de token JWT |
| `CVE-2024-29041` | HIGH | `express < 4.19.0` | Open redirect via URL malformée |
| `CVE-2023-45857` | HIGH | `axios < 1.6.0` | CSRF via headers confidentiels transmis aux redirections tierces |
| *(best practice)* | MEDIUM | `helmet < 7.0.0` | Headers sécurité non activés par défaut |

#### Bonnes pratiques

| Code | Sévérité | Description |
|---|:---:|---|
| `VERSION_WILCARD` | MEDIUM | Version non épinglée (`*` ou `latest`) |
| `FORBIDDEN_IN_PROD` | LOW | Packages de dev en dépendances de production (`nodemon`, `jest`…) |
| `RECOMMENDED_PACKAGES` | INFO | Packages sécurité recommandés absents (`helmet`, `@sap/xssec`, `@sap/audit-logging`) |
| `MISSING_ENGINES` | LOW | Pas de champ `engines.node` (version Node non épinglée) |
| `NPM_SCRIPT` | MEDIUM | Hook npm lifecycle (`preinstall`, `postinstall`, `prepare`) |
| `NO_LOCK_FILE` | LOW | Pas de `package-lock.json` ou `yarn.lock` |
| `LOCK_FILE` | INFO | Lock file présent - lancer `npm audit` |

---

### CAP Security Scanner

Inspecte les fichiers `.cds`, `.js`/`.ts` handlers, `mta.yaml`, `xs-security.json` et `.cdsrc.json` pour détecter les problèmes de contrôle d'accès, d'injection SQL et de configuration CAP.

**Fichiers analysés :** `*.cds`, `*.js`, `*.ts`, `mta.yaml`, `xs-security.json`, `.cdsrc.json`, `package.json` (section `cds`)

#### Services CDS

| Code | Sévérité | Description |
|---|:---:|---|
| `CDS_NO_AUTH` | HIGH | Service sans `@requires` ou `@restrict` |
| `CDS_OPEN_SERVICE` | HIGH | Service annoté `@open` - accès non restreint |
| `CDS_PERSONAL_DATA_NO_LABEL` | INFO | `@PersonalData` présent sans `@EndUserText.label` (RGPD) |
| `CDS_AUTOEXPOSE_NO_AUTH` | MEDIUM | Entité `@cds.autoexpose` sans restriction d'accès |

#### Handlers JS/TS

| Code | Sévérité | Description |
|---|:---:|---|
| `CAP_HANDLER_NOAUTH` | MEDIUM | Handler `srv.on()` sans vérification d'autorisation visible |
| `CAP_SELECT_NOFILTER` | LOW | `SELECT.from()` sans clause WHERE |
| `CAP_UNVALIDATED_INPUT` | LOW | Utilisation de `req.data` sans validation apparente |
| `CAP_SQL_INJECTION` | CRITICAL | Injection SQL via template literal dans `cds.run()` |
| `CAP_ENV_ACCESS` | INFO | Accès à `process.env` - vérifier qu'aucun secret n'est dans le code |
| `CAP_LOG_REQUEST` | MEDIUM | Log de l'objet `req` - peut exposer des données sensibles |
| `CAP_DIRECT_HANA` | HIGH | Client HANA direct (`hdb`, `@sap/hana-client`) - contourne la couche d'autorisation CDS |
| `CAP_SECURITY_DISABLED` | CRITICAL | Sécurité CDS explicitement désactivée (`"security": false`) |
| `CAP_EXPRESS_UNPROTECTED` | MEDIUM | Route Express brute sans middleware XSUAA/passport |
| `CAP_JSON_PARSE_INPUT` | MEDIUM | `JSON.parse` sur entrée brute de la requête |
| `CAP_PATH_TRAVERSAL` | HIGH | Lecture de fichier avec entrée de la requête |

#### Configuration CDS (`.cdsrc.json` / `package.json`)

| Code | Sévérité | Description |
|---|:---:|---|
| `CAP_AUTH_MOCK` | HIGH | `auth.kind` à `dummy`, `mock` ou `basic` - ne pas utiliser en production |
| `CAP_CSRF_DISABLED` | HIGH | CSRF désactivé dans la config du serveur CDS |
| `CAP_INSECURE_PROFILE` | MEDIUM | Profile `development` ou `hybrid` actif |

#### MTA

| Code | Sévérité | Description |
|---|:---:|---|
| `MTA_NO_AUTH` | HIGH | Module sans authentification configurée |
| `MTA_SEC_PATCH_OFF` | MEDIUM | Security patching désactivé |
| `MTA_HTTP_ENDPOINT` | HIGH | Endpoint non-HTTPS configuré |

#### XSUAA (`xs-security.json`)

| Code | Sévérité | Description |
|---|:---:|---|
| `XSUAA_NO_PROVIDERS` | MEDIUM | `allowedproviders` vide - pas de restriction IdP |
| `XSUAA_WILDCARD` | MEDIUM | Wildcard dans `xsappname` |
| `XSUAA_ACCEPT_GRANTED` | HIGH | `$ACCEPT_GRANTED_AUTHORITIES` - accepte toutes les autorités |

---

### Secrets Scanner

Détecte les credentials, tokens JWT, clés API et mots de passe codés en dur dans les fichiers source, de configuration et CI/CD.

**Fichiers analysés :** tous les fichiers texte (hors `node_modules`, `.git`, `dist`, `build`, assets binaires)

#### Secrets dans le code

| Code | Sévérité | Description |
|---|:---:|---|
| `SECRET_PASSWORD` | CRITICAL | Mot de passe en clair (`password =`, `pwd:`) |
| `SECRET_CLIENT_SECRET` | CRITICAL | Client secret OAuth2 en clair |
| `SECRET_API_KEY` | CRITICAL | Clé API codée en dur |
| `SECRET_TOKEN` | CRITICAL | Token / access token en clair |
| `SECRET_KEY` | CRITICAL | Clé secrète (`secret_key`, `secretkey`) |
| `SECRET_PRIVATE_KEY` | CRITICAL | Clé privée dans un fichier |
| `SECRET_VCAP` | HIGH | `VCAP_SERVICES` avec credentials dans le code |
| `SECRET_CLIENT_ID` | HIGH | `clientid` OAuth2 codé en dur |
| `SECRET_DB_PASSWORD` | CRITICAL | Mot de passe base de données en clair |
| `SECRET_SMTP` | HIGH | Mot de passe SMTP/mail en clair |
| `SECRET_AWS_KEY` | CRITICAL | Clé d'accès AWS détectée |
| `SECRET_XSUAA` | CRITICAL | `clientsecret` XSUAA en clair |
| `SECRET_HDI_USER` | CRITICAL | Utilisateur HDI en clair |
| `SECRET_HDI_PASSWORD` | CRITICAL | Mot de passe HDI en clair |
| `SECRET_IAS_SECRET` | CRITICAL | Secret IAS (Identity Authentication Service) en clair |
| `SECRET_AI_CORE` | CRITICAL | Secret SAP AI Core en clair |
| `SECRET_CONNECTIVITY` | HIGH | Mot de passe Cloud Connector / Connectivity en clair |
| `SECRET_HANA_CLOUD_URL` | CRITICAL | URL HANA Cloud avec credentials embarqués |
| `SECRET_CF_PASSWORD` | CRITICAL | Mot de passe Cloud Foundry admin/user en clair |
| `SECRET_GITHUB_PAT` | CRITICAL | Personal Access Token GitHub détecté |
| `SECRET_BASE64_CANDIDATE` | INFO | Chaîne base64 de 52 caractères - possible secret encodé |

#### Fichiers sensibles

| Code | Sévérité | Description |
|---|:---:|---|
| `ENV_SECRET` | HIGH | Clé sensible dans `.env` |
| `DEFAULT_ENV_SECRETS` | CRITICAL | `default-env.json` contient des credentials |
| `DEFAULT_ENV_COMMITTED` | HIGH | `default-env.json` committée dans le projet |
| `MANIFEST_SECRET` | HIGH | Secret potentiel dans `manifest.yml` |
| `SERVICE_KEY_COMMITTED` | CRITICAL | `service-key.json` présente dans le dépôt |
| `PIPELINE_SECRET` | CRITICAL | Secret codé en dur dans un fichier CI/CD |

#### Gitignore

| Code | Sévérité | Description |
|---|:---:|---|
| `NO_GITIGNORE` | MEDIUM | Pas de `.gitignore` - fichiers sensibles pourraient être committés |
| `GITIGNORE_MISSING` | MEDIUM | Fichier sensible absent du `.gitignore` (`default-env.json`, `.env`, `service-key.json`…) |

---

### BTP Destinations Scanner

Vérifie les configurations de destinations SAP BTP, les fichiers `xs-security.json` et `mta.yaml` pour détecter les authentifications faibles ou les mauvaises pratiques.

**Fichiers analysés :** `*destination*.json`, `*dest*.json`, `xs-security.json`, `mta.yaml`

#### Destinations

| Code | Sévérité | Description |
|---|:---:|---|
| `BTP_NO_AUTH` | HIGH | Destination avec `NoAuthentication` |
| `BTP_TRUST_ALL` | HIGH | `TrustAll: true` - pas de vérification TLS |
| `BTP_HTTP_URL` | HIGH | URL de destination en HTTP non sécurisé |
| `BTP_DEST_PASSWORD` | CRITICAL | Mot de passe codé en dur dans la destination |
| `BTP_DEST_NO_TOKEN_URL` | MEDIUM | Destination OAuth2 sans `TokenServiceURL` |
| `BTP_DEST_CLIENT_SECRET` | CRITICAL | Secret OAuth2 codé en dur dans la destination |
| `BTP_DEST_NO_CC_LOCATION` | LOW | Proxy OnPremise sans `CloudConnectorLocationId` |

#### MTA

| Code | Sévérité | Description |
|---|:---:|---|
| `BTP_MTA_NO_AUTH` | HIGH | `NoAuthentication` dans la configuration MTA |
| `BTP_MTA_NO_AUTH_FORWARD` | LOW | `NoAuthentication` + `ForwardAuthToken: true` |
| `BTP_MTA_NO_MEMORY` | LOW | Module MTA sans quota mémoire |
| `BTP_MTA_NO_HEALTHCHECK` | INFO | Pas de `health-check-type` pour les modules Node.js |

#### XSUAA (`xs-security.json`)

| Code | Sévérité | Description |
|---|:---:|---|
| `XSUAA_NO_APPNAME` | MEDIUM | `xsappname` manquant |
| `XSUAA_NO_SCOPES` | LOW | Pas de scopes définis |
| `XSUAA_GENERIC_ROLE` | LOW | Un seul rôle générique `User` |
| `XSUAA_LONG_TOKEN` | MEDIUM | Validité du token > 12 heures |
| `XSUAA_REDIRECT_LOCALHOST` | MEDIUM | URI de redirection avec `localhost` ou HTTP |
| `XSUAA_WILDCARD_REDIRECT` | HIGH | URI de redirection wildcard sans HTTPS |
| `XSUAA_SHARED_NO_FOREIGN_SCOPE` | LOW | Mode `shared` sans référence `$XSSERVICENAME` |
| `XSUAA_ACCEPT_GRANTED` | HIGH | `$ACCEPT_GRANTED_AUTHORITIES` - accepte toutes les autorités |
| `XSUAA_NO_ROLE_COLLECTIONS` | INFO | Pas de `role-collections` définies |
| `XSUAA_PARSE_ERR` | LOW | Impossible de parser `xs-security.json` |

---

### AppRouter Security Scanner

Analyse complète de la configuration AppRouter SAP BTP : `xs-app.json`, `package.json`, `mta.yaml`.

**Fichiers analysés :** `xs-app.json`, `package.json` (avec `@sap/approuter`), `mta.yaml`

#### Configuration globale (`xs-app.json`)

| Code | Sévérité | Description |
|---|:---:|---|
| `AR_AUTH_NONE_GLOBAL` | HIGH | `authenticationMethod: "none"` global - toutes les routes publiques |
| `AR_CSRF_DISABLED` | HIGH | `csrfProtection: false` - protection CSRF désactivée |
| `AR_SESSION_LONG` | MEDIUM | `sessionTimeout` > 60 minutes |
| `AR_NO_SESSION_TIMEOUT` | INFO | Pas de `sessionTimeout` configuré |
| `AR_NO_LOGOUT_ENDPOINT` | LOW | Pas de `logout.logoutEndpoint` défini |
| `AR_PARSE_ERROR` | LOW | `xs-app.json` invalide (JSON malformé) |
| `AR_NO_ROUTES` | INFO | Aucune route définie |

#### Headers HTTP de sécurité

| Code | Sévérité | Description |
|---|:---:|---|
| `AR_MISSING_CSP` | HIGH | `Content-Security-Policy` non configuré |
| `AR_MISSING_XFO` | MEDIUM | `X-Frame-Options` non configuré |
| `AR_MISSING_XCTO` | MEDIUM | `X-Content-Type-Options: nosniff` absent |
| `AR_MISSING_HSTS` | MEDIUM | `Strict-Transport-Security` (HSTS) absent |
| `AR_MISSING_RP` | LOW | `Referrer-Policy` non configuré |
| `AR_CSP_UNSAFE_INLINE` | HIGH | CSP contient `'unsafe-inline'` |
| `AR_CSP_UNSAFE_EVAL` | HIGH | CSP contient `'unsafe-eval'` |
| `AR_CSP_WILDCARD` | HIGH | CSP avec wildcard `*` |
| `AR_CSP_NO_FRAME_ANCESTORS` | LOW | CSP sans directive `frame-ancestors` |
| `AR_XFO_UNSAFE` | MEDIUM | Valeur `X-Frame-Options` non recommandée |

#### Routes

| Code | Sévérité | Description |
|---|:---:|---|
| `AR_ROUTE_NO_AUTH` | HIGH | Route avec `authenticationType: "none"` |
| `AR_ROUTE_CSRF_OFF` | MEDIUM | CSRF désactivé sur une route |
| `AR_ROUTE_HTTP_DEST` | HIGH | Destination de route en HTTP non sécurisé |
| `AR_WILDCARD_ROUTE_NO_AUTH` | CRITICAL | Route catch-all (`.*`) sans authentification |
| `AR_FORWARD_TOKEN_NO_AUTH` | HIGH | `forwardAuthToken: true` sur une route non authentifiée |
| `AR_ROUTE_NO_SCOPE` | LOW | Route API authentifiée sans restriction de scope |
| `AR_HTML5_REPO_NO_AUTH` | MEDIUM | Route `html5-apps-repo-rt` sans authentification |

#### Version AppRouter

| Code | Sévérité | Description |
|---|:---:|---|
| `AR_OUTDATED_VERSION` | HIGH | `@sap/approuter` < 14.0.0 |

#### Configuration MTA

| Code | Sévérité | Description |
|---|:---:|---|
| `AR_MTA_NO_XSUAA` | HIGH | Module AppRouter sans binding XSUAA ou IAS |
| `AR_MTA_NO_CONNECTIVITY` | MEDIUM | Destinations OnPremise sans service Connectivity |
| `AR_MTA_NO_SESSION_TIMEOUT` | INFO | Pas de `SESSION_TIMEOUT` dans le module AppRouter |
| `AR_JWT_TRUST_WILDCARD` | CRITICAL | `SAP_JWT_TRUST_ACL` avec `clientid: "*"` |
| `AR_XFO_DISABLED` | HIGH | `SEND_XFRAMEOPTIONS: false` dans l'environnement AppRouter |

#### Managed AppRouter

| Code | Sévérité | Description |
|---|:---:|---|
| `AR_XSAPP_NO_PKG` | INFO | `xs-app.json` sans `package.json` adjacent avec `@sap/approuter` |

---

## Contribution

Les contributions sont les bienvenues ! Pour proposer une amélioration :

1. Forker le dépôt branche **dev**,
2. Créer une branche (`git checkout -b feature/ma-feature`),
3. Commiter vos changements (`git commit -m 'feat: ajouter ...'`),
4. Pousser la branche (`git push origin feature/ma-feature`),
5. Ouvrir une Pull Request.

---

## Licence

Copyright 2026 @Franck VANHOUCKE

Licensed under the [Apache License, Version 2.0](LICENSE).

> Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied

---

*SAP DevSec Scanner est un projet communautaire indépendant, non affilié à SAP SE.*
