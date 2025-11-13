export class CustomError extends Error {
  constructor(
    public errorCode: string,
    public statusCode: number,
    public message: string,
    public description: string,
  ) {
    super(message);
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string) {
    super('NOT_FOUND', 404, message, 'Not Found Error');
  }
}

export class DuplicateUserError extends CustomError {
  constructor(message: string) {
    super('DUPLICATE_USER', 409, message, '이미 존재하는 유저입니다.');
  }
}

export class InvalidFileTypeError extends CustomError {
  constructor(message: string) {
    super('INVALID_FILE_TYPE', 400, message, '허용되지 않는 파일 형식입니다.');
  }
}

export class UnknownPrismaError extends CustomError {
  constructor(message: string) {
    super(
      'UNKNOWN_PRISMA_ERROR',
      500,
      message,
      '데이터베이스 오류가 발생했습니다.',
    );
  }
}

export class UploadFailError extends CustomError {
  constructor(message: string) {
    super('UPLOAD_FAIL', 500, message, '이미지 업로드에 실패했습니다.');
  }
}
