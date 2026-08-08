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



## Vérification des versions NPM

L'onglet **NPM** compare les dépendances avec la dernière version publiée sur npm. La version de référence est prioritairement celle du lockfile lorsqu'il est présent.

| Écart | Sévérité | Code |
|---|---|---|
| Majeur (`x` → `y`) | 🔴 HIGH | `NPM_OUTDATED` |
| Mineur (`x.y` → `x.z`) | 🟡 MEDIUM | `NPM_OUTDATED` |
| Correctif (`x.y.z` → `x.y.w`) | 🔵 LOW | `NPM_OUTDATED` |

Le tableau des mises à jour indique la version courante, la dernière version disponible et la source de la version utilisée pour la comparaison.

## ui5 Version

Affiche de detail de la version ui5 x.x.x avec les données issue de https://ui5.sap.com/ :

- Librairies,
- Composants,
- Themes.