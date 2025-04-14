const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isFoto = file.fieldname === 'foto';
    const folder = isFoto ? 'uploads/fotos' : 'uploads/assinaturas';
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    cb(null, `${timestamp}-${file.originalname}`);
  },
});

const upload = multer({ storage });
module.exports = upload;
