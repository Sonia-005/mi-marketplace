const cloudinary = require('cloudinary').v2;
// multer-storage-cloudinary 4.x requiere cloudinary v1 internamente, pero .v2 funciona igual
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configuración de Cloudinary con variables de entorno
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'freelance-marketplace',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, crop: 'limit' }],
  },
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

module.exports = { upload, cloudinary };
