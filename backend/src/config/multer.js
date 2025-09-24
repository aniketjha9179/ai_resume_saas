const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = 'uploads';
const resumeDir = path.join(uploadsDir, 'resumes');
const profileDir = path.join(uploadsDir, 'profiles');

[uploadsDir, resumeDir, profileDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = uploadsDir;
    
    if (file.fieldname === 'resume') {
      uploadPath = resumeDir;
    } else if (file.fieldname === 'profilePicture') {
      uploadPath = profileDir;
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = file.fieldname + '-' + uniqueSuffix + ext;
    cb(null, name);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = process.env.ALLOWED_FILE_TYPES.split(',');
  const fileExt = path.extname(file.originalname).toLowerCase().slice(1);
  
  if (file.fieldname === 'profilePicture') {
    if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (jpg, jpeg, png, gif) are allowed for profile pictures'), false);
    }
  } else if (file.fieldname === 'resume') {
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error(`Only ${allowedTypes.join(', ')} files are allowed for resumes`), false);
    }
  } else {
    cb(new Error('Invalid field name'), false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880, // 5MB default
    files: 5, // Maximum 5 files
  },
  fileFilter: fileFilter,
});

// Error handling middleware
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.',
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 5 files allowed.',
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field name in file upload.',
      });
    }
  }
  
  if (err.message.includes('Only') || err.message.includes('Invalid')) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  
  next(err);
};

// Export configured multer instances
module.exports = {
  upload,
  handleMulterError,
  uploadSingle: upload.single('resume'),
  uploadMultiple: upload.array('resumes', 5),
  uploadFields: upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'profilePicture', maxCount: 1 },
  ]),
};