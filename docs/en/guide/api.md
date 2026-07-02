# REST API

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Server status, application version, detected language |
| `POST` | `/api/scan/upload` | Scan an uploaded ZIP archive (`multipart/form-data`, field `project`) |
| `POST` | `/api/scan/directory` | Scan a local directory (`{ dirPath, projectName }`) |
| `GET` | `/api/scan/history` | List all scans performed during the current session |
| `GET` | `/api/scan/:scanId` | Retrieve the complete scan report |
| `DELETE` | `/api/scan/:scanId` | Delete a scan report from the session history |
| `GET` | `/api/sap/ui5/version` | Verifying access to https://ui5.sap.com/ and downloading information |
| `GET` | `/api/sap/ui5/resources/:version` | Retrieving 

## Example - Health check

```bash
curl http://localhost:3001/api/health
```

```json
{
  "status": "ok",
  "version": "1.3.0",
  "service": "SAP DevSec Scanner",
  "lang": "en"
}
```
## Example - Scan 

### Example - Scan a ZIP

```bash
curl -X POST http://localhost:3001/api/scan/upload \
  -F "project=@my-project.zip"
```

### Example - Scan a directory

```bash
curl -X POST http://localhost:3001/api/scan/directory \
  -H "Content-Type: application/json" \
  -d '{"dirPath": "/home/user/my-project", "projectName": "my-project"}'
```

## Report exemple

```bash
curl http://localhost:3001/api/scan/<uuid>
```

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

## Exemple history

```bash
curl http://localhost:3001/api/scan/history
```

```json
[
  {
      "scanId": "uuid",
      "projectName": "my-fiori-app",
      "scannedAt": "2026-06-25T10:00:00.000Z",
      "riskScore": 0,
      "riskLevel": "MEDIUM",
      "summary": {
          "critical": 0, "high": 2, "medium": 3, "low": 5, "info": 1, "total": 11
      },
      "projectTypes": ["UI5", "CAP"],
  },
  ...
]
```

## Exemple de ui5 version

```bash
curl http://localhost:3001/api/sap/ui5/version
```

```json
{
    "status": 200,
    "message": "https://ui5.sap.com/ available.",
    "data": {
        "latest": {
            "version": "1.149.1",
            "support": "Maintenance",
            "lts": false
        },
        "active": {
            "version": "1.149.1",
            "support": "Maintenance",
            "lts": false
        },
        "1.149": {
            "version": "1.149.1",
            "support": "Maintenance",
            "lts": false
        },
        ...
    }
}
```

## Exemple ressource version x.xx.x

```bash
curl http://localhost:3001/api/sap/ui5/resources/:version
```

```json
{
    "source": "cache",
    "version": "1.136.15",
    "data": {
        "name": "SAPUI5 Distribution",
        "version": "1.136.15",
        "buildTimestamp": "202602251220",
        "scmRevision": "",
        "gav": "com.sap.ui5.dist:sapui5-sdk-dist:1.136.15:war",
        "libraries": [
            {
                "name": "sap.ui.core",
                "version": "1.136.13",
                "buildTimestamp": "202602231017",
                "scmRevision": "",
                "gav": "com.sap.ui5:core:1.136.13:jar",
                "npmPackageName": "@openui5/sap.ui.core",
                "themes": [
                    "base",
                    "sap_hcb"
                ],
                "patchHistory": [
                    "1.136.0",
                    ...
                ],
                "vendor": "SAP SE",
                "copyright": "OpenUI5\n * (c) Copyright 2026 SAP SE or an SAP affiliate company.\n * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.",
                "documentation": "The SAPUI5 Core Runtime.\n\n  Contains the UI5 jQuery plugins (jQuery.sap.*), the Core and all its components,\n  base classes for Controls, Components and the Model View Controller classes.",
                "appData": "..."
            },
            ...
        ],
        "components": {
            "SAPWebAnalyticsFLPPlugin": {
                "hasOwnPreload": true,
                "library": "sap.webanalytics.core",
                "manifestHints": {
                    "dependencies": {
                        "libs": {
                            "sap.ui.core": {}
                        }
                    }
                }
            },
            ...
        },
        "themes": [
            {
                "name": "sap_horizon",
                "libraries": [
                    "sap.ca.ui",
                    ...
                ]
            },
            ...
        ],
        "supportedThemes": [
            "sap_horizon",
            ...
        ]
    }
}
```