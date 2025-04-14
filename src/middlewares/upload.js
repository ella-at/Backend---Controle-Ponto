const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Cria pasta se não existir
function ensureFolderExists(folderPath) {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subfolder = '';

    if (file.fieldname === 'foto') {
      subfolder = 'fotos';
    } else if (file.fieldname === 'assinatura') {
      subfolder = 'assinaturas';
    } else if (file.fieldname === 'comprovante') {
      subfolder = 'comprovantes';
    }

    const fullPath = path.join(__dirname, '../../uploads', subfolder);
    ensureFolderExists(fullPath);

    cb(null, fullPath);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${file.fieldname}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({ storage });

module.exports = upload;
