const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs-extra');

const createVideo = (audioPath, imagePath, outputPath, io, socketId) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Garantir que a pasta output existe
      const outputDir = path.dirname(outputPath);
      fs.ensureDirSync(outputDir);

      console.log('🎬 Iniciando conversão...');
      console.log('🎵 Áudio:', audioPath);
      console.log('🖼️ Imagem:', imagePath);
      console.log('📹 Output:', outputPath);

      // Verificar se os arquivos existem
      if (!fs.existsSync(audioPath)) {
        return reject(new Error(`Arquivo de áudio não encontrado: ${audioPath}`));
      }
      if (!fs.existsSync(imagePath)) {
        return reject(new Error(`Arquivo de imagem não encontrado: ${imagePath}`));
      }

      // Obter duração do áudio para calcular progresso
      const audioInfo = await getAudioDuration(audioPath);
      const totalDuration = audioInfo.duration;
      console.log('⏱️ Duração do áudio:', totalDuration, 'segundos');

      // Emitir início da conversão
      if (io && socketId) {
        io.to(socketId).emit('conversion-progress', {
          status: 'started',
          progress: 0,
          message: 'Iniciando conversão...',
          totalDuration: totalDuration
        });
      }

      const command = ffmpeg()
        .input(imagePath)
        .inputOptions([
          '-loop 1',
          '-framerate 1'
        ])
        .input(audioPath)
        .outputOptions([
          '-c:v libx264',
          '-tune stillimage',
          '-c:a aac',
          '-b:a 192k',
          '-pix_fmt yuv420p',
          '-shortest',
          '-fflags +shortest',
          '-max_interleave_delta 100M',
          '-y'
        ])
        .output(outputPath)
        .on('start', (commandLine) => {
          console.log('🚀 Comando FFmpeg:', commandLine);
        })
        .on('progress', (progress) => {
          let percent = 0;
          let currentTime = 0;

          // Calcular progresso baseado no tempo processado
          if (progress.timemark && totalDuration) {
            // Converter timemark (HH:MM:SS.ms) para segundos
            const timeString = progress.timemark;
            const timeParts = timeString.split(':');
            if (timeParts.length === 3) {
              const hours = parseInt(timeParts[0]) || 0;
              const minutes = parseInt(timeParts[1]) || 0;
              const seconds = parseFloat(timeParts[2]) || 0;
              currentTime = hours * 3600 + minutes * 60 + seconds;
              percent = Math.min(Math.round((currentTime / totalDuration) * 100), 99);
            }
          }

          // Se o FFmpeg reportar porcentagem diretamente, usar essa
          if (progress.percent && progress.percent > 0) {
            percent = Math.min(Math.round(progress.percent), 99);
          }

          console.log('⏳ Progresso:', percent + '%');
          console.log('⏰ Tempo processado:', progress.timemark || 'N/A');

          // Emitir progresso via WebSocket
          if (io && socketId) {
            io.to(socketId).emit('conversion-progress', {
              status: 'converting',
              progress: percent,
              message: `Convertendo... ${percent}%`,
              timemark: progress.timemark,
              currentTime: currentTime,
              totalDuration: totalDuration
            });
          }
        })
        .on('stderr', (stderrLine) => {
          if (stderrLine.includes('time=') || stderrLine.includes('bitrate=') || stderrLine.includes('frame=')) {
            console.log('📝 FFmpeg:', stderrLine);
          }
        })
        .on('end', () => {
          console.log('✅ Conversão concluída!');
          
          if (fs.existsSync(outputPath)) {
            const stats = fs.statSync(outputPath);
            console.log('📊 Tamanho do arquivo:', (stats.size / 1024 / 1024).toFixed(2), 'MB');
            
            // Emitir conclusão via WebSocket
            if (io && socketId) {
              io.to(socketId).emit('conversion-progress', {
                status: 'completed',
                progress: 100,
                message: 'Conversão concluída!',
                fileSize: (stats.size / 1024 / 1024).toFixed(2) + ' MB'
              });
            }
            
            if (stats.size > 1000) {
              resolve(outputPath);
            } else {
              reject(new Error('Arquivo de vídeo criado mas está muito pequeno (possível erro)'));
            }
          } else {
            reject(new Error('Arquivo de vídeo não foi criado'));
          }
        })
        .on('error', (err) => {
          console.error('❌ Erro FFmpeg:', err.message);
          
          // Emitir erro via WebSocket
          if (io && socketId) {
            io.to(socketId).emit('conversion-progress', {
              status: 'error',
              progress: 0,
              message: 'Erro na conversão: ' + err.message
            });
          }
          
          reject(err);
        });

      command.run();

    } catch (error) {
      console.error('❌ Erro geral:', error);
      
      // Emitir erro via WebSocket
      if (io && socketId) {
        io.to(socketId).emit('conversion-progress', {
          status: 'error',
          progress: 0,
          message: 'Erro: ' + error.message
        });
      }
      
      reject(error);
    }
  });
};

// Função para obter duração do áudio
const getAudioDuration = (audioPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(audioPath, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        const duration = metadata.format.duration;
        const bitrate = metadata.format.bit_rate;
        
        console.log('📊 Info do áudio:');
        console.log('   ⏱️ Duração:', duration, 'segundos');
        console.log('   📡 Bitrate:', bitrate);
        console.log('   📁 Tamanho:', (metadata.format.size / 1024 / 1024).toFixed(2), 'MB');
        
        resolve({ duration, bitrate, size: metadata.format.size });
      }
    });
  });
};

// Teste do FFmpeg
const testFFmpeg = () => {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .getAvailableFormats((err, formats) => {
        if (err) {
          reject(err);
        } else {
          console.log('✅ FFmpeg disponível com', Object.keys(formats).length, 'formatos');
          resolve(true);
        }
      });
  });
};

module.exports = {
  createVideo,
  testFFmpeg,
  getAudioDuration
};
