const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'src/uploads');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, 'file-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { files: 50 },
  // fileFilter: (req, file, cb) => {
  //     // Check file size and set error message if size greater than 10MB
  //     if (file.size <= 10485760) {
  //         cb(null, true);
  //     } else {
  //         cb(
  //             new Error(
  //                 'Oops! The size limit for image is 10MB. Reduce the file size and try again.'
  //             ),
  //             false
  //         );
  //     }
  // },
});

module.exports = upload;
