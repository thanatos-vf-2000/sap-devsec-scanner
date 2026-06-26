# Developpement

## Prérequis

- **Node.js** ≥ 23
- **npm** ≥ 11

## Structure du projet

>Source du projet uniquement disponible dans la branche **dev**.

```
Racine/
├── backend/           # Serveur Express (API + serveur du frontend buildé)
├── frontend/          # Sources Vue.js (développement du frontend)
└── docs/              # Documentation github (https://thanatos-vf-2000.github.io/sap-devsec-scanner/)
```

## Cloner le dépôt

```bash
git clone https://github.com/thanatos-vf-2000/sap-devsec-scanner.git
cd sap-devsec-scanner
git switch dev
```

## Installer les dépendances backend

```bash
cd backend
npm install
```

## Installer les dépendances frontend

```bash
cd frontend
npm install
```

## Mode développement - Frontend

> **Information**
>
> Utiliser la variable d'environnement ENABLE_DEVTOOLS à true pour activer Vue DevTools (`http://localhost:5173/__devtools__/`).
>
>**export ENABLE_DEVTOOLS=true**

```bash
cd frontend
npm run dev
# → http://localhost:5173
```

## Mode développement - Backend

```bash
# Build - Frontend Vue
cd frontend
npm run build

# Start - Backend
cd backend
npm run dev
# → http://localhost:3001
```

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

## Contribution

Les contributions sont les bienvenues ! Pour proposer une amélioration :

1. Forker le dépôt branche **dev**
2. Créer une branche (`git checkout -b feature/ma-feature`)
3. Commiter vos changements (`git commit -m 'feat: ajouter ...'`)
4. Pousser la branche (`git push origin feature/ma-feature`)
5. Ouvrir une Pull Request