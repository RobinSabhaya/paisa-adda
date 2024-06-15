class ApiError extends Error {
  constructor(statusCode, message, subMessage, errorType, logType, isOperational = true, stack = '', api_slug = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.error = message;
    this.subMessage = subMessage;
    this.errorType = errorType;
    this.logType = logType;
    if (api_slug) {
      this.api_slug = api_slug;
    }
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = ApiError;
