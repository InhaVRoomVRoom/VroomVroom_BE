import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../DTO/errorDTO';
import { ValidateError } from 'tsoa';

const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  /**
   * 커스텀 에러 처리
   */
  if (err instanceof CustomError) {
    res.status(err.statusCode).json({
      resultType: 'FAIL',
      error: {
        errorCode: err.errorCode,
        reason: err.message,
        data: err.description,
      },
      success: null,
    });

    return;
  }

  /**
   * Tsoa Validate Error 처리
   */
  if (err instanceof ValidateError) {
    res.status(err.status).json({
      resultType: 'FAIL',
      error: {
        errorCode: err.status,
        reason: err.message,
        data: err.fields,
      },
      success: null,
    });

    return;
  }

  /**
   * 기본 에러 처리(500)
   */
  res.status(500).json({
    resultType: 'FAIL',
    error: {
      errorCode: 'ERR-0',
      reason: err.message || 'Unknown server error.',
      data: null,
    },
    success: null,
  });
};

export default errorMiddleware;
