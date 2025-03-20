// middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');

// Storage engine configuration for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // ensure this folder exists and is writable
  },
  filename: (req, file, cb) => {
    // Use a timestamp + original name to avoid duplicates and preserve file extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Basic file filter to only allow certain file types (for example, images and PDFs)
const fileFilter = (req, file, cb) => {
  // Accept images or PDFs for now
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // limit files to 5 MB for example
});

module.exports = upload;
