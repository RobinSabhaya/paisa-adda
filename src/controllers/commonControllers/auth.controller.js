const httpStatus = require('http-status');
const userService = require('../../services/user.service');
const tokenService = require('../../services/token.service');
const roleService = require('../../services/role.service');
const activityLogService = require('../../services/activityLog.service');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const path = require('path');
const bcrypt = require('bcryptjs');
const { TOKEN_TYPES, ROLES, ACTIVITY_LOG_TYPES, USER_FROM } = require('../../helper/constant.helper');
const config = require('../../config/config');
const { generateMessage, encryptString, decryptString } = require('../../helper/function.helper');
const { sendEmail } = require('../../services/email.service');
const moment = require('moment');
const createAgenda = require('../../jobs/jobs_list/magicCodeSchedular');
const agenda = require('../../jobs/agenda');
/**
 * POST: Social login.
 * This is use in auth flow in happy-pet
 */
const socialLogin = catchAsync(async (req, res) => {
  const reqBody = req.body;
  let userRole;
  if (reqBody.role_name) {
    const roleExists = await roleService.getRoleBySlug(reqBody.role_name);
    if (!roleExists) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        generateMessage('not_found', 'role'),
        '',
        '',
        ACTIVITY_LOG_TYPES.error_types.social_login_failed
      );
    }
    userRole = roleExists;
  }

  let user = await userService.getUserByEmail(reqBody.email, reqBody.role_name); // Get user by email and role.
  if (!user) {
    userRole = !userRole ? await roleService.getRoleBySlug(ROLES.user) : userRole;
    const payload = {
      ...reqBody,
      is_email_verified: true,
      role: userRole._id,
      role_name: userRole.slug,
    };
    // if (reqBody.name) {
    //   payload.name_slug = await userService.generateUserNameSlug({
    //     first_name: reqBody.first_name,
    //     last_name: reqBody?.last_name,
    //   });
    // }
    user = await userService.createUser(payload, userRole.slug);
  } else {
    if (reqBody.role_name && reqBody.role_name !== user.role_name) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        generateMessage('already_taken', 'email'),
        'Try logging in with this email.',
        'warning',
        ACTIVITY_LOG_TYPES.error_types.social_login_failed
      );
    } else if (!user.is_active) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        generateMessage('account_blocked'),
        'Please contact us to resolve this issue.',
        '',
        ACTIVITY_LOG_TYPES.error_types.social_login_failed
      );
    } else if (user.social_type && user.social_type !== reqBody.social_type) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `This account is already logged in on ${user.social_type}.`,
        '',
        '',
        ACTIVITY_LOG_TYPES.error_types.social_login_failed
      );
    }
    user = await userService.updateUserById(user._id, {
      social_id: reqBody.social_id,
      social_type: reqBody.social_type,
      is_email_verified: true,
      device_token: reqBody?.device_token,
    });

    // if (req.body?.device_info) {
    //   /** Match the element which is device_id */
    //   const matchDocument = user?.device_info.find((ele) => {
    //     return ele?.device_id == reqBody.device_info.device_id;
    //   });

    //   if (matchDocument) {
    //     user = await userService.updateExistDeviceInfo(
    //       { _id: user._id, 'device_info.device_id': reqBody.device_info.device_id },
    //       {
    //         'device_info.$.device_token': reqBody.device_info.device_token,
    //         'device_info.$.device_type': reqBody.device_info.device_type,
    //         'device_info.$.platform': reqBody.device_info.platform,
    //       }
    //     );
    //   } else {
    //     user = await userService.updateDeviceInfo({ _id: user._id }, reqBody.device_info);
    //   }
    // }
  }

  const tokens = await tokenService.generateAuthTokens(user, reqBody?.user_from); // Generate auth token.

  /** Store activity log */
  await activityLogService.storeActivityLog({
    user: user?._id,
    message: 'Social login successfully.',
    status_code: 200,
    log_type: ACTIVITY_LOG_TYPES.success_types.social_login_success,
    request_data: {
      body: JSON.stringify(reqBody),
      query: JSON.stringify(req?.query),
      params: JSON.stringify(req?.params),
    },
    email: reqBody.email || user.email,
    error_stack: null,
    route: req.originalUrl,
    method: req.method,
  });

  res.status(httpStatus.OK).json({
    success: true,
    message: generateMessage('successful', 'login'),

    data: {
      tokens,
      user,
    },
  });
});

