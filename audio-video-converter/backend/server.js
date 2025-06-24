require('./src/app');
const express = require('express');
const cors = require('cors');
const path = require('path');
const videoRoutes = require('./src/routes/videoRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (vídeos gerados)
app.use('/output', express.static(path.join(__dirname, 'output')));

// Rotas
app.use('/api', videoRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'Audio to Video Converter API - Running!' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📁 Acesse: http://localhost:${PORT}`);
});

module.exports = app;
