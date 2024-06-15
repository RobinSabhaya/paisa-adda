const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');
const { FILES_FOLDER } = require('../helper/constant.helper');
const config = require('../config/config');

const adminSchema = mongoose.Schema(
    {
        first_name: {
            type: String,
            trim: true,
        },
        last_name: {
            type: String,
            trim: true,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error('Invalid email');
                }
            },
        },
        password: {
            type: String,
            trim: true,
            minlength: 8,
            validate(value) {
                if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
                    throw new Error('Password must contain at least one letter and one number');
                }
            },
            private: true, // used by the toJSON plugin
        },
        mobile_no: {
            type: String,
            trim: true,
            default: null,
        },
        role: {
            type: mongoose.Types.ObjectId,
            ref: 'Role',
        },
        admin_image: {
            type: String,
            default: null,
        },
        is_email_verified: {
            type: Boolean,
            default: false,
        },
        is_active: {
            type: Boolean,
            default: true,
        },
        role_name: {
            type: String,
            default: null,
        },
        deletedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false,
        toJSON: {
            transform: function (_doc, ret) {
                ret.admin_image = ret.admin_image
                    ? `${config.image_url}${FILES_FOLDER.adminImages}/${ret.admin_image}`
                    : `${config.base_url}/default/default-image.jpg`;
            },
        },
    }
);

// add plugin that converts mongoose to json
adminSchema.plugin(toJSON);
adminSchema.plugin(paginate);

/**
 * Check if email is taken
 * @param {string} email - The admin's email
 * @param {ObjectId} [excludeAdminId] - The id of the admin to be excluded
 * @returns {Promise<boolean>}
 */
adminSchema.statics.isEmailTaken = async function (email, excludeAdminId) {
    const admin = await this.findOne({ email, _id: { $ne: excludeAdminId } });
    return !!admin;
};

/**
 * Check if password matches the admin's password.
 * @param {string} password
 * @returns {Promise<boolean>}
 */
adminSchema.methods.isPasswordMatch = async function (password) {
    const admin = this;
    return bcrypt.compare(password, admin.password);
};

adminSchema.pre('save', async function (next) {
    const admin = this;
    if (admin.isModified('password')) {
        admin.password = await bcrypt.hash(admin.password, 8);
    }
    next();
});

/**
 * @typedef Admin
 */
const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