/** Verify token */
const verifyToken = catchAsync(async (req, res) => {
  const userData = Object.assign(JSON.parse(JSON.stringify(await userService.getUser({ _id: req.user._id }))), {
    last_logged_in: (await tokenService.getToken({ user: req.user._id })).updatedAt,
  });

  res.status(200).json({
    success: true,
    data: userData,
  });
});

/**
 * POST: Register.
 */
const register = catchAsync(async (req, res) => {
  const reqBody = req.body;

  let filter = {
    email: reqBody.email,
    role_name: reqBody.role_name,
  };
  const emailExist = await userService.getUser(filter); // Get user by email.
  if (emailExist) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      generateMessage('already_taken', 'email'),
      'Try logging in with this email.',
      'warning',
      ACTIVITY_LOG_TYPES.error_types.user_register_failed
    ); // If email already exist, throw an error.
  }

  let user = await userService.createUser({ ...reqBody, role_name: reqBody.role_name }); // User create.
  const tokens = await tokenService.generateAuthTokens(user, reqBody?.user_from); // Generate token for user

  /** Create agenda */
  createAgenda(String(user._id));

  /** Add agenda jobs */
  agenda.schedule(moment().add(1, 'minute'), String(user._id), {
    magic_code: '123456',
  });

  // if (req.body?.device_info) {
  //   /** Match the element which is device_id */
  //   const matchDocument = user?.device_info.find((ele) => {
  //     return ele?.device_id == reqBody.device_info.device_id;
  //   });

  //   if (matchDocument) {
  //     user = await userService.updateExistDeviceInfo(
  //       { _id: user._id, 'device_info.device_id': reqBody.device_info.device_id },
  //       {
  //         'device_info.$.device_token': reqBody.device_info.device_token,
  //         'device_info.$.device_type': reqBody.device_info.device_type,
  //         'device_info.$.platform': reqBody.device_info.platform,
  //       }
  //     );
  //   } else {
  //     user = await userService.updateDeviceInfo({ _id: user._id }, reqBody.device_info);
  //   }
  // }

  /** Store activity log */
  await activityLogService.storeActivityLog({
    user: user?._id,
    message: 'User register successfully.',
    status_code: 200,
    log_type: ACTIVITY_LOG_TYPES.success_types.user_register_success,
    request_data: {
      body: JSON.stringify(reqBody),
      query: JSON.stringify(req?.query),
      params: JSON.stringify(req?.params),
    },
    email: reqBody.email || user.email,
    error_stack: null,
    route: req.originalUrl,
    method: req.method,
  });

  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'registered successfully.',
    data: { user, tokens },
  });
});

/**
 * POST: Verify OTP.
 */
