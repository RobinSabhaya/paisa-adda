const config = require('../config/config');
const FILES_FOLDER = {
  public: 'public',
  temp: 'temp',
  userImages: 'userImages',
};

const FILE_QUALITY = {
  large: { type: 'large', quality: 80 },
  small: { type: 'small', quality: 1 },
};

const ROLES = {
  super_admin: 'super_admin',
  user: 'user',
  sub_admin: 'sub_admin',
};

const SOCIAL_TYPES = {
  apple: 'apple',
  google: 'google',
  facebook: 'facebook',
};

const TOKEN_TYPES = {
  ACCESS: 'access',
  RESET_PASSWORD: 'resetPassword',
  VERIFY_OTP: 'verify_otp',
};

const ACTIVITY_LOG_TYPES = {
  error_types: {
    /** AUTH */
    social_login_failed: 'social_login_failed',
    user_register_failed: 'user_register_failed',
    login_failed: 'login_failed',
    logout_failed: 'logout_failed',
    forgot_password_failed: 'forgot_password_failed',
    reset_password_failed: 'reset_password_failed',
    change_password_failed: 'change_password_failed',
    /** TOKEN */
    save_token_failed: 'save_token_failed',
    generate_auth_tokens_failed: 'generate_auth_tokens_failed',
  },
  success_types: {
    /** AUTH */
    social_login_success: 'social_login_success',
    user_register_success: 'user_register_success',
    login_success: 'login_success',
    logout_success: 'logout_success',
  },
  type: {
    success: ' Success',
    fail: 'Fail',
  },
};

const USER_FROM = {
  WEB: 'Web',
  APP: 'App',
};

const DEVICE_TYPE = {
  ANDROID: 'Android',
  IOS: 'iOS',
};

const VERSION_TYPES = {
  config: 'config',
  ios: 'iOS',
  android: 'android',
};

module.exports = {
  FILES_FOLDER,
  ACTIVITY_LOG_TYPES,
  DEVICE_TYPE,
  FILE_QUALITY,
  ROLES,
  SOCIAL_TYPES,
  VERSION_TYPES,
  USER_FROM,
  TOKEN_TYPES,
};
