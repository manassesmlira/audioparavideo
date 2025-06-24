const path = require('path');
const fs = require('fs-extra');
const { createVideo } = require('../services/ffmpegService');

const convertToVideo = async (req, res) => {
  try {
    console.log('📁 Arquivos recebidos:');
    
    if (!req.files || !req.files.audio || !req.files.image) {
      return res.status(400).json({ 
        success: false, 
        message: 'Por favor, envie um arquivo de áudio e uma imagem' 
      });
    }

    const audioFile = req.files.audio[0];
    const imageFile = req.files.image[0];
    const socketId = req.body.socketId; // Receber socketId do frontend

    console.log('🎵 Áudio:', audioFile.filename);
    console.log('🖼️ Imagem:', imageFile.filename);
    console.log('🔌 Socket ID:', socketId);

    // Caminhos dos arquivos
    const audioPath = audioFile.path;
    const imagePath = imageFile.path;
    
    // Nome do arquivo de saída
    const timestamp = Date.now();
    const videoFilename = `video_${timestamp}.mp4`;
    const outputPath = path.join(__dirname, '../../output', videoFilename);

    // Converter usando o serviço FFmpeg com WebSocket
    const videoPath = await createVideo(audioPath, imagePath, outputPath, req.io, socketId);
    
    console.log('✅ Vídeo gerado:', videoFilename);

    // Limpar arquivos temporários após um tempo
    setTimeout(async () => {
      try {
        await fs.remove(audioPath);
        await fs.remove(imagePath);
        console.log('🧹 Arquivos temporários removidos');
      } catch (error) {
        console.error('⚠️ Erro ao limpar arquivos temporários:', error);
      }
    }, 10000); // 10 segundos

    res.json({
      success: true,
      message: 'Vídeo convertido com sucesso!',
      videoUrl: `/api/download/${videoFilename}`,
      filename: videoFilename
    });

  } catch (error) {
    console.error('❌ Erro na conversão:', error);
    
    // Emitir erro via WebSocket se disponível
    const socketId = req.body.socketId;
    if (req.io && socketId) {
      req.io.to(socketId).emit('conversion-progress', {
        status: 'error',
        progress: 0,
        message: 'Erro na conversão: ' + error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro na conversão',
      error: error.message
    });
  }
};

const downloadVideo = async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../../output', filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        success: false, 
        message: 'Arquivo não encontrado' 
      });
    }

    // Definir headers para download
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'video/mp4');

    // Stream do arquivo
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    // Limpar arquivo após download (opcional)
    fileStream.on('end', () => {
      setTimeout(async () => {
        try {
          await fs.remove(filePath);
          console.log('🧹 Arquivo de vídeo removido após download:', filename);
        } catch (error) {
          console.error('⚠️ Erro ao remover arquivo após download:', error);
        }
      }, 5000); // 5 segundos após o download
    });

  } catch (error) {
    console.error('❌ Erro no download:', error);
    res.status(500).json({
      success: false,
      message: 'Erro no download',
      error: error.message
    });
  }
};

module.exports = {
  convertToVideo,
  downloadVideo
};