const verifyOtp = catchAsync(async (req, res) => {
  const { email, otp } = req.body;

  let emailExist = await userService.getUserByEmail(email); // Get user by email.
  if (!emailExist) {
    throw new ApiError(httpStatus.NOT_FOUND, ['not_found', 'email'], '', '', 'verify_otp'); // If email doesn't exist, throw an error.
  }

  if (emailExist.isBlock) {
    throw new ApiError(httpStatus.UNAUTHORIZED, ['account_blocked'], '', '', 'verify_otp'); // If the user is blocked, throw an error.
  }

  let token = await tokenService.getToken({ type: TOKEN_TYPES.VERIFY_OTP, user: emailExist._id });

  if (!token) {
    throw new ApiError(httpStatus.BAD_REQUEST, ['something_went_wrong'], '', '', 'verify_otp'); // If token doesn't exist, throw an error.
  }

  if (token.token !== otp) {
    throw new ApiError(httpStatus.BAD_REQUEST, ['invalid', 'otp'], '', '', 'verify_otp'); // If otp doesn't match, throw an error.
  }

  if (token.expires <= new Date()) {
    throw new ApiError(httpStatus.BAD_REQUEST, ['expired', 'otp'], '', '', 'verify_otp'); // If otp expired, throw an error.
  }

  if (!emailExist.is_email_verified) {
    emailExist = await userService.updateUserById(emailExist._id, { is_email_verified: true }); // If user is_email_verified is false, Update (is_email_verified: true) user by _id.
  }

  const tokens = await tokenService.generateAuthTokens(emailExist, req.body?.user_from); // Generate auth token.

  res.status(httpStatus.OK).json({
    success: true,
    message: ['verified_successfully', 'otp'],
    data: { user: emailExist, tokens, is_profile_completed: true },
  });
});

/**
 * POST: Login.
 */
const login = catchAsync(async (req, res) => {
  const { email, password, role_name } = req.body;
  let responseData = {};

  let filter = {
    email,
  };

  if (role_name) filter.role_name = role_name;

  let userData = await userService.getUser(filter); // Get user by email.

  if (!userData) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `You don't have an account with us.`,
      'Please try creating a new account.',
      'warning',
      ACTIVITY_LOG_TYPES.error_types.login_failed
    ); // If email  doesn't exist, throw an error.
  }

  if (userData && !userData.is_active) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      generateMessage('account_blocked'),
      'Please contact us to resolve this issue.',
      '',
      ACTIVITY_LOG_TYPES.error_types.login_failed
    );
  }

  if (!userData.password && userData.social_id) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'You registered with social account, so please try to login with that.',
      '',
      '',
      ACTIVITY_LOG_TYPES.error_types.login_failed
    );
  }

  if (userData && !(await userData.isPasswordMatch(password))) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      generateMessage('incorrect', 'password'),
      'Please try again with correct password.',
      '',
      ACTIVITY_LOG_TYPES.error_types.login_failed
    );
  }

  const tokens = await tokenService.generateAuthTokens(userData, 'App'); // Generate auth token.
  responseData.tokens = tokens;
  // if (req.body.device_token) {
  //   await userService.updateUserById(userDtl._id, {
  //     device_token: req.body.device_token,
  //   });
  // }

  // if (req.body?.device_info) {
  //   /** Match the element which is device_id */
  //   const matchDocument = userData?.device_info.find((ele) => {
  //     return ele?.device_id == req.body.device_info.device_id;
  //   });

  //   if (matchDocument) {
  //     await userService.updateExistDeviceInfo(
  //       { _id: userData._id, 'device_info.device_id': req.body.device_info.device_id },
  //       {
  //         'device_info.$.device_token': req.body.device_info.device_token,
  //         'device_info.$.device_type': req.body.device_info.device_type,
  //         'device_info.$.platform': req.body.device_info.platform,
  //       }
  //     );
  //   } else {
  //     await userService.updateDeviceInfo({ _id: userData._id }, req.body.device_info);
  //   }
  // }

  /** Store activity log */
  await activityLogService.storeActivityLog({
    user: userData?._id,
    message: 'Login successfully.',
    status_code: 200,
    log_type: ACTIVITY_LOG_TYPES.success_types.login_success,
    request_data: {
      body: JSON.stringify(req?.body),
      query: JSON.stringify(req?.query),
      params: JSON.stringify(req?.params),
    },
    email: email,
    error_stack: null,
    route: req.originalUrl,
    method: req.method,
  });

  res.status(httpStatus.OK).json({
    success: true,
    message: generateMessage('successful', 'login'),
    data: responseData,
  });
});

/**
 * POST: Logout.
 */
