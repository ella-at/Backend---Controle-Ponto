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

    const allowedFormats = ['png', 'jpg', 'jpeg', 'webp', 'pdf'];
    const originalExt = file.originalname.split('.').pop().toLowerCase();

    if (!allowedFormats.includes(originalExt)) {
      throw new Error('Extensão de arquivo não permitida');
    }

    return {
      folder,
      format: originalExt,
      public_id: `${file.fieldname}-${Date.now()}`
    };
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'application/pdf'
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não suportado. Use PDF, PNG, JPG, JPEG ou WEBP.'));
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
