const Joi = require('joi');
const { SOCIAL_TYPES, ROLES, USER_FROM, DEVICE_TYPE } = require('../helper/constant.helper');

/**
 * Register.
 */
const register = {
  body: Joi.object().keys({
    name: Joi.string().trim().required(),
    email: Joi.string().trim().email().required(),
    password: Joi.string().trim().required(),
    device_info: Joi.object()
      .keys({
        device_id: Joi.string().trim().optional(),
        device_type: Joi.string().trim().valid(DEVICE_TYPE.ANDROID, DEVICE_TYPE.IOS).optional(),
        device_token: Joi.string().trim().optional(),
        platform: Joi.string().trim().valid(USER_FROM.WEB, USER_FROM.APP).required(),
      })
      .optional(),
    user_from: Joi.string().valid(USER_FROM.WEB, USER_FROM.APP).trim().optional().allow('', null),
    role_name: Joi.string()
      .trim()
      .valid(...Object.values(ROLES))
      .optional()
      .allow('', null),
  }),
};

/**
 * Add mobile number.
 */
const addMobile = {
  body: Joi.object().keys({
    mobile_no: Joi.string().trim().required(),
    user_from: Joi.string().valid(USER_FROM.WEB, USER_FROM.APP).trim().optional().allow('', null),
  }),
};

/**
 * Verify OTP.
 */
const verifyOtp = {
  query: Joi.object().keys({
    mobile_no: Joi.string().trim().required(),
    otp: Joi.string().trim().required(),
    user_from: Joi.string().valid(USER_FROM.WEB, USER_FROM.APP).trim().optional().allow('', null),
  }),
};

/**
 * Login.
 */
const login = {
  body: Joi.object().keys({
    email: Joi.string().trim().email().required(),
    password: Joi.string().trim().required(),
    device_token: Joi.string().trim().allow(''),
    device_info: Joi.object()
      .keys({
        device_id: Joi.string().trim().optional(),
        device_type: Joi.string().trim().valid(DEVICE_TYPE.ANDROID, DEVICE_TYPE.IOS).optional(),
        device_token: Joi.string().trim().optional(),
        platform: Joi.string().trim().valid(USER_FROM.WEB, USER_FROM.APP).required(),
      })
      .optional(),
    user_from: Joi.string().valid(USER_FROM.WEB, USER_FROM.APP).trim().optional().allow('', null),
    role_name: Joi.string().trim().valid().optional().allow('', null),
  }),
};

/**
 * Logout.
 */
const logout = {
  body: Joi.object().keys({
    // accessToken: Joi.string().trim().required(),
    user_from: Joi.string().valid(USER_FROM.WEB, USER_FROM.APP).trim().optional().allow('', null),
    device_info: Joi.object()
      .keys({
        device_id: Joi.string().trim().optional(),
        device_type: Joi.string().trim().valid(DEVICE_TYPE.ANDROID, DEVICE_TYPE.IOS).optional(),
        device_token: Joi.string().trim().optional(),
        platform: Joi.string().trim().valid(USER_FROM.WEB, USER_FROM.APP).required(),
      })
      .optional(),
  }),
};

/**
 * Send OTP.
 */
const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    role_name: Joi.string()
      .trim()
      .optional()
      .allow('', null)
      .valid(...Object.values(ROLES)),
    user_from: Joi.string().valid(USER_FROM.WEB, USER_FROM.APP).trim().optional().allow('', null),
  }),
};

/**
 * Social login.
 */
const socialLogin = {
  body: Joi.object().keys({
    name: Joi.string().optional().trim().allow(''),
    email: Joi.string().required().trim(),
    social_id: Joi.string().required().trim(),
    social_type: Joi.string()
      .valid(...Object.values(SOCIAL_TYPES))
      .required(),
    role_name: Joi.string()
      .required()
      .trim()
      .valid(...Object.values(ROLES))
      .allow(''),
    device_info: Joi.object()
      .keys({
        device_id: Joi.string().trim().optional(),
        device_type: Joi.string().trim().valid(DEVICE_TYPE.ANDROID, DEVICE_TYPE.IOS).optional(),
        device_token: Joi.string().trim().optional(),
        platform: Joi.string().trim().valid(USER_FROM.WEB, USER_FROM.APP).required(),
      })
      .optional(),
    user_from: Joi.string().valid(USER_FROM.WEB, USER_FROM.APP).trim().optional().allow('', null),
  }),
};

/**
 * Reset password.
 */
const resetPassword = {
  body: Joi.object().keys({
    email: Joi.string().trim().required(),
    new_password: Joi.string().trim().required(),
    vt: Joi.string().trim().required(),
    user_from: Joi.string().valid(USER_FROM.WEB, USER_FROM.APP).trim().optional().allow('', null),
  }),
};

/** Check link status [Expired, Valid] */
const checkLinkStatus = {
  query: Joi.object().keys({
    email: Joi.string().trim().required(),
    vt: Joi.string().trim().required(),
  }),
};

/**
 * Change password.
 */
const changePassword = {
  body: Joi.object().keys({
    oldPassword: Joi.string().trim().required(),
    newPassword: Joi.string().trim().required(),
  }),
};

/**
 * All auth validations are exported from here 👇
 */
module.exports = {
  register,
  addMobile,
  verifyOtp,
  login,
  logout,
  forgotPassword,
  socialLogin,
  resetPassword,
  changePassword,
  checkLinkStatus,
};
