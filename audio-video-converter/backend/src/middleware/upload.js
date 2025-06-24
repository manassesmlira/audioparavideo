const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');

// Configurar armazenamento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath;
    
    if (file.fieldname === 'audio') {
      uploadPath = path.join(__dirname, '../../uploads/audio');
    } else if (file.fieldname === 'image') {
      uploadPath = path.join(__dirname, '../../uploads/images');
    }
    
    // Garantir que a pasta existe
    fs.ensureDirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// Filtro de arquivos
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'audio') {
    // Aceitar apenas MP3
    if (file.mimetype === 'audio/mpeg' || file.mimetype === 'audio/mp3') {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos MP3 são permitidos para áudio!'), false);
    }
  } else if (file.fieldname === 'image') {
    // Aceitar apenas JPG e PNG
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos JPG e PNG são permitidos para imagem!'), false);
    }
  } else {
    cb(new Error('Campo de arquivo não reconhecido!'), false);
  }
};

// Configurar multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
});

module.exports = upload;
