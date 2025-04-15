const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let folder = 'geral';
    if (file.fieldname === 'foto') folder = 'fotos';
    if (file.fieldname === 'assinatura') folder = 'assinaturas';
    if (file.fieldname === 'comprovante') folder = 'comprovantes';

    const originalExt = file.originalname.split('.').pop().toLowerCase();

    return {
      folder,
      format: originalExt, // Usa extensão real do arquivo
      public_id: `${file.fieldname}-${Date.now()}`
    };
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não suportado. Use PDF, PNG, JPG ou JPEG.'));
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
