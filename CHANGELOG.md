# CHANGELOG

<!-- version list -->
## v1.5.0 (2026-08-08)
- NPM frontend update dependencies version:
  - @fortawesome/fontawesome-free: 7.2.0 => 7.3.1
  - vue: 3.5.32 => 3.5.41
  - vue-i18n: 11.4.5 => 11.4.8
  - vue-router: 5.1.0 => 5.2.0
- NPM frontend update DevDependencies version:
  - @vitejs/plugin-vue: 6.0.6 => 6.0.8
  - concurrently: 10.0.3 => 10.0.4
  - vite: 8.1.1 => 8.2.1
  - vite-plugin-vue-devtools: 8.1.1 => 8.2.1
- NPM backend update dependencies version:
  - adm-zip: 0.5.10 => 0.6.0
  - express: 4.18.2 => 5.2.1
  - glob: 10.3.10 => 13.0.6
  - multer: 1.4.5-lts.1 => 2.2.0
  - uuid: 9.0.0 => 14.0.1
- Backend: Update vite.config.js for solve Your Vite config uses features that are unsupported by `configLoader: 'native'`, which is planned to become the default in a future major version of Vite,
- Add npn check last version,
- Update Documentation.

## v1.4.1 (2026-07-03)
- Update Workflow release.yml.

## v1.4.0 (2026-07-03)
- In ui5Scanner, dynamic version management from https://ui5.sap.com/, if available,
- Add API /api/sap/ui5/version,
- Add API /api/sap/ui5/resources/x.xxx.x,
- Add new GitHub Workflow release.yml tu push ui5.zip on tag release x.x.x,
- Add page 404 for error,
- Add page UI5 version Details when you select UI5 version on Report,
- Add Cache for Version Download from ui5.sap.com
- Update Documentation.

## v1.3.0 (2026-06-26)
- Enable / Disable Vue DevTools (ENABLE_DEVTOOLS=true/false),
- Update Secret Scanner: SECRET_KEY / SECRET_PRIVATE_KEY / SECRET_XSUAA / SECRET_HDI_USER / SECRET_HDI_PASSWORD,
- Update UI5 Scanner: 
  - Update UI5_SECURITY_PATTERNS,
  - Add REDIRECT_PATTERNS / SENSITIVE_DATA_PATTERNS / OWASP_PATTERNS / SAP_SPECIFIC_PATTERNS,
- Add file .jsx and .tsx' to scan,
- Add Scanner for AppRouter,
- Update BTP Scanner,
- Update CAP Scanner,
- Update NPM Scanner,
- Update Secret Scanner,
- Update Documentation,
- Update UI5 supported version.

## v1.2.2 (2026-06-21)
- Security and Quality - Uncontrolled data used in path expression - utils/fileParser.js:104,
- Security and Quality - Uncontrolled data used in path expression - routes/scan.js:131,
- Security and Quality - Uncontrolled data used in path expression - utils/fileParser.js:89.

## v1.2.1 (2026-06-21)
- Update README,
- backend: update size limit 10mb to 250mb (Max file Upload),
- Security and Quality - Code scanning - Missing rate limiting #8
- Security and Quality - Uncontrolled data used in path expression - routes/scan.js #9
- Security and Quality - Uncontrolled data used in path expression - utils/fileParser.js #10 / #11 / #12
- Correction - Load vue History not refresh,
- Correction - Report UI5 - Display End of Maintenance,
- Report UI5 - Highlighting "Your version",
- Frontend - Add Footer on APP.vue / Add humans informations (authors and maintainers) to AboutView.vue,
- Backend - CAP Scanner:
  - Bug 1 - @requires in the CDS_AUTH_PATTERNS regex:  without @, because it is already included in the enclosing @(...) annotation,
  - Bug 2 - parseCDSServices searches for @requires and @restrict in the raw context,
  - Correction in CDS_AUTH_PATTERNS to account for cases with and without @,
  - Correction to exclude annotate in searches for @requires and @restrict.
- Backend - BTP Scanner:
  - Bug 1 - Destination: ui5.sap.com: Ignored,
  - Bug 2 - Destination: srv-api/srv-url & HTML5.ForwardAuthToken = true: Add LOW BTP_MTA_NO_AUTH_FORWARD,
  - Bug 3 - Other Destination: HIGH BTP_MTA_NO_AUTH.

## v1.2.0 (2026-06-20)
- Add documentation gh-pages,
- Add commit message to master,
- Update Licence to Apache License version 2.0,
- Add using free Font Awesome (https://fontawesome.com/),
- Correction UI5Tabs Display.

## v1.1.0 (2026-06-15)
- Add New branch dev on Github and add workflow to push on master,
- move frontend/index.html to Vue (vitejs).

## v1.0.0 (2026-06-13)
- Initial version
