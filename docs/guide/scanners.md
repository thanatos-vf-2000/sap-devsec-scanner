# Scanners disponibles

SAP DevSec Scanner embarque **6 scanners spécialisés** qui s'activent automatiquement selon le type de projet détecté.

## 🎨 UI5 Version Scanner

Analyse les fichiers `manifest.json`, `ui5.yaml` et les balises CDN bootstrap pour identifier la version SAPUI5 déclarée, puis la compare au tableau officiel des versions supportées.

**Fichiers analysés :** `manifest.json`, `ui5.yaml`, `*.html` (CDN bootstrap)

| Finding | Sévérité |
|---------|----------|
| Version EOL (End of Life) | 🔴 CRITICAL |
| Version EOM (End of Maintenance) | 🟠 HIGH |
| Version non reconnue | 🟡 MEDIUM |
| Version LTS à jour | ℹ️ INFO |

---

## 📦 NPM Security Scanner

Analyse les fichiers `package.json` pour inventorier les dépendances SAP et signaler les paquets présentant des risques connus ou des versions obsolètes.

**Fichiers analysés :** tous les `package.json` du projet

| Finding | Sévérité |
|---------|----------|
| Paquet avec CVE connue | 🔴 CRITICAL ou 🟠 HIGH |
| Version majeure très ancienne | 🟡 MEDIUM |
| Paquet déprécié | 🔵 LOW |

---

## ⚙️ CAP Security Scanner

Inspecte les fichiers CDS, MTA et XSUAA pour détecter les mauvaises configurations de sécurité dans les projets Cloud Application Programming.

**Fichiers analysés :** `*.cds`, `mta.yaml`, `xs-security.json`

| Règle | Sévérité | Description |
|-------|----------|-------------|
| `NO_AUTH_REQUIRED` | 🟠 HIGH | Service CDS sans `@requires` |
| `ALLOW_ALL` | 🔴 CRITICAL | Accès `@requires: 'any'` sur des entités sensibles |
| `XSUAA_WEAK_SCOPE` | 🟡 MEDIUM | Scopes XSUAA trop permissifs |
| `MTA_NO_OAUTH` | 🟠 HIGH | Module MTA sans sécurité OAuth configurée |

---

## 🔍 UI5 Code Scanner

Parcourt les fichiers JavaScript et TypeScript des projets UI5/Fiori à la recherche de patterns de code dangereux pouvant introduire des vulnérabilités XSS ou des comportements non sécurisés.

**Fichiers analysés :** `*.js`, `*.ts` (hors `node_modules`)

| Pattern détecté | Sévérité | Risque |
|-----------------|----------|--------|
| `eval(` | 🔴 CRITICAL | Exécution de code arbitraire |
| `.innerHTML =` | 🟠 HIGH | Injection XSS |
| `document.write(` | 🟠 HIGH | Injection XSS |
| Open redirect (`location.href`) | 🟡 MEDIUM | Redirection non validée |
| `sap.ui.require` non sécurisé | 🔵 LOW | Chargement de module non contrôlé |

---

## 🔐 Secrets Scanner

Détecte les credentials, tokens et clés API codés en dur dans les sources du projet. Ce scanner analyse aussi bien les fichiers de configuration que le code source.

**Fichiers analysés :** `*.env`, `.env*`, `default-env.json`, `*.json`, `*.js`, `*.ts`, `*.yaml`, `*.yml`

| Pattern détecté | Sévérité |
|-----------------|----------|
| Token JWT (`eyJ...`) | 🔴 CRITICAL |
| Clé API en clair (`apiKey`, `api_key`) | 🔴 CRITICAL |
| Mot de passe en dur (`password =`) | 🟠 HIGH |
| Client Secret XSUAA | 🔴 CRITICAL |
| Credential dans URL (`https://user:pass@`) | 🟠 HIGH |

::: tip
Utilisez toujours des variables d'environnement ou le **SAP Credential Store** pour gérer vos secrets.
:::

---

## ☁️ BTP Destinations Scanner

Vérifie les configurations de destinations SAP BTP et les fichiers XSUAA pour détecter les authentifications faibles ou les mauvaises pratiques de configuration.

**Fichiers analysés :** `*.destinations`, `xs-security.json`, `default-env.json`

| Finding | Sévérité | Description |
|---------|----------|-------------|
| Authentification `NoAuthentication` | 🟠 HIGH | Destination sans auth |
| `allowedJwtClaims` vide | 🟡 MEDIUM | Validation JWT insuffisante |
| `xsappname` non unique | 🔵 LOW | Risque de collision de namespace |
| `oauth2-configuration` absente | 🟡 MEDIUM | Config OAuth manquante |