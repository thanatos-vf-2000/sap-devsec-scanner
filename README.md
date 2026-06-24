# SAP DevSec Scanner

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
| **UI5 Code Scanner** | Détection XSS, `eval()`, `innerHTML`, open redirect |
| **NPM Security Scanner** | Audit des dépendances npm, détection de CVE |
| **CAP Security Scanner** | Contrôle d'accès, injection SQL, sécurité des services CDS |
| **Secrets Scanner** | Credentials en clair, tokens JWT, clés API exposées |
| **BTP Destinations Scanner** | Analyse des configurations XSUAA et destinations BTP |
| **AppRouter Security Scanner** | Il couvre tout ce que le repo btp-secure-development aborde autour de l AppRouter|
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

>Source du projet uniquement disponible dans la branche **dev**.

```
Racine/
├── backend/           # Serveur Express (API + serveur du frontend buildé)
├── frontend/          # Sources Vue.js (développement)
└── docs/              # Documentation github (https://thanatos-vf-2000.github.io/sap-devsec-scanner/)
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
  "version": "1.0.0",
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
  "scannedAt": "2026-06-12T10:00:00.000Z",
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

### NPM Security Scanner
Analyse les `package.json` pour inventorier les dépendances SAP et signaler les paquets présentant des risques connus.

### CAP Security Scanner
Inspecte les fichiers `.cds`, `mta.yaml` et `xs-security.json` pour détecter : services sans `@requires`, configurations XSUAA risquées, problèmes MTA.

### UI5 Code Scanner
Parcourt les fichiers `.js` et `.ts` des projets UI5/Fiori à la recherche de patterns dangereux : `eval()`, `innerHTML`, `sap.ui.require` non sécurisé, open redirect.

### Secrets Scanner
Détecte les credentials, tokens JWT, clés API et mots de passe codés en dur dans les fichiers `.env`, `default-env.json` et le code source.

### BTP Destinations Scanner
Vérifie les configurations de destinations SAP BTP et XSUAA pour détecter les authentifications faibles ou les mauvaises pratiques.

### AppRouter Security Scanner
- `xs-app.json` : `authenticationMethod: "none"` global, `csrfProtection: false`, `sessionTimeout` trop long, absence d'endpoint de logout, analyse des headers HTTP (CSP, X-Frame-Options, HSTS, X-Content-Type-Options, Referrer-Policy), valeurs CSP dangereuses (`unsafe-inline`, `unsafe-eval`, wildcards), routes sans authentification, routes catch-all publiques, `forwardAuthToken` sans auth, absence de `scope` sur les routes API
- `package.json` : version `@sap/approuter` < 14.0.0
- `mta.yaml` : AppRouter sans binding XSUAA/IAS, `SAP_JWT_TRUST_ACL` avec wildcard `*`, `SEND_XFRAMEOPTIONS: false`


---

## Contribution

Les contributions sont les bienvenues ! Pour proposer une amélioration :

1. Forker le dépôt branche **dev**
2. Créer une branche (`git checkout -b feature/ma-feature`)
3. Commiter vos changements (`git commit -m 'feat: ajouter ...'`)
4. Pousser la branche (`git push origin feature/ma-feature`)
5. Ouvrir une Pull Request

---

## Licence

Copyright 2026 @Franck VANHOUCKE

Licensed under the [Apache License, Version 2.0](LICENSE).

> Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied


---

*SAP DevSec Scanner est un projet communautaire indépendant, non affilié à SAP SE.*
