# Understanding Results

## Global risk score

Each scan produces a **risk score from 0 to 100**, calculated by weighting findings by severity:

| Level | Weight | Meaning |
|-------|--------|---------|
| 🔴 CRITICAL | ×10 | Immediately exploitable vulnerability |
| 🟠 HIGH | ×5 | High risk, urgent fix required |
| 🟡 MEDIUM | ×2 | Moderate risk, fix soon |
| 🔵 LOW | ×1 | Low risk, best practice |
| ℹ️ INFO | ×0 | Informational, no direct risk |

The overall level is determined as follows:

| Score | Level |
|-------|-------|
| 0 | ✅ SAFE |
| 1 - 30 | 🔵 LOW |
| 31 - 60 | 🟡 MEDIUM |
| 61 - 85 | 🟠 HIGH |
| 86 - 100 | 🔴 CRITICAL |

![Scan report](/screenshots/report.png)

## Report structure

The report is organized into **tabs per scanner**. Each tab shows:

- The number of findings by severity
- Finding details: affected file, line number, description, recommendation

