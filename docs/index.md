---
layout: home

hero:
  name: "SAP DevSec Scanner"
  text: "Sécurité automatisée pour SAP BTP"
  tagline: "Détectez les vulnérabilités dans vos projets SAPUI5/Fiori et CAP en quelques secondes."
  image:
    src: /screenshots/home.png
    alt: SAP DevSec Scanner Interface
  actions:
    - theme: brand
      text: Démarrer →
      link: /guide/installation
    - theme: alt
      text: Voir sur GitHub
      link: https://github.com/thanatos-vf-2000/sap-devsec-scanner

features:
  - icon: 🎨
    title: UI5 Version Scanner
    details: Détecte les versions SAPUI5 obsolètes ou End of Life dans vos manifests et CDN.
  - icon: 📦
    title: NPM Security Scanner
    details: Audit des dépendances npm, détection de CVE et paquets à risque.
  - icon: ⚙️
    title: CAP Security Scanner
    details: Contrôle d'accès, injection SQL, sécurité des services CDS et MTA.
  - icon: 🔐
    title: Secrets Scanner
    details: Credentials en clair, tokens JWT et clés API exposées dans le code.
  - icon: ☁️
    title: BTP Destinations Scanner
    details: Analyse des configurations XSUAA et destinations SAP BTP.
  - icon: 🌐
    title: AppRouter Security Scanner
    details: Analyse des configurations AppRouter.
  - icon: 📊
    title: Score de risque
    details: Score 0-100 pondéré par sévérité (CRITICAL / HIGH / MEDIUM / LOW).
---