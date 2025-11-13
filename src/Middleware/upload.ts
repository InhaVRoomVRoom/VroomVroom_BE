import multer from 'multer';
import path from 'path';
import { InvalidFileTypeError } from '../DTO/errorDTO';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/original');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '_' + file.originalname);
  },
});

const banana_storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/banana');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '_banana_' + file.originalname);
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
