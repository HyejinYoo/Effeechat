const db = require('../config/db');

// 파일 저장
exports.createFile = async (url, originalName, postId = null, messageId = null) => {
  try {
    const [result] = await db.query(`
      INSERT INTO Files (url, originalName, postId, messageId)
      VALUES (?, ?, ?, ?)
    `, [url, originalName, postId, messageId]);

    return result.insertId;
  } catch (error) {
    throw new Error('Error uploading file');
  }
};


// postId로 파일 목록 가져오기
exports.getFilesByPostId = async (postId) => {
    try {
      const [files] = await db.query(`SELECT * FROM Files WHERE postId = ?`, [postId]);
      //console.log('filemodel'+files);
      return files;
    } catch (error) {
      throw new Error('Error fetching files for post');
    }
  };

  // 파일 ID 목록을 받아 해당 파일들을 삭제하는 함수
exports.deleteFilesByIds = async (fileIds) => {
    try {
      // 파일 ID 목록이 비어있는지 확인
      if (!fileIds || fileIds.length === 0) {
        throw new Error('No file IDs provided for deletion');
      }
  
      // 파일 ID 목록을 이용해 해당 파일 삭제
      const query = `DELETE FROM Files WHERE id IN (?)`;
  
      // MySQL 쿼리 실행 (IN 절을 이용해 여러 파일을 한 번에 삭제)
      await db.query(query, [fileIds]);
  
      return { message: 'Files deleted successfully' };
    } catch (error) {
      throw new Error('Error deleting files: ' + error.message);
    }
  };