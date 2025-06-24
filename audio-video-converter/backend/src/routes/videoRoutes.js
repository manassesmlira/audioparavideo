const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const videoController = require('../controllers/videoController');
const { testFFmpeg } = require('../services/ffmpegService');

// Rota para testar FFmpeg
router.get('/test-ffmpeg', async (req, res) => {
  try {
    await testFFmpeg();
    res.json({ success: true, message: 'FFmpeg está funcionando corretamente!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro no FFmpeg', error: error.message });
  }
});

// Rota para converter áudio + imagem em vídeo
router.post('/convert', 
  upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'image', maxCount: 1 }
  ]), 
  videoController.convertToVideo
);

// Rota para download do vídeo
router.get('/download/:filename', videoController.downloadVideo);

module.exports = router;
