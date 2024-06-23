const config = require('../config/config');
const httpStatus = require('http-status');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const Token = require('../models/token.model');
const Role = require('../models/role.model');
const AdminToken = require('../models/adminToken.model');
const ApiError = require('../utils/ApiError');
const { TOKEN_TYPES, ROLES, ACTIVITY_LOG_TYPES, USER_FROM } = require('../helper/constant.helper');
const { generateMessage } = require('../helper/function.helper');
const { v4: uuidv4 } = require('uuid');

/**
 * Generate token.
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {string} [secret]
 * @param {string} user_from
 * @returns {string}
 */
const generateToken = (userId, expires, type, role, user_from, secret = config.jwt.secret) => {
  const payload = {
    sub: userId,
    iat: moment().unix(),
    exp: expires.unix(),
    type,
    role,
    user_from,
  };
  return jwt.sign(payload, secret);
};

/**
 * Save a token.
 * @param {string} token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {ObjectId} role
 * @param {string} user_from
 * @param {boolean} [blacklisted]
 * @returns {Promise<Token>}
 */
const saveToken = async (token, userId, expires, type, role, user_from = USER_FROM.WEB, blacklisted = false) => {
  let userObj = {
    token,
    expires: expires.toDate(),
    type,
    blacklisted,
  };

  if (!role) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Role is required for save token!',
      '',
      '',
      ACTIVITY_LOG_TYPES.error_types.save_token_failed
    );
  }

  if (role === ROLES.user) {
    userObj.user = userId;
    await Token.findOneAndUpdate({ user: userId }, { ...userObj, user_from }, { upsert: true, new: true });
  } else if (role === ROLES.super_admin || role === ROLES.sub_admin) {
    userObj.admin = userId;
    await AdminToken.findOneAndUpdate({ admin: userId }, userObj, { upsert: true, new: true });
  }
};

/**
 * Save a OTP.
 * @param {number} otp
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {string} user_from
 * @param {boolean} [blacklisted]
 * @returns {Promise<Token>}
 */
const saveOtp = async (otp, userId, expires, type, role, user_from = USER_FROM.WEB, blacklisted = false) => {
  let userObj = {
    otp,
    otp_expires: expires.toDate(),
    type,
    blacklisted,
  };

  if (!role) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Role is required for save token!');
  }

  if (role === ROLES.user || role === ROLES.breeder || role === ROLES.pet_parent) {
    userObj.user = userId;
    await Token.findOneAndUpdate({ user: userId, user_from }, { ...userObj, user_from }, { upsert: true, new: true });
  } else if (role === ROLES.super_admin || role === ROLES.sub_admin) {
    userObj.admin = userId;
    await AdminToken.findOneAndUpdate({ admin: userId }, userObj, { upsert: true, new: true });
  }
};

/**
 * Generate 6 digit OTP.
 * @returns
 */
const generateOtp = () => ('0'.repeat(4) + Math.floor(Math.random() * 10 ** 4)).slice(-4);

/**
 * Store otp in token table for verify user.
 * @param {object} user
 * @param {string} role
 * @returns {Promise}
 */
const generateOtpToken = async (user, role, user_from = USER_FROM.WEB) => {
  const expires = moment().add(config.jwt.otpExpirationMinutes, 'minutes');
  const otp = generateOtp();
  await saveOtp(otp, user._id, expires, TOKEN_TYPES.VERIFY_OTP, role, user_from);
  return otp;
};

/**
 * Delete user's token
 * @param {import('mongoose').ObjectId} userId
 * @param {string} user_from
 * @returns {Promise<Token>}
 */
const deleteToken = async (userId, user_from = USER_FROM.WEB) => Token.deleteMany({ user: userId, user_from });

/**
 * Get token by filter.
 * @param {object} filter
 * @returns {Promise<Token>}
 */
const getToken = async (filter) => Token.findOne(filter);

/**
 * Get admin token by filter
 * @param {object} filter
 * @returns {Promise<AdminToken>}
 */
const getAdminToken = async (filter) => AdminToken.findOne(filter);

/**
 * Generate auth tokens.
 * @param {User} user
 * @param {string} user_from
 * @returns {Promise<Object>}
 */
const generateAuthTokens = async (user, user_from = USER_FROM.WEB) => {
  const roleDetails = await Role.findOne({ _id: user.role }); // Get role by _id.
  if (!roleDetails)
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      generateMessage('not_found', 'role'),
      '',
      '',
      ACTIVITY_LOG_TYPES.error_types.generate_auth_tokens_failed
    ); // If role doesn't exist, throw an error.

  const accessTokenExpires = moment().add(config.jwt.accessExpirationYear, 'year'); // Set access_token's expire time.
  const accessToken = generateToken(user._id, accessTokenExpires, TOKEN_TYPES.ACCESS, roleDetails.slug, user_from); // Generate a new access token from user's unique id and role's name for authenticate.

  await saveToken(accessToken, user._id, accessTokenExpires, TOKEN_TYPES.ACCESS, roleDetails.slug, user_from); // Create or update token.

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
  };
};

const generateResetPassToken = async (user, user_from = USER_FROM.WEB) => {
  const passTokenExpires = moment().add(config.jwt.resetPassExpirationMinutes, 'minutes');
  const uuid = uuidv4();
  await saveToken(uuid, user._id, passTokenExpires, TOKEN_TYPES.RESET_PASSWORD, user.role_name, user_from);
  return uuid;
};

/**
 * Delete all admin token by filter.
 * @param {ObjectId} adminId
 * @returns {Promise<AdminToken>}
 */
const deleteAdminToken = async (adminId) => {
  return AdminToken.deleteMany({ admin: adminId });
};

/**
 * All token services are exported from here 👇
 */
module.exports = {
  generateOtpToken,
  generateOtp,
  deleteToken,
  getToken,
  getAdminToken,
  generateAuthTokens,
  deleteAdminToken,
  generateResetPassToken,
};
