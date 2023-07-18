require('dotenv').config()
const fs = require('fs')
const S3 = require('aws-sdk/clients/s3')

const bucketName = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_BUCKET_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY
const secretAccessKey = process.env.AWS_SECRET_KET

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

    return s3.getObject(downloadParams).createReadStream()
}
exports.getFileStream = getFileStream