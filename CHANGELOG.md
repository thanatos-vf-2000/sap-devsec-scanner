# CHANGELOG

<!-- version list -->
## v1.3.0 (2026-06-xx)
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
