import multer from 'multer';

// Setting up storage engine for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Directory to store uploaded files
    cb(null, './public/temp')
  },
  filename: function (req, file, cb) {
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    // cb(null, file.fieldname + '-' + uniqueSuffix)

    // Naming uploaded files using their original names
    cb(null, file.originalname)
  }
})

// Exporting the configured multer middleware
export const upload = multer({ 
    storage: storage })