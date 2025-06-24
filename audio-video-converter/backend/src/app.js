const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use('/output', express.static(path.join(__dirname, '../output')));

// Criar pastas necessárias
const createDirectories = async () => {
  const dirs = [
    path.join(__dirname, '../uploads/audio'),
    path.join(__dirname, '../uploads/images'),
    path.join(__dirname, '../output')
  ];
  
  for (const dir of dirs) {
    await fs.ensureDir(dir);
  }
};

createDirectories();

// Disponibilizar io para as rotas
app.use((req, res, next) => {
  req.io = io;
  next();
});

// WebSocket para progresso em tempo real
io.on('connection', (socket) => {
  console.log('🔌 Cliente conectado:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('🔌 Cliente desconectado:', socket.id);
  });
});

// Rotas
const videoRoutes = require('./routes/videoRoutes');
app.use('/api', videoRoutes);

// Rota básica
app.get('/', (req, res) => {
  res.json({ 
    message: 'Audio to Video Converter API',
    status: 'running',
    endpoints: {
      convert: 'POST /api/convert',
      download: 'GET /api/download/:filename',
      test: 'GET /api/test-ffmpeg'
    }
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`📁 Servidor rodando na porta ${PORT}`);
  console.log(`📁 Acesse: http://localhost:${PORT}`);
});

module.exports = { app, io };
