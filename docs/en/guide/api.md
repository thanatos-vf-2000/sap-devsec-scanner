# REST API

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Server status |
| `POST` | `/api/scan/upload` | Scan a ZIP file |
| `POST` | `/api/scan/directory` | Scan a local directory |
| `GET` | `/api/scan/history` | Session scan history |
| `GET` | `/api/scan/:scanId` | Full scan report |
| `DELETE` | `/api/scan/:scanId` | Delete a scan |

## Example - Health check

```bash
curl http://localhost:3001/api/health
```

```json
{
  "status": "ok",
  "version": "1.0.0",
  "service": "SAP DevSec Scanner",
  "lang": "en"
}
```

## Example - Scan a ZIP

```bash
curl -X POST http://localhost:3001/api/scan/upload \
  -F "project=@my-project.zip"
```

## Example - Scan a directory

```bash
curl -X POST http://localhost:3001/api/scan/directory \
  -H "Content-Type: application/json" \
  -d '{"dirPath": "/home/user/my-project", "projectName": "my-project"}'
```

## Report structure

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