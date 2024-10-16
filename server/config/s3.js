const AWS = require('aws-sdk');
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// S3에 파일 업로드 함수
const uploadToS3 = async (file) => {
    const encodedFileName = encodeURIComponent(file.originalname);  // 파일 이름 인코딩 처리
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `${Date.now()}_${encodedFileName}`,  // 인코딩된 파일 이름 사용
      Body: file.buffer,
      ContentType: file.mimetype,
    };
  
    try {
      const data = await s3.upload(params).promise();
      return data.Location;  // S3에 업로드된 파일의 URL 반환
    } catch (err) {
      console.error('Error uploading file to S3:', err);
      throw err;
    }
};

module.exports = uploadToS3;


