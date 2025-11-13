export interface ITsoaErrorResponse {
  resultType: string;
  error: {
    errorCode?: string;
    reason?: string | null;
    data?: any | null;
  };
  success: null;
}

export interface ITsoaSuccessResponse<T> {
  resultType: string;
  error: null;
  success: T;
}

export class TsoaSuccessResponse<T> {
  resultType: string = 'SUCCESS';
  error = null;
  success: T;

  constructor(success: T) {
    this.success = success;
  }
}
