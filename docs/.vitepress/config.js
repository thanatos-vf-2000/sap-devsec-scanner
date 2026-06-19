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
              { text: 'Lancer un scan', link: '/guide/utilisation' },
              { text: 'Comprendre les résultats', link: '/guide/resultats' },
            ]
          },
          {
            text: 'Référence',
            items: [
              { text: 'API REST', link: '/guide/api' },
              { text: 'Scanners', link: '/guide/scanners' },
            ]
          }
        ],
        docFooter: { prev: 'Page précédente', next: 'Page suivante' },
        outline: { label: 'Sur cette page' },
        lastUpdated: { text: 'Mis à jour le' },
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
            ]
          },
          {
            text: 'Reference',
            items: [
              { text: 'REST API', link: '/en/guide/api' },
              { text: 'Scanners', link: '/en/guide/scanners' },
            ]
          }
        ],
        docFooter: { prev: 'Previous page', next: 'Next page' },
        outline: { label: 'On this page' },
        lastUpdated: { text: 'Last updated' },
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