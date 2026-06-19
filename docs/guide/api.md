# API REST

## Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/health` | Status du serveur |
| `POST` | `/api/scan/upload` | Scanner un ZIP |
| `POST` | `/api/scan/directory` | Scanner un répertoire |
| `GET` | `/api/scan/history` | Historique des scans |
| `GET` | `/api/scan/:scanId` | Rapport complet |
| `DELETE` | `/api/scan/:scanId` | Supprimer un scan |

## Exemple - Health check

```bash
curl http://localhost:3001/api/health
```

```json
{
  "status": "ok",
  "version": "1.0.0",
  "service": "SAP DevSec Scanner",
  "lang": "fr"
}
```

## Exemple - Scanner un ZIP

```bash
curl -X POST http://localhost:3001/api/scan/upload \
  -F "project=@mon-projet.zip"
```

## Exemple - Scanner un répertoire

```bash
curl -X POST http://localhost:3001/api/scan/directory \
  -H "Content-Type: application/json" \
  -d '{"dirPath": "/home/user/mon-projet", "projectName": "mon-projet"}'
```

## Structure du rapport

```json
{
  "scanId": "uuid",
  "projectName": "my-fiori-app",
  "projectTypes": ["UI5", "CAP"],
  "scannedAt": "2026-06-15T10:00:00.000Z",
  "riskScore": 73,
  "riskLevel": "MEDIUM",
  "summary": {
    "critical": 0, "high": 2, "medium": 3, "low": 5
  }
}
```