const logout = catchAsync(async (req, res) => {
  // await tokenService.deleteToken(req.user._id, req.body?.user_from); // Delete token after reset password.
  /**
   * Remove device info for Mobile
   */
  await userService.removeExistDeviceInfo(
    {
      _id: req.user._id,
      'device_info.device_id': req.body.device_info.device_id,
    },
    req.body.device_info.device_id
  );

  /**
   * Remove device token for WEB
   */
  if (req.body?.user_from == USER_FROM.WEB) {
    await userService.updateUserById(req.user._id, { device_token: null });
  }
  /** Store activity log */
  await activityLogService.storeActivityLog({
    user: null,
    message: 'Logout successfully.',
    status_code: 200,
    log_type: ACTIVITY_LOG_TYPES.success_types.logout_success,
    request_data: {
      body: JSON.stringify(req?.body),
      query: JSON.stringify(req?.query),
      params: JSON.stringify(req?.params),
    },
    email: null,
    error_stack: null,
    route: req.originalUrl,
    method: req.method,
  });

  res.status(200).json({ success: true, message: ['successful', 'logout'] });
});

/**
 * POST: Send OTP.
 */
const forgotPassword = catchAsync(async (req, res) => {
  const emailExist = await userService.getUserByEmail(req.body.email, req.body?.role_name); // Get user by email.
  if (!emailExist) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      generateMessage('notRegisteredEmail'),
      'Please enter a valid email.',
      '',
      ACTIVITY_LOG_TYPES.error_types.forgot_password_failed
    ); // If email doesn't exist, throw an error.
  }

  if (!emailExist.is_active) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      generateMessage('account_blocked'),
      'Please contact us to resolve this issue.',
      '',
      ACTIVITY_LOG_TYPES.error_types.forgot_password_failed
    ); // If the user is blocked, throw an error.
  }

  const tokenCreate = await tokenService.generateResetPassToken(emailExist, req.body?.user_from);
  const encryptResetPassToken = await encryptString(tokenCreate, config.crypto.secret);
  const encryptEmail = await encryptString(req.body.email, config.crypto.secret);

  sendEmail(
    req.body.email,
    'Forgot Password!',
    {
      reset_password_link: `${config.front_url}/reset-password?email=${encryptEmail}&vt=${encryptResetPassToken}`,
      social_icons: config.social_icons,
      social_links: config.social_links,
    },
    path.join(__dirname, '../../../views/forgotPasswordTemplate.ejs')
  );

  /** Store activity log */
  await activityLogService.storeActivityLog({
    status: ACTIVITY_LOG_TYPES.type.success,
    user: emailExist._id,
    message: 'Email send for forgot password!',
    status_code: 200,
    log_type: ACTIVITY_LOG_TYPES.success_types.email_send_success,
    request_data: {
      body: JSON.stringify(req?.body),
      query: JSON.stringify(req?.query),
      params: JSON.stringify(req?.params),
    },
    email: req.body.email,
    error_stack: null,
    route: req.originalUrl,
    method: req.method,
  });

  res.status(httpStatus.OK).json({ success: true, message: 'Email sent successfully!' });
});

/**
 * PUT: Reset password.
 */
