# audioparavideo
Audio to Video Converter

Um aplicativo web simples que converte arquivos de áudio MP3 e imagens em vídeos MP4.

🚀 Tecnologias
Backend: Node.js + Express
Frontend: React
Processamento: FFmpeg
Upload: Multer
Formatos suportados: MP3 (áudio), JPG/PNG (imagem)

📁 Estrutura do Projeto

audio-video-converter/

├── backend/

│ ├── src/

│ │ ├── controllers/

│ │ │ └── videoController.js

│ │ ├── middleware/

│ │ │ └── upload.js

│ │ ├── routes/

│ │ │ └── videoRoutes.js

│ │ ├── services/

│ │ │ └── ffmpegService.js

│ │ ├── utils/

│ │ │ └── fileValidation.js

│ │ └── app.js

│ ├── uploads/

│ │ ├── audio/

│ │ └── images/

│ ├── output/

│ ├── package.json

│ └── server.js

├── frontend/

│ ├── public/

│ ├── src/

│ │ ├── components/

│ │ │ ├── FileUpload.jsx

│ │ │ ├── VideoPreview.jsx

│ │ │ └── ProgressBar.jsx

│ │ ├── services/

│ │ │ └── api.js

│ │ ├── App.js

│ │ ├── App.css

│ │ └── index.js

│ └── package.json

├── README.md

└── .gitignore

🛠️ Pré-requisitos

1. FFmpeg

Windows:
winget install ffmpeg

Linux (Ubuntu/Debian):
sudo apt update
sudo apt install ffmpeg

macOS:
brew install ffmpeg

Verificar instalação:

ffmpeg -version

2. Node.js

Instale Node.js 16+ do site oficial

📦 Instalação

1. Clone o repositório

git clone https://github.com/seu-usuario/audio-video-converter.git
cd audio-video-converter

2. Instale dependências do backend

cd backend
npm install

3. Instale dependências do frontend

cd ../frontend
npm install

🚀 Como executar

Desenvolvimento
Terminal 1 - Backend:
cd backend
npm run dev
O backend estará rodando em http://localhost:5000

Terminal 2 - Frontend:
cd frontend
npm start
O frontend estará rodando em http://localhost:3000

Produção
Build do frontend:
cd frontend
npm run build

Executar backend em produção:
cd backend
npm start

📋 Dependências
Backend (package.json)

{
  "name": "audio-video-converter-backend",
  "version": "1.0.0",
  "description": "Backend para conversão de áudio e imagem em vídeo",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "multer": "^1.4.5-lts.1",
    "fluent-ffmpeg": "^2.1.2",
    "cors": "^2.8.5",
    "path": "^0.12.7",
    "fs-extra": "^11.1.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
Frontend (package.json)

{
  "name": "audio-video-converter-frontend",
  "version": "1.0.0",
  "description": "Frontend para conversão de áudio e imagem em vídeo",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.5.0",
    "react-dropzone": "^14.2.3"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "devDependencies": {
    "react-scripts": "5.0.1"
  }
}

🎯 Funcionalidades
✅ Upload de arquivo MP3 (áudio)
✅ Upload de imagem (JPG/PNG)
✅ Validação de formatos de arquivo
✅ Conversão para vídeo MP4
✅ Barra de progresso
✅ Preview do vídeo gerado
✅ Download do vídeo final
✅ Interface responsiva

🔧 Configurações
Limites de arquivo (backend/src/middleware/upload.js)

const fileSize = 50 * 1024 * 1024; // 50MB
Qualidade do vídeo (backend/src/services/ffmpegService.js)

const videoOptions = {
  resolution: '1280x720',
  fps: 30,
  videoBitrate: '1000k'
};

📝 API Endpoints
POST /api/convert
Converte áudio e imagem em vídeo

Body (multipart/form-data):

audio: arquivo MP3
image: arquivo JPG/PNG

Response:

{
  "success": true,
  "videoUrl": "/output/video_123456789.mp4",
  "message": "Vídeo gerado com sucesso"
}
GET /api/download/:filename
Faz download do vídeo gerado

🐛 Troubleshooting
Erro: FFmpeg não encontrado
Verifique se o FFmpeg está instalado: ffmpeg -version
Adicione o FFmpeg ao PATH do sistema
Erro: Porta já em uso
Backend: Altere a porta em backend/server.js
Frontend: Use PORT=3001 npm start
Erro: Upload muito grande
Aumente o limite em backend/src/middleware/upload.js

🤝 Contribuição
Fork o projeto
Crie uma branch: git checkout -b feature/nova-funcionalidade
Commit: git commit -m 'Adiciona nova funcionalidade'
Push: git push origin feature/nova-funcionalidade
Abra um Pull Request

📄 Licença
Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

👨‍💻 Autor
Manasses

GitHub: @manassesmlira

📞 Suporte
Se encontrar algum problema ou tiver dúvidas:

Verifique se todas as dependências estão instaladas
Consulte a seção de Troubleshooting
Abra uma issue no GitHub