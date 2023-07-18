const multer = require('multer');

const serverStorage = multer.memoryStorage();
const serverUpload = multer({ storage: serverStorage });

// var storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads')
//     },
//     filename: (req, file, cb) => {
//         const { userId } = req;
//         const today = new Date();
//         const yyyy = today.getFullYear();
//         let mm = today.getMonth() + 1; // Months start at 0!
//         let dd = today.getDate();

//         if (dd < 10) dd = '0' + dd;
//         if (mm < 10) mm = '0' + mm;

//         const formattedToday = dd + '' + mm + '' + yyyy;
//         cb(null, formattedToday + '-' + userId + '-' + file.originalname)
//     }
// });
// var upload = multer({ storage: storage });

// module.exports = upload
module.exports = serverUpload
