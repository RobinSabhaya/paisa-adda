const express = require('express');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');
const passport = require('passport');
const httpStatus = require('http-status');
const path = require('path');
const morgan = require('./config/morgan');
const { jwtStrategy } = require('./config/passport');
const routes = require('./routes/v1');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');
const { FILES_FOLDER } = require('./helper/constant.helper');
const { responseHandler } = require('./middlewares/response');
const log4js = require('log4js');
// require('./utils/cronManage'); // Uncomment if execute the cron
const { authLimiter } = require('./middlewares/rateLimiter');

const app = express();
// if (config.env !== 'test') {
//   app.use(morgan.successHandler);
//   app.use(morgan.errorHandler);
// }

// limit repeated failed requests to auth endpoints
// if (config.env === 'production') {
//   app.use('/v1/auth', authLimiter);
// }

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

app.use(morgan.successHandler);
app.use(morgan.errorHandler);

app.use(express.static(path.join(__dirname, `../${FILES_FOLDER.public}`)));

// set security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// parse json request body
app.use(express.json({ limit: '100mb' }));
// app.use(bodyParser.raw({ type: 'application/octet-stream', limit: '100MB' }))

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
// app.use(xss());
app.use(mongoSanitize());

// gzip compression
app.use(compression());

// enable cors
app.use(cors({ credentials: true }));
app.options('*', cors());

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

app.use(responseHandler);

// v1 api routes
app.use('/v1', routes);

// For static images
app.use('/src/uploads', express.static(path.join(__dirname, '/uploads')));

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, ['not_found', 'route']));
});

// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  // Write log for errors
  log4js.configure({
    appenders: {
      error_log: {
        type: 'file',
        filename: `logs/error_log/logfile_${new Date().toISOString().split('T')[0]}.log`,
      },
    },
    categories: { default: { appenders: ['error_log'], level: 'error' } },
  });
  const logger = log4js.getLogger('error_log');
  logger.error(req.body);
  logger.error(error);

  // Send response with error
  // res.status(error.statusCode || 500).json({
  //     success: false,
  //     status: error.statusCode || 500,
  //     message: error.message || "We're sorry, an unexpected error has occurred.",
  //     subMessage: error.subMessage || 'Error Found.',
  // });
  next(error);
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

// Cron
// runCron();

module.exports = app;
