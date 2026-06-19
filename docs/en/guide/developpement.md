# Developpement

## Prerequisites

- **Node.js** ≥ 23
- **npm** ≥ 11

## Project Structure

>The project source code is available only in the **dev** branch.

```
Root/
├── backend/           # Server Express (API + frontend server)
├── frontend/          # Sources Vue.js (Frontend developpement)
└── docs/              # Github documentation  (https://thanatos-vf-2000.github.io/sap-devsec-scanner/)
```

## Clone the repository

```bash
git clone https://github.com/thanatos-vf-2000/sap-devsec-scanner.git
cd sap-devsec-scanner
git switch dev
```

## Install backend dependencies

```bash
cd backend
npm install
```

## Install frontend dependencies

```bash
cd frontend
npm install
```

## Development mode - Frontend

```bash
cd frontend
npm run dev
# → http://localhost:5173
```

## Development mode - Backend

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

The interface is automatically displayed in **French** or **English** depending on the language configured in the browser.

### Frontend (Vue.js)

The language is detected upon loading via `navigator.language` in `src/i18n/index.js`:

```js
function detectLang() {
  const lang = navigator.language || navigator.userLanguage || 'en';
  return lang.toLowerCase().startsWith('fr') ? 'fr' : 'en';
}
```

All strings in the interface are centralized in this file. To add a language:
1. Add an `xx: { ... }` block to `messages`
2. Extend the `detectLang()` logic

### Backend (Express.js)

The backend detects the language via the `Accept-Language` HTTP header (sent automatically by the browser) :

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

API error messages are translated via `backend/utils/i18n.js`.

## Contributions

Contributions are welcome! To suggest an improvement:

1. Fork the **dev** branch of the repository
2. Create a branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m ‘feat: add ...’`)
4. Push the branch (`git push origin feature/my-feature`)
5. Open a pull request