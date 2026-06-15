# 🔒 SAP DevSec Scanner

> Outil open-source d'analyse de sécurité pour projets SAP BTP (SAPUI5/Fiori & CAP)

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org)
[![Vue.js](https://img.shields.io/badge/Vue.js-3.x-brightgreen)](https://vuejs.org)
[![Express](https://img.shields.io/badge/Express-4.x-lightgrey)](https://expressjs.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 📋 Table des matières

- [Présentation](#-présentation)
- [Fonctionnalités](#-fonctionnalités)
- [Architecture](#-architecture)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Utilisation](#-utilisation)
- [Gestion des langues](#-gestion-des-langues)
- [Structure du projet](#-structure-du-projet)
- [API REST](#-api-rest)
- [Scanners disponibles](#-scanners-disponibles)
- [Contribution](#-contribution)

---

## 🎯 Présentation

**SAP DevSec Scanner** analyse automatiquement vos projets SAP BTP pour détecter les vulnérabilités de sécurité courantes. Il prend en charge les projets **SAPUI5/Fiori** et **CAP (Cloud Application Programming)**.

Le scanner accepte :
- un **fichier ZIP** de projet uploadé depuis le navigateur
- un **chemin de répertoire** sur le serveur (accès direct au filesystem)

---

## ✨ Fonctionnalités

| Fonctionnalité | Description |
|---|---|
| 🎨 **UI5 Version Scanner** | Détecte les versions SAPUI5 obsolètes ou EOL (End of Life) |
| 📦 **NPM Security Scanner** | Audit des dépendances npm, détection de CVE |
| ⚙️ **CAP Security Scanner** | Contrôle d'accès, injection SQL, sécurité des services CDS |
| 🔍 **UI5 Code Scanner** | Détection XSS, `eval()`, `innerHTML`, open redirect |
| 🔐 **Secrets Scanner** | Credentials en clair, tokens JWT, clés API exposées |
| ☁️ **BTP Destinations Scanner** | Analyse des configurations XSUAA et destinations BTP |
| 🌐 **i18n automatique** | Interface en français ou anglais selon le navigateur |
| 📊 **Score de risque** | Score 0–100 pondéré par sévérité (CRITICAL / HIGH / MEDIUM / LOW) |
| 📋 **Historique des scans** | Conservation en mémoire des rapports de session |

---

## 🏗️ Architecture

```
sap-devsec-scanner/
├── backend/                  # API Express.js (Node.js)
│   ├── server.js             # Point d'entrée, middleware i18n
│   ├── routes/
│   │   └── scan.js           # Routes /api/scan/*
│   ├── scanners/
│   │   ├── ui5Scanner.js     # Scanner versions SAPUI5
│   │   ├── capScanner.js     # Scanner sécurité CAP/CDS
│   │   ├── secretsScanner.js # Scanner secrets & credentials
│   │   ├── btpScanner.js     # Scanner destinations BTP
│   │   └── npmScanner.js     # Scanner dépendances npm
│   └── utils/
│       ├── fileParser.js     # Parser ZIP et répertoire
│       └── i18n.js           # Messages d'erreur backend (FR/EN)
│
├── frontend-vue/             # Application Vue.js 3
│   ├── index.html
│   ├── vite.config.js        # Build & proxy dev vers backend
│   ├── package.json
│   └── src/
│       ├── main.js
│       ├── App.vue           # Shell, navigation, health check
│       ├── i18n/
│       │   └── index.js      # Détection langue navigateur + traductions
│       ├── views/
│       │   ├── ScanView.vue      # Upload ZIP / scan répertoire
│       │   ├── ReportView.vue    # Rapport de scan avec onglets
│       │   ├── HistoryView.vue   # Historique des scans
│       │   └── AboutView.vue     # À propos
│       └── components/
│           ├── UI5Tab.vue        # Onglet versions UI5
│           ├── CAPTab.vue        # Onglet services CAP
│           ├── SecretsTab.vue    # Onglet secrets
│           ├── BTPTab.vue        # Onglet BTP
│           ├── NPMTab.vue        # Onglet dépendances NPM
│           └── IssuesTable.vue   # Tableau de problèmes réutilisable
│
└── frontend-dist/            # Build Vue (généré par `npm run build`)
```

---

## 📦 Prérequis

- **Node.js** ≥ 18
- **npm** ≥ 9

---

## 🚀 Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/votre-org/sap-devsec-scanner.git
cd sap-devsec-scanner
```

### 2. Installer les dépendances backend

```bash
cd backend
npm install
```

### 3. Installer les dépendances frontend et builder

```bash
cd ../frontend-vue
npm install
npm run build      # Génère frontend-dist/ pour la production
```

---

## 🖥️ Utilisation

### Mode production (frontend buildé servi par Express)

```bash
cd backend
npm start
# → http://localhost:3001
```

### Mode développement (hot-reload Vue + proxy API)

Terminal 1 — Backend :
```bash
cd backend
npm run dev        # nodemon, redémarre auto
```

Terminal 2 — Frontend Vue :
```bash
cd frontend-vue
npm run dev        # Vite dev server sur :5173, proxy /api → :3001
# → http://localhost:5173
```

---

## 🌐 Gestion des langues

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

## 📁 Structure du projet

```
Racine/
├── backend/           # Serveur Express (API + serve du frontend buildé)
├── frontend-vue/      # Sources Vue.js (développement)
└── frontend-dist/     # Frontend buildé (généré, servi en production)
```

---

## 📡 API REST

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
    "npm": { ... }
  }
}
```

---

## 🔍 Scanners disponibles

### 🎨 UI5 Version Scanner
Détecte la version SAPUI5 déclarée dans `manifest.json`, `ui5.yaml`, et les CDN bootstrap, puis la compare au tableau officiel des versions supportées (LTS, latest, EOM).

### 📦 NPM Security Scanner
Analyse les `package.json` pour inventorier les dépendances SAP et signaler les paquets présentant des risques connus.

### ⚙️ CAP Security Scanner
Inspecte les fichiers `.cds`, `mta.yaml` et `xs-security.json` pour détecter : services sans `@requires`, configurations XSUAA risquées, problèmes MTA.

### 🔍 UI5 Code Scanner
Parcourt les fichiers `.js` et `.ts` des projets UI5/Fiori à la recherche de patterns dangereux : `eval()`, `innerHTML`, `sap.ui.require` non sécurisé, open redirect.

### 🔐 Secrets Scanner
Détecte les credentials, tokens JWT, clés API et mots de passe codés en dur dans les fichiers `.env`, `default-env.json` et le code source.

### ☁️ BTP Destinations Scanner
Vérifie les configurations de destinations SAP BTP et XSUAA pour détecter les authentifications faibles ou les mauvaises pratiques.

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour proposer une amélioration :

1. Forker le dépôt
2. Créer une branche (`git checkout -b feature/ma-feature`)
3. Commiter vos changements (`git commit -m 'feat: ajouter ...'`)
4. Pousser la branche (`git push origin feature/ma-feature`)
5. Ouvrir une Pull Request

---

## 📄 Licence

MIT — voir [LICENSE](LICENSE)

---

*SAP DevSec Scanner est un projet communautaire indépendant, non affilié à SAP SE.*
