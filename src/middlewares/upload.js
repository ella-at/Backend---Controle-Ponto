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

    return {
      folder,
      format: 'png',
      public_id: `${file.fieldname}-${Date.now()}`
    };
  },
});

const upload = multer({ storage });

module.exports = upload;
