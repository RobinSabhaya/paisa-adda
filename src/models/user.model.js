const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');
const { roles } = require('../config/roles');
const { SOCIAL_TYPES } = require('../helper/constant.helper');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      // required: true,
      trim: true,
    },
    email: {
      type: String,
      // required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      // required: true,
      trim: true,
      minlength: 8,
      private: true, // used by the toJSON plugin
    },
    role: {
      type: mongoose.Types.ObjectId,
      ref: 'Role',
    },
    role_name: {
      type: String,
      default: null,
    },
    social_id: {
      type: String,
      trim: true,
    },
    social_type: {
      type: String,
      enum: Object.values(SOCIAL_TYPES),
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    device_info: [
      {
        device_id: { type: String },
        device_token: { type: String },
      },
    ],
    user_from: {
      type: String,
      default: 'App',
    },
    is_referral: {
      type: Boolean,
    },
    join_bonus: {
      type: Boolean,
      default: false,
    },
    magic_code: {
      type: String,
      default: null,
    },
    referral_code: {
      type: String,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);
userSchema.plugin(paginate);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

/**
 * @typedef User
 */
const User = mongoose.model('User', userSchema);

module.exports = User;
