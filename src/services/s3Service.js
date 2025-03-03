const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

/** 🔹 S3 파일 업로드 */
exports.uploadFile = async (file, bucketName) => {
  if (!file) throw new Error('파일이 제공되지 않았습니다.');

  const fileKey = `uploads/${uuidv4()}-${file.originalname}`;

  const params = {
    Bucket: bucketName,
    Key: fileKey,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read', // 파일 공개 접근 가능 (필요시 수정 가능)
  };

  const uploadResult = await s3.upload(params).promise();
  return { key: fileKey, location: uploadResult.Location };
};

/** 🔹 S3 파일 다운로드 URL 가져오기 */
exports.getFileUrl = (bucketName, fileKey) => {
  return s3.getSignedUrl('getObject', {
    Bucket: bucketName,
    Key: fileKey,
    Expires: 60 * 5, // 5분 동안 유효한 서명된 URL
  });
};

/** 🔹 S3 파일 삭제 */
exports.deleteFile = async (bucketName, fileKey) => {
  const params = {
    Bucket: bucketName,
    Key: fileKey,
  };

  await s3.deleteObject(params).promise();
  return true;
};
