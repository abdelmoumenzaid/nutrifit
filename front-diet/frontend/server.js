const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 8080;

// Middleware pour logger toutes les requêtes
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

// Servir Angular build
app.use(express.static(path.join(__dirname, 'dist/app-diet/browser')));

// Fallback pour Angular routes
app.get('*', (req, res) => {
  console.log(`[FALLBACK] Serve index.html pour ${req.url}`);
  res.sendFile(path.join(__dirname, 'dist/app-diet/browser/index.html'));
});

// Logger démarrage serveur
app.listen(port, () => {
  console.log(`===== SERVER EXPRESS RUNNING ON PORT ${port} =====`);
});
