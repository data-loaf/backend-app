type ResponseErrorParams = {
  statusCode: number;
  message: string;
};

class ResponseError extends Error {
  readonly statusCode: number;

  constructor({ message, statusCode }: ResponseErrorParams) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export { ResponseError };
