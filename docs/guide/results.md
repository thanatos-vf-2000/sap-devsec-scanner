# Comprendre les résultats

## Score de risque global

Chaque scan produit un **score de risque de 0 à 100**, calculé en pondérant les findings par sévérité :

| Niveau | Poids | Signification |
|--------|-------|---------------|
| 🔴 CRITICAL | ×10 | Vulnérabilité exploitable immédiatement |
| 🟠 HIGH | ×5 | Risque élevé, correction urgente |
| 🟡 MEDIUM | ×2 | Risque modéré, à corriger prochainement |
| 🔵 LOW | ×1 | Risque faible, bonne pratique |
| ℹ️ INFO | ×0 | Information, pas de risque direct |

Le niveau global est ensuite déterminé ainsi :

| Score | Niveau |
|-------|--------|
| 0 | ✅ SAFE |
| 1 - 30 | 🔵 LOW |
| 31 - 60 | 🟡 MEDIUM |
| 61 - 85 | 🟠 HIGH |
| 86 - 100 | 🔴 CRITICAL |

![Rapport de scan](/screenshots/report.png)

## Structure du rapport

Le rapport est organisé en **onglets par scanner**. Chaque onglet affiche :

- Le nombre de findings par sévérité
- Le détail de chaque finding : fichier concerné, ligne, description, recommandation
