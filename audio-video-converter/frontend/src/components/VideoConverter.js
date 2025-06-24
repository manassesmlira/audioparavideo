import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import io from 'socket.io-client';
import Footer from './footer.js';

const VideoConverter = () => {
  const [audioFile, setAudioFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [socket, setSocket] = useState(null);

  // Conectar ao WebSocket quando o componente montar
  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Escutar progresso da conversão
    newSocket.on('conversion-progress', (data) => {
      console.log('📡 Progresso recebido:', data);
      
      setProgress(data.progress);
      setProgressMessage(data.message);
      
      if (data.status === 'completed') {
        setIsConverting(false);
      } else if (data.status === 'error') {
        setIsConverting(false);
        alert('Erro na conversão: ' + data.message);
      }
    });

    // Cleanup ao desmontar o componente
    return () => {
      newSocket.close();
    };
  }, []);

  const onAudioDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setAudioFile(file);
    }
  }, []);

  const onImageDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setImageFile(file);
    }
  }, []);

  const {
    getRootProps: getAudioRootProps,
    getInputProps: getAudioInputProps,
    isDragActive: isAudioDragActive
  } = useDropzone({
    onDrop: onAudioDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.aac']
    },
    multiple: false
  });

  const {
    getRootProps: getImageRootProps,
    getInputProps: getImageInputProps,
    isDragActive: isImageDragActive
  } = useDropzone({
    onDrop: onImageDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.bmp']
    },
    multiple: false
  });

  const handleConvert = async () => {
    if (!audioFile || !imageFile) {
      alert('Por favor, selecione um arquivo de áudio e uma imagem');
      return;
    }

    if (!socket) {
      alert('Conexão WebSocket não estabelecida');
      return;
    }

    setIsConverting(true);
    setProgress(0);
    setProgressMessage('Preparando conversão...');
    setVideoUrl('');

    try {
      const formData = new FormData();
      formData.append('audio', audioFile);
      formData.append('image', imageFile);
      formData.append('socketId', socket.id); // Enviar socket ID

      const response = await axios.post('http://localhost:5000/api/convert', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('✅ Resposta da conversão:', response.data);

      if (response.data.success) {
        setVideoUrl(response.data.videoUrl);
        setProgressMessage('✅ Conversão concluída! Clique para baixar.');
        setProgress(100);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('❌ Erro na conversão:', error);
      setProgressMessage('❌ Erro na conversão: ' + (error.response?.data?.message || error.message));
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (videoUrl) {
      window.open(`http://localhost:5000${videoUrl}`, '_blank');
    }
  };

  const resetForm = () => {
    setAudioFile(null);
    setImageFile(null);
    setIsConverting(false);
    setProgress(0);
    setProgressMessage('');
    setVideoUrl('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          🎵➡️🎬 Audio para Vídeo
        </h1>
        
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 shadow-2xl">
          
          {/* Upload de Áudio */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">
              🎵 Arquivo de Áudio
            </h2>
            <div
              {...getAudioRootProps()}
              className={`border-2 border-dashed p-8 rounded-lg text-center cursor-pointer transition-all ${
                isAudioDragActive
                  ? 'border-blue-400 bg-blue-500/20'
                  : audioFile
                  ? 'border-green-400 bg-green-500/20'
                  : 'border-gray-400 bg-gray-500/10 hover:bg-gray-500/20'
              }`}
            >
              <input {...getAudioInputProps()} />
              {audioFile ? (
                <div className="text-green-300">
                  ✅ {audioFile.name}
                  <br />
                  <span className="text-sm text-gray-300">
                    {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              ) : (
                <div className="text-gray-300">
                  {isAudioDragActive ? (
                    <p>📁 Solte o arquivo de áudio aqui...</p>
                  ) : (
                    <div>
                      <p>🎵 Arraste um arquivo de áudio aqui</p>
                      <p className="text-sm mt-2">ou clique para selecionar</p>
                      <p className="text-xs mt-2 text-gray-400">
                        Formatos: MP3, WAV, M4A, AAC
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Upload de Imagem */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">
              🖼️ Imagem de Fundo
            </h2>
            <div
              {...getImageRootProps()}
              className={`border-2 border-dashed p-8 rounded-lg text-center cursor-pointer transition-all ${
                isImageDragActive
                  ? 'border-pink-400 bg-pink-500/20'
                  : imageFile
                  ? 'border-green-400 bg-green-500/20'
                  : 'border-gray-400 bg-gray-500/10 hover:bg-gray-500/20'
              }`}
            >
              <input {...getImageInputProps()} />
              {imageFile ? (
                <div className="text-green-300">
                  ✅ {imageFile.name}
                  <br />
                  <span className="text-sm text-gray-300">
                    {(imageFile.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                  {imageFile.type.startsWith('image/') && (
                    <div className="mt-4">
                      <img
                        src={URL.createObjectURL(imageFile)}
                        alt="Preview"
                        className="max-w-48 max-h-32 mx-auto rounded-lg shadow-lg"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-300">
                  {isImageDragActive ? (
                    <p>📁 Solte a imagem aqui...</p>
                  ) : (
                    <div>
                      <p>🖼️ Arraste uma imagem aqui</p>
                      <p className="text-sm mt-2">ou clique para selecionar</p>
                      <p className="text-xs mt-2 text-gray-400">
                        Formatos: JPG, PNG, GIF, BMP
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Progresso */}
          {(isConverting || progress > 0) && (
            <div className="mb-8">
              <div className="bg-gray-700 rounded-full h-4 mb-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-300 flex items-center justify-center"
                  style={{ width: `${progress}%` }}
                >
                  {progress > 20 && (
                    <span className="text-xs text-white font-bold">
                      {progress}%
                    </span>
                  )}
                </div>
              </div>
              <p className="text-center text-gray-300 text-sm">
                {progressMessage}
              </p>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleConvert}
              disabled={!audioFile || !imageFile || isConverting}
              className={`px-8 py-3 rounded-lg font-semibold text-white transition-all ${
                !audioFile || !imageFile || isConverting
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {isConverting ? '⏳ Convertendo...' : '🎬 Converter para Vídeo'}
            </button>

            {videoUrl && (
              <button
                onClick={handleDownload}
                className="px-8 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all"
              >
                ⬇️ Baixar Vídeo
              </button>
            )}

            <button
              onClick={resetForm}
              className="px-8 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 shadow-lg hover:shadow-xl transition-all"
            >
              🔄 Limpar
            </button>
            
          </div>

          {/* Status da Conexão */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              Status: {socket?.connected ? '🟢 Conectado' : '🔴 Desconectado'}
            </p>
             
          </div>
               
        </div>
    
      </div>
      
    </div>
    
  );
};

export default VideoConverter;
