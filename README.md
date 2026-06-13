# SAP DevSec Scanner

Outil de sécurité pour les projets SAP BTP (CAP, UI5/Fiori, MTA, XSUAA).

---

## Fonctionnalités

| Module | Description |
|:--------| :---------------------------------------------------- |
| **UI5 Scanner** | Détection version, comparaison LTS/Latest, patterns XSS |
| **CAP/CDS Scanner** | Contrôle d'accès, services exposés, injection SQL |
| **Secrets Scanner** | Mots de passe, tokens, clés API en clair |
| **BTP Scanner** | Destinations, XSUAA, configurations MTA |
| **NPM Scanner** | Dépendances vulnérables, paquets SAP |

---

## Installation

```bash
cd backend
npm install
node server.js
```

Accéder à http://localhost:3001

---

## Utilisation

### Via interface web
1. Déposer un ZIP du projet SAP
2. Ou entrer le chemin d'un répertoire local
3. Consulter le rapport de sécurité

### Via API REST

```bash
# Scanner un ZIP
curl -X POST http://localhost:3001/api/scan/upload \
  -F "project=@mon-projet.zip" \
  -F "projectName=my-fiori-app"

# Scanner un répertoire
curl -X POST http://localhost:3001/api/scan/directory \
  -H "Content-Type: application/json" \
  -d '{"dirPath":"/path/to/project","projectName":"my-app"}'

# Historique
curl http://localhost:3001/api/scan/history
```

---

## Fichiers reconnus

```
manifest.json       → Détection version UI5
package.json        → Dépendances NPM, paquets SAP
ui5.yaml            → Framework UI5
mta.yaml            → Configuration MTA
xs-security.json    → Configuration XSUAA
default-env.json    → Variables BTP (à ne pas committer!)
.env                → Variables d'environnement
*.cds               → Services CAP, modèles de données
*.js / *.ts         → Code source, patterns OWASP
```

---

## Score de sécurité

- **CRITICAL** (-25 pts) : Secrets en clair, injection SQL, eval()
- **HIGH** (-15 pts) : XSS, NoAuthentication, service sans @requires
- **MEDIUM** (-8 pts) : Version UI5 non-LTS, token long, HTTP
- **LOW** (-3 pts) : Gitignore manquant, versions wildcard

---

## Architecture

```
sap-devsec-scanner/
├── backend/
│   ├── server.js              # Express server
│   ├── routes/scan.js         # API endpoints
│   ├── scanners/
│   │   ├── ui5Scanner.js      # Version UI5 + XSS patterns
│   │   ├── capScanner.js      # CAP/CDS/MTA/XSUAA
│   │   ├── secretsScanner.js  # Secrets & .gitignore
│   │   ├── btpScanner.js      # Destinations BTP
│   │   └── npmScanner.js      # Packages NPM
│   └── utils/fileParser.js    # ZIP & directory parser
└── frontend/
    └── index.html             # SAPUI5-styled dashboard
```

---

## License

Copyright 2026 @Franck VANHOUCKE

Licensed under the [Apache License, Version 2.0](LICENSE).

> Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.