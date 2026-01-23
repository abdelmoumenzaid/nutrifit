const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 8080;

// Servir le build Angular
app.use(express.static(path.join(__dirname, 'dist/app-diet/browser')));

// Fallback pour Angular (toutes les routes renvoient index.html)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/app-diet/browser/index.html'));
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
