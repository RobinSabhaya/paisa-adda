const httpStatus = require('http-status');
const { ROLES, ACTIVITY_LOG_TYPES, USER_FROM } = require('../../helper/constant.helper');
const userService = require('../../services/user.service');
const tokenService = require('../../services/token.service');
const roleService = require('../../services/role.service');
const activityLogService = require('../../services/activityLog.service');
const { generateMessage } = require('../../helper/function.helper');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');

/**
 *
 * POST: Register.
 */
const register = catchAsync(async (req, res) => {
  let reqBody = req.body;
  let userData = await userService.getUserByEmail(reqBody.email, reqBody?.role_name); // Get user by email.

  // if (userData && userData?.role_name === ROLES.user) {
  //     const breederRole = await roleService.getRoleBySlug(ROLES.breeder);
  //     const bcryptPassword = await bcrypt.hash(reqBody.password, 8); // password bcrypt.
  //     await userService.updateUserById(userData._id, {
  //         role: breederRole._id,
  //         role_name: ROLES.breeder,
  //         password: bcryptPassword,
  //     });
  // }

  if (userData) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      generateMessage('already_taken', 'email'),
      'Try logging in with this email.',
      'warning',
      ACTIVITY_LOG_TYPES.error_types.breeder_register_failed
    );
  }

  if (!userData) {
    userData = await userService.createUser(reqBody, ROLES.breeder);
  }

  const tokens = await tokenService.generateAuthTokens(userData, req.body?.user_from); // Generate auth token.

  /** Get breeder's breed and kennel details */
  const userBreederData = await userService.getBreederDetails({
    _id: userData._id,
    is_active: true,
    deletedAt: null,
  });
  // const schedulerData = await schedulerService.createSchedularData(userData._id);

  // await startScheduler(schedulerData._id, schedulerData.next_mail_date);

  /** Store activity log */
  await activityLogService.storeActivityLog({
    status: ACTIVITY_LOG_TYPES.type.success,
    user: userData._id,
    message: 'Breeder register successfully.',
    status_code: 200,
    log_type: ACTIVITY_LOG_TYPES.success_types.breeder_register_success,
    request_data: {
      body: JSON.stringify(reqBody),
      query: JSON.stringify(req?.query),
      params: JSON.stringify(req?.params),
    },
    email: reqBody.email,
    error_stack: null,
    route: req.originalUrl,
    method: req.method,
  });

  res.status(httpStatus.OK).json({
    success: true,
    message: generateMessage('successful', 'registered'),
    data: {
      tokens,
      user: userBreederData,
      firstStepCompleted: userBreederData && userBreederData.mobile_no && userBreederData.is_mobile_verified ? true : false,
      secondStepCompleted:
        userBreederData && userBreederData.is_mobile_verified && userBreederData.speak_language.length ? true : false,
      thirdStepCompleted:
        userBreederData &&
        userBreederData.is_mobile_verified &&
        userBreederData.speak_language.length &&
        userBreederData.breeder_kennel &&
        userBreederData.breeder_kennel.year_established
          ? true
          : false,
    },
  });
});

/**
 * POST: Add mobile number.
 */
const addMobile = catchAsync(async (req, res) => {
  const breederRole = await roleService.getRoleBySlug(ROLES.breeder);
  let updateBody = {
    ...req.body,
    role: breederRole._id,
    role_name: ROLES.breeder,
  };
  const userData = await userService.updateUserById(req.user._id, {
    ...updateBody,
  });

  const tokens = await tokenService.generateAuthTokens(userData, req.body?.user_from); // Generate auth token.
  const otp = await tokenService.generateOtpToken(userData, userData.role_name, req.body?.user_from); // Generate auth token.

  let response = await smsService.sendOtpByMobicomm(req.body.mobile_no, 'HappyPet', otp);

  if (response.status !== 200) {
    throw new ApiError(
      400,
      'Something went wrong, please try again or later.',
      '',
      '',
      ACTIVITY_LOG_TYPES.error_types.failed_to_add_mobile_no
    );
  }

  /** Store activity log */
  await activityLogService.storeActivityLog({
    status: ACTIVITY_LOG_TYPES.type.success,
    user: userData._id,
    message: 'Add mobile number successfully.',
    status_code: 200,
    log_type: ACTIVITY_LOG_TYPES.success_types.add_mobile_no_success,
    request_data: {
      body: JSON.stringify(req?.body),
      query: JSON.stringify(req?.query),
      params: JSON.stringify(req?.params),
    },
    email: userData.email,
    error_stack: null,
    route: req.originalUrl,
    method: req.method,
  });

  res.status(httpStatus.OK).json({
    success: true,
    data: {
      token: tokens.access.token,
    },
    message: 'OTP send successfully!',
  });
});

/**
 * POST: Verify OTP.
 */
const verifyOtp = catchAsync(async (req, res) => {
  const { mobile_no, otp, user_from } = req.query;

  let emailExist = await userService.getUserByEmail(req.user.email, ROLES.breeder); // Get user by email.
  if (!emailExist) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      generateMessage('not_found', 'email'),
      '',
      '',
      ACTIVITY_LOG_TYPES.error_types.verify_otp
    ); // If email already exist, throw an error.
  }

  if (emailExist.mobile_no !== mobile_no) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      generateMessage('not_matched', 'mobile_no'),
      '',
      '',
      ACTIVITY_LOG_TYPES.error_types.verify_otp
    );
  }

  let token = await tokenService.getToken({
    user: emailExist._id,
    otp: { $ne: null },
    user_from: user_from || USER_FROM.WEB,
  });
  if (!token) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      generateMessage('something_went_wrong'),
      '',
      '',
      ACTIVITY_LOG_TYPES.error_types.verify_otp
    ); // If token doesn't exist, throw an error.
  }

  if (token.otp != otp) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      generateMessage('invalid', 'otp'),
      'Please try again with correct OTP.',
      '',
      ACTIVITY_LOG_TYPES.error_types.verify_otp
    ); // If otp doesn't match, throw an error.
  }

  if (token.otp_expires <= new Date()) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      generateMessage('expired', 'otp'),
      'Try resending the OTP.',
      '',
      ACTIVITY_LOG_TYPES.error_types.verify_otp
    ); // If otp expired, throw an error.
  }

  if (!emailExist.is_mobile_verified) {
    emailExist = await userService.updateUserById(emailExist._id, {
      is_mobile_verified: true,
    }); // If user is_mobile_verified is false, Update (is_mobile_verified: true) user by _id.
  }
  await tokenService.deleteToken(emailExist._id, user_from); // Delete token after reset password.

  /** Store activity log */
  await activityLogService.storeActivityLog({
    status: ACTIVITY_LOG_TYPES.type.success,
    user: emailExist._id,
    message: 'Verify OTP successfully.',
    status_code: 200,
    log_type: ACTIVITY_LOG_TYPES.success_types.verify_otp_success,
    request_data: {
      body: JSON.stringify(req?.body),
      query: JSON.stringify(req?.query),
      params: JSON.stringify(req?.params),
    },
    email: emailExist.email,
    error_stack: null,
    route: req.originalUrl,
    method: req.method,
  });

  res.status(httpStatus.OK).json({
    success: true,
    message: generateMessage('verified_successfully', 'otp'),
    data: {
      token: (await tokenService.generateAuthTokens(emailExist, user_from)).access.token,
    },
  });
});

module.exports = {
  register,
  addMobile,
  verifyOtp,
};
