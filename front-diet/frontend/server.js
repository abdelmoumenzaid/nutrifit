const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Servir le build Angular
app.use(express.static(path.join(__dirname, 'dist/app-diet/browser')));

// Toutes les autres routes → index.html pour Angular
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/app-diet/browser/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
