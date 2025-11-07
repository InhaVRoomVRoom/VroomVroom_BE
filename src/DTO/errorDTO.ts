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
