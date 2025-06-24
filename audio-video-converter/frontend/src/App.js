import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { convertToVideo, getDownloadUrl } from './services/api';
import './App.css';

function App() {
  const [audioFile, setAudioFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Dropzone para áudio
  const {
    getRootProps: getAudioRootProps,
    getInputProps: getAudioInputProps,
    isDragActive: isAudioDragActive
  } = useDropzone({
    accept: {
      'audio/mpeg': ['.mp3']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setAudioFile(acceptedFiles[0]);
        setError(null);
      }
    }
  });

  // Dropzone para imagem
  const {
    getRootProps: getImageRootProps,
    getInputProps: getImageInputProps,
    isDragActive: isImageDragActive
  } = useDropzone({
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setImageFile(acceptedFiles[0]);
        setError(null);
      }
    }
  });

  const handleConvert = async () => {
    if (!audioFile || !imageFile) {
      setError('Por favor, selecione um arquivo de áudio MP3 e uma imagem JPG/PNG');
      return;
    }

    setLoading(true);
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      const response = await convertToVideo(audioFile, imageFile, setProgress);
      setResult(response);
      console.log('✅ Conversão concluída:', response);
    } catch (err) {
      setError(err.message || 'Erro ao converter o vídeo');
      console.error('❌ Erro:', err);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const resetFiles = () => {
    setAudioFile(null);
    setImageFile(null);
    setResult(null);
    setError(null);
    setProgress(0);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🎵 Audio to Video Converter</h1>
        <p>Converta seu áudio MP3 + imagem em vídeo MP4</p>
      </header>

      <main className="App-main">
        <div className="upload-section">
          {/* Upload de Áudio */}
          <div className="upload-container">
            <h3>🎵 Arquivo de Áudio (MP3)</h3>
            <div
              {...getAudioRootProps()}
              className={`dropzone ${isAudioDragActive ? 'active' : ''} ${audioFile ? 'has-file' : ''}`}
            >
              <input {...getAudioInputProps()} />
              {audioFile ? (
                <div className="file-info">
                  <p>✅ {audioFile.name}</p>
                  <small>{(audioFile.size / 1024 / 1024).toFixed(2)} MB</small>
                </div>
              ) : (
                <div className="dropzone-text">
                  {isAudioDragActive ? (
                    <p>Solte o arquivo MP3 aqui...</p>
                  ) : (
                    <div>
                      <p>Arraste um arquivo MP3 ou clique para selecionar</p>
                      <small>Apenas arquivos .mp3 são aceitos</small>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Upload de Imagem */}
          <div className="upload-container">
            <h3>🖼️ Imagem (JPG/PNG)</h3>
            <div
              {...getImageRootProps()}
              className={`dropzone ${isImageDragActive ? 'active' : ''} ${imageFile ? 'has-file' : ''}`}
            >
              <input {...getImageInputProps()} />
              {imageFile ? (
                <div className="file-info">
                  <p>✅ {imageFile.name}</p>
                  <small>{(imageFile.size / 1024 / 1024).toFixed(2)} MB</small>
                  {imageFile && (
                    <img
                      src={URL.createObjectURL(imageFile)}
                      alt="Preview"
                      className="image-preview"
                    />
                  )}
                </div>
              ) : (
                <div className="dropzone-text">
                  {isImageDragActive ? (
                    <p>Solte a imagem aqui...</p>
                  ) : (
                    <div>
                      <p>Arraste uma imagem ou clique para selecionar</p>
                      <small>Apenas arquivos .jpg, .jpeg, .png são aceitos</small>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="actions">
          <button
            onClick={handleConvert}
            disabled={!audioFile || !imageFile || loading}
            className="convert-btn"
          >
            {loading ? `Convertendo... ${progress}%` : '🎬 Converter para Vídeo'}
          </button>

          {(audioFile || imageFile) && (
            <button onClick={resetFiles} className="reset-btn">
              🗑️ Limpar Arquivos
            </button>
          )}
        </div>

        {/* Barra de Progresso */}
        {loading && (
          <div className="progress-container">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p>Processando... {progress}%</p>
          </div>
        )}

        {/* Resultado */}
        {result && (
          <div className="result-container">
            <h3>✅ Vídeo gerado com sucesso!</h3>
            <div className="result-actions">
              <a
                href={getDownloadUrl(result.filename)}
                download={result.filename}
                className="download-btn"
              >
                📥 Baixar Vídeo MP4
              </a>
              <video
                src={`http://localhost:5000${result.videoUrl}`}
                controls
                className="video-preview"
              >
                Seu navegador não suporta vídeo HTML5.
              </video>
            </div>
          </div>
        )}

        {/* Erro */}
        {error && (
          <div className="error-container">
            <h3>❌ Erro</h3>
            <p>{error}</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
