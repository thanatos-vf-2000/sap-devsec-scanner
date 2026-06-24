---
layout: home

hero:
  name: "SAP DevSec Scanner"
  text: "Automated Security for SAP BTP"
  tagline: "Detect vulnerabilities in your SAPUI5/Fiori and CAP projects in seconds."
  image:
    src: /screenshots/home.png
    alt: SAP DevSec Scanner Interface
  actions:
    - theme: brand
      text: Get Started →
      link: /en/guide/installation
    - theme: alt
      text: View on GitHub
      link: https://github.com/thanatos-vf-2000/sap-devsec-scanner

features:
  - icon: 🎨
    title: UI5 Version Scanner
    details: Detects obsolete or End-of-Life SAPUI5 versions in your manifests and CDN references.
  - icon: 📦
    title: NPM Security Scanner
    details: Audits npm dependencies, detects CVEs and at-risk packages.
  - icon: ⚙️
    title: CAP Security Scanner
    details: Access control, SQL injection, CDS service security and MTA configuration.
  - icon: 🔐
    title: Secrets Scanner
    details: Hardcoded credentials, JWT tokens and exposed API keys in source code.
  - icon: ☁️
    title: BTP Destinations Scanner
    details: Analyzes SAP BTP destination and XSUAA configurations.
  - icon: 🌐
    title: AppRouter Security Scanner
    details: Analysis of AppRouter configurations.
  - icon: 📊
    title: Risk Score
    details: 0-100 score weighted by severity (CRITICAL / HIGH / MEDIUM / LOW).
---