'use strict';

// Backend i18n messages (used for API error messages and server-side strings)
// Language is determined by the Accept-Language header (see server.js middleware)

const messages = {
  fr: {
    errors: {
      noFile: 'Aucun fichier fourni',
      noFilesInZip: 'Aucun fichier analysable trouvé dans le ZIP',
      dirRequired: 'Le paramètre dirPath est requis',
      dirNotFound: (dir) => `Répertoire introuvable : ${dir}`,
      noFilesInDir: 'Aucun fichier analysable trouvé dans le répertoire',
      scanError: 'Erreur lors du scan',
      notFound: 'Scan introuvable',
    },
    scan: {
      started: 'Scan démarré',
      complete: 'Scan terminé',
    },
  },
  en: {
    errors: {
      noFile: 'No file provided',
      noFilesInZip: 'No scannable files found in ZIP',
      dirRequired: 'dirPath parameter is required',
      dirNotFound: (dir) => `Directory not found: ${dir}`,
      noFilesInDir: 'No scannable files found in directory',
      scanError: 'Scan error',
      notFound: 'Scan not found',
    },
    scan: {
      started: 'Scan started',
      complete: 'Scan complete',
    },
  },
};

module.exports = messages;
