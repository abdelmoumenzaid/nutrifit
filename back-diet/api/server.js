// // server.js
// const express = require('express');
// const path = require('path');
// const app = express();

// const PORT = 3001;

// // Serve images statiquement depuis public/images
// app.use('/api/images', express.static(path.join(__dirname, 'public/images')));

// // Route test
// app.get('/api/health', (req, res) => {
//   res.json({ 
//     status: 'OK', 
//     images: 'http://localhost:3000/api/images/msemen-miel.jpg' 
//   });
// });

// app.listen(PORT, () => {
//   console.log(`🚀 API Images: http://localhost:${PORT}/api/images/`);
//   console.log(`📱 Test: http://localhost:${PORT}/api/health`);
// });
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Exposer les images
app.use('/api/images', express.static(path.join(__dirname, 'public/images')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    images: `http://localhost:${PORT}/api/images/msemen-miel.jpg`
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Images API running`);
  console.log(`📂 Images: http://localhost:${PORT}/api/images/`);
  console.log(`❤️ Health: http://localhost:${PORT}/api/health`);
});
