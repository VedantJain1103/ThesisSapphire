require('dotenv').config()
const fs = require('fs')
const S3 = require('aws-sdk/clients/s3')

const bucketName = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_BUCKET_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY
const secretAccessKey = process.env.AWS_SECRET_KEY

const s3 = new S3({
    region,
    accessKeyId,
    secretAccessKey
})

//upload image - in s3UploadServices
// function uploadFile(file) {
//     const fileStream = fs.createReadStream(file.path)

//     const uploadParams = {
//         Bucket: bucketName,
//         Body: fileStream,
//         Key: file.filename
//     }
//     return s3.upload(uploadParams).promise()
// }
// exports.uploadFile = uploadFile

// function uploadMultipleFile(file) {
//     const fileStream = fs.createReadStream(file.path)

//     const uploadParams = {
//         Bucket: bucketName,
//         Body: fileStream,
//         Key: file.filename
//     }
//     return s3.upload(uploadParams).promise()
// }
// exports.uploadMultipleFile = uploadMultipleFile



//download image
function getFileStream(fileKey) {
    const downloadParams = {
        Key: fileKey,
        Bucket: bucketName
    }
    // s3.getObject(downloadParams, function (err, data) {
    //     if (err) console.log(err, err.stack); // an error occurred
    //     else console.log(data);           // successful response
    // });
    let result = s3.getObject(downloadParams).createReadStream()
    console.log(result);
    return result;
}
exports.getFileStream = getFileStream