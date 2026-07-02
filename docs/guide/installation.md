# Installation

## Prérequis

- **Node.js** ≥ 23
- **npm** ≥ 11

## Cloner le dépôt

```bash
git clone https://github.com/thanatos-vf-2000/sap-devsec-scanner.git
cd sap-devsec-scanner
```

## Installer les dépendances

```bash
npm install
```

## Fichier ui5.zip

- Télécharger depuis https://github.com/thanatos-vf-2000/sap-devsec-scanner/releases le fichier ui5.zip de la dernière version,
- Placer le fichier dans le repertoir sap-devsec-scanner.

> La mise en place du fichier ui5.zip n'est pas obligatoir si le service peut se connecter à https://ui5.sap.com/.


## Lancer l'application

```bash
# Production
npm start
# → http://localhost:3001
```

![Interface principale](/screenshots/home.png)
