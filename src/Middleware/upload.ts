import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { InvalidFileTypeError } from '../DTO/errorDTO';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = './uploads/original';

    // 폴더가 존재하지 않으면 생성 ({ recursive: true } 옵션으로 상위 폴더까지 한 번에 생성)
    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    } catch (err) {
      throw new Error('multer error');
    }
  },
  filename: function (req, file, cb) {
    // 파일명: 현재 시간(ms) + 원본 파일명
    cb(null, Date.now() + '_' + file.originalname);
  },
});

const banana_storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = './uploads/banana';

    // 폴더가 존재하지 않으면 생성 ({ recursive: true } 옵션으로 상위 폴더까지 한 번에 생성)
    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    } catch (err) {
      throw new Error('multer error');
    }
  },
  filename: function (req, file, cb) {
    // 파일명: 현재 시간(ms) + 원본 파일명
    cb(null, Date.now() + '_' + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
    files: 5,
  },
  fileFilter: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
      return cb(
        new InvalidFileTypeError(
          `${ext}는 허용되지 않음. (png, jpg, gif, jpeg 허용)`,
        ),
      );
    }

    cb(null, true);
  },
});

export default upload;