const resetPassword = catchAsync(async (req, res) => {
  const reqBody = req.body;

  // Get original email from encrypted email
  const originalEmail = await decryptString(reqBody.email, config.crypto.secret);

  const emailExist = await userService.getUserByEmail(originalEmail); // Get user by email.
  if (!emailExist) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      generateMessage('notRegisteredEmail'),
      '',
      '',
      ACTIVITY_LOG_TYPES.error_types.reset_password_failed
    ); // If email doesn't exist, throw an error.
  }

  if (!emailExist.is_active) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      generateMessage('account_blocked'),
      'Please contact us to resolve this issue.',
      '',
      ACTIVITY_LOG_TYPES.error_types.reset_password_failed
    ); // If the user is blocked, throw an error.
  }

  /** Get original reset password token */
  const originalToken = await decryptString(reqBody.vt, config.crypto.secret);

  const getToken = await tokenService.getToken({
    user: emailExist._id,
    token: originalToken,
    expires: { $gte: new Date() },
    type: TOKEN_TYPES.RESET_PASSWORD,
  });
  if (!getToken) {
    throw new ApiError(
      httpStatus.NOT_ACCEPTABLE,
      'Reset password link has expired.',
      '',
      '',
      ACTIVITY_LOG_TYPES.error_types.reset_password_failed
    );
  }

  const bcryptPassword = await bcrypt.hash(reqBody.new_password, 8); // New password bcrypt.

  const updatedUSer = await userService.updateUserById(emailExist._id, {
    password: bcryptPassword,
  }); // Update user password by _id.
  await tokenService.deleteToken(emailExist._id, req.body?.user_from); // Delete token after reset password.

  /** Store activity log */
  await activityLogService.storeActivityLog({
    status: ACTIVITY_LOG_TYPES.type.success,
    user: updatedUSer._id,
    message: 'Reset password successfully.',
    status_code: 200,
    log_type: ACTIVITY_LOG_TYPES.success_types.reset_password_success,
    request_data: {
      body: JSON.stringify(req?.body),
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
    message: generateMessage('reset', 'password'),
  });
});

/** Check link status [Expired, Valid] */
const checkLinkStatus = catchAsync(async (req, res) => {
  const { email, vt } = req.query;

  // Get original email from encrypted email
  const originalEmail = await decryptString(email, config.crypto.secret);
  // Get original token from encrypted token
  const originalToken = await decryptString(vt, config.crypto.secret);

  const emailExist = await userService.getUserByEmail(originalEmail); // Get user by email.
  if (!emailExist) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      generateMessage('not_found', 'user'),
      ACTIVITY_LOG_TYPES.error_types.reset_password_failed
    ); // If email doesn't exist, throw an error.
  }

  const getToken = await tokenService.getToken({
    user: emailExist._id,
    token: originalToken,
    expires: { $gte: new Date() },
    type: TOKEN_TYPES.RESET_PASSWORD,
  });

  res.status(httpStatus.OK).json({
    success: true,
    data: { link_status: getToken ? true : false },
  });
});

/**
 * PUT: Change password.
 */
const changePassword = catchAsync(async (req, res) => {
  const reqBody = req.body;

  if (!(await req.user.isPasswordMatch(reqBody.oldPassword))) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      generateMessage('incorrect', 'password'),
      '',
      '',
      ACTIVITY_LOG_TYPES.error_types.change_password_failed
    ); // If password doesn't match the user's password, throw an error.
  }

  const bcryptPassword = await bcrypt.hash(reqBody.newPassword, 8); // New password bcrypt.

  const updatedUser = await userService.updateUserById(req.user._id, {
    password: bcryptPassword,
  }); // Update user password by _id.

  /** Store activity log */
  await activityLogService.storeActivityLog({
    status: ACTIVITY_LOG_TYPES.type.success,
    user: updatedUser._id,
    message: 'Reset password successfully.',
    status_code: 200,
    log_type: ACTIVITY_LOG_TYPES.success_types.reset_password_success,
    request_data: {
      body: JSON.stringify(req?.body),
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
    message: generateMessage('change', 'password'),
  });
});

/**
 *  remove user
 */
const removeUser = catchAsync(async (req, res) => {
  const user = req.user;
  /**
   * Remove the user from the database (Soft Delete)
   */
  await userService.removeUser(user._id);
  res.status(200).json({
    success: true,
    message: 'Your account is delete successfully',
  });
});

/**
 * All user controllers are exported from here 👇
 */
module.exports = {
  register,
  verifyOtp,
  login,
  logout,
  forgotPassword,
  socialLogin,
  resetPassword,
  changePassword,
  verifyToken,
  checkLinkStatus,
  removeUser,
};
