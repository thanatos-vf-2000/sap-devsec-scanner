'use strict';

const express = require('express');
const cors = require('cors');
const path = require('path');


// Import de la version depuis package.json
const { version } = require('./package.json');

const scanRouter = require('./routes/scan');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/scan', scanRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: version, service: 'SAP DevSec Scanner' });
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🔒 SAP DevSec Scanner`);
  console.log(`   Version: ${version}`);
  console.log(`   Backend: http://localhost:${PORT}`);
  console.log(`   API:     http://localhost:${PORT}/api`);
  console.log(`   Ready to scan SAP BTP projects\n`);
});

module.exports = app;
