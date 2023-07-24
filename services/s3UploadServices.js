require('dotenv').config()
const fs = require('fs')
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');

const bucketName = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_BUCKET_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY
const secretAccessKey = process.env.AWS_SECRET_KEY

const s3 = new S3Client({
    credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
    },
    region: region,
})

//upload image
async function uploadFile(file, fileName) {
    const uploadParams = {
        Bucket: bucketName,
        Body: file.buffer,
        Key: fileName,
        ContentType: file.mimetype
    }

    const command = new PutObjectCommand(uploadParams)
    let result = await s3.send(command);
    return result;
}
exports.uploadFile = uploadFile

function uploadMultipleFile(file) {
    const fileStream = fs.createReadStream(file.path)

    const uploadParams = {
        Bucket: bucketName,
        Body: fileStream,
        Key: file.filename
    }
    return s3.upload(uploadParams).promise()
}
exports.uploadMultipleFile = uploadMultipleFile



//download image - in s3Services
async function getFileStream(fileKey) {

    const downloadParams = {
        Key: fileKey,
        Bucket: bucketName
    }

    const command = new GetObjectCommand(downloadParams);
    let result = await s3.send(command);
    let str = s3.createReadStream();
    return str;
    return s3.getObject(downloadParams).createReadStream()
}
exports.getFileStream = getFileStream