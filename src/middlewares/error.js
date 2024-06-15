const mongoose = require('mongoose');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { activityLogService } = require('../services');
const { ACTIVITY_LOG_TYPES } = require('../helper/constant.helper');

const errorConverter = (err, req, res, next) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode || error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || httpStatus[statusCode];
    error = new ApiError(
      statusCode,
      message,
      error.subMessage || '',
      error.errorType || 'error',
      error.logType,
      false,
      err.stack
    );
  }
  next(error);
};

// eslint-disable-next-line no-unused-vars
const errorHandler = async (err, req, res, next) => {
  let { statusCode = 500, message, error } = err;

  // res.locals.errorMessage = err.message;

  const response = {
    success: false,
    message: error,
    // ...(config.env === 'development' && { stack: err.stack }),
    subMessage: err.subMessage || '',
    errorType: err.errorType || 'error',
    // stack: err.stack,
  };

  // await activityLogService.storeActivityLog({
  //   status: ACTIVITY_LOG_TYPES.type.fail,
  //   user: req?.user?._id,
  //   message: message || error,
  //   status_code: statusCode,
  //   log_type: err?.logType,
  //   request_data: {
  //     body: JSON.stringify(req?.body),
  //     query: JSON.stringify(req?.query),
  //     params: JSON.stringify(req?.params),
  //   },
  //   email: req?.body?.email || req?.user?.email,
  //   error_stack: err?.stack,
  //   route: req.originalUrl,
  //   method: req.method,
  // });

  res.status(statusCode).json(response);
};

module.exports = {
  errorConverter,
  errorHandler,
};
