const multer = require('multer');

const upload = multer({
    storage: multer.memoryStorage(),
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
