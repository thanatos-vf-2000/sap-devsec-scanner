import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'SAP DevSec Scanner',
  description: 'Outil de sécurité pour projets SAP BTP',
  base: '/sap-devsec-scanner/',

  locales: {
    root: {
      label: 'Français',
      lang: 'fr-FR',
      title: 'SAP DevSec Scanner',
      description: 'Outil de sécurité pour projets SAP BTP (CAP, UI5/Fiori, MTA, XSUAA)',
      themeConfig: {
        nav: [
          { text: 'Guide', link: '/guide/installation' },
          { text: 'Utilisation', link: '/guide/usage' },
          { text: 'Scanners', link: '/guide/scanners' },
          { text: 'API', link: '/guide/api' },
          { text: 'GitHub', link: 'https://github.com/thanatos-vf-2000/sap-devsec-scanner' }
        ],
        sidebar: [
          {
            text: 'Démarrage',
            items: [
              { text: 'Présentation', link: '/' },
              { text: 'Installation', link: '/guide/installation' },
              { text: 'Développement', link: '/guide/developpement' },
            ]
          },
          {
            text: 'Utilisation',
            items: [
              { text: 'Lancer un scan', link: '/guide/usage' },
              { text: 'Comprendre les résultats', link: '/guide/results' },
              { text: 'Exemples', link: '/guide/examples' },
            ]
          },
          {
            text: 'Référence',
            items: [
              { text: 'API REST', link: '/guide/api' },
              { text: 'Vue d\'ensemble des scanners', link: '/guide/scanners' },
            ]
          },
          {
            text: 'Aide par scanner',
            items: [
              { text: 'UI5 Version Scanner', link: '/guide/scanners#ui5-version-scanner' },
              { text: 'UI5 Code Scanner', link: '/guide/scanners#ui5-code-scanner' },
              { text: 'NPM Security Scanner', link: '/guide/scanners#npm-security-scanner' },
              { text: 'CAP Security Scanner', link: '/guide/scanners#cap-security-scanner' },
              { text: 'Secrets Scanner', link: '/guide/scanners#secrets-scanner' },
              { text: 'BTP Destinations Scanner', link: '/guide/scanners#btp-destinations-scanner' },
              { text: 'AppRouter Scanner', link: '/guide/scanners#approuter-security-scanner' },
            ]
          },
          { text: 'Version', link: '/changelog' }
        ],
        docFooter: { prev: 'Page précédente', next: 'Page suivante' },
        outline: { label: 'Sur cette page', level: [2, 3] },
        lastUpdated: { text: 'Mis à jour le', formatOptions: { dateStyle: 'full', timeStyle: 'medium' } },
        darkModeSwitchLabel: 'Apparence',
        sidebarMenuLabel: 'Menu',
        returnToTopLabel: 'Retour en haut',
      }
    },

    en: {
      label: 'English',
      lang: 'en-US',
      link: '/en/',
      title: 'SAP DevSec Scanner',
      description: 'Security tool for SAP BTP projects (CAP, UI5/Fiori, MTA, XSUAA)',
      themeConfig: {
        nav: [
          { text: 'Guide', link: '/en/guide/installation' },
          { text: 'Usage', link: '/en/guide/usage' },
          { text: 'Scanners', link: '/en/guide/scanners' },
          { text: 'API', link: '/en/guide/api' },
          { text: 'GitHub', link: 'https://github.com/thanatos-vf-2000/sap-devsec-scanner' }
        ],
        sidebar: [
          {
            text: 'Getting Started',
            items: [
              { text: 'Overview', link: '/en/' },
              { text: 'Installation', link: '/en/guide/installation' },
              { text: 'Development', link: '/en/guide/developpement' },
            ]
          },
          {
            text: 'Usage',
            items: [
              { text: 'Running a scan', link: '/en/guide/usage' },
              { text: 'Understanding results', link: '/en/guide/results' },
              { text: 'Examples', link: '/guide/examples' },
            ]
          },
          {
            text: 'Reference',
            items: [
              { text: 'REST API', link: '/en/guide/api' },
              { text: 'Scanners overview', link: '/en/guide/scanners' },
            ]
          },
          {
            text: 'Scanner help',
            items: [
              { text: 'UI5 Version Scanner', link: '/en/guide/scanners#ui5-version-scanner' },
              { text: 'UI5 Code Scanner', link: '/en/guide/scanners#ui5-code-scanner' },
              { text: 'NPM Security Scanner', link: '/en/guide/scanners#npm-security-scanner' },
              { text: 'CAP Security Scanner', link: '/en/guide/scanners#cap-security-scanner' },
              { text: 'Secrets Scanner', link: '/en/guide/scanners#secrets-scanner' },
              { text: 'BTP Destinations Scanner', link: '/en/guide/scanners#btp-destinations-scanner' },
              { text: 'AppRouter Scanner', link: '/en/guide/scanners#approuter-security-scanner' },
            ]
          },
          { text: 'Version', link: 'en/changelog' }
        ],
        docFooter: { prev: 'Previous page', next: 'Next page' },
        outline: { label: 'On this page', level: [2, 3] },
        lastUpdated: { text: 'Last updated', formatOptions: { dateStyle: 'full', timeStyle: 'medium' } },
      }
    }
  },

  themeConfig: {
    logo: '/logo.png',
    socialLinks: [
      { icon: 'github', link: 'https://github.com/thanatos-vf-2000/sap-devsec-scanner' }
    ],
    footer: {
      message: 'Open-source project - Apache-2.0 license',
      copyright: 'SAP DevSec Scanner - Not affiliated with SAP SE'
    },
    search: { provider: 'local' }
  }
})
