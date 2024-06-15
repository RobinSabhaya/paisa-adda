const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const { TOKEN_TYPES } = require('../helper/constant.helper');

const adminTokenSchema = new mongoose.Schema(
    {
        token: {
            type: String,
            required: true,
            index: true,
        },
        admin: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'Admin',
            required: true,
        },
        type: {
            type: String,
            enum: [TOKEN_TYPES.ACCESS, TOKEN_TYPES.RESET_PASSWORD, TOKEN_TYPES.VERIFY_OTP],
            required: true,
        },
        expires: {
            type: Date,
            required: true,
        },
        blacklisted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// add plugin that converts mongoose to json
adminTokenSchema.plugin(toJSON);

adminTokenSchema.index({ admin: 1 });

/**
 * @typedef AdminToken
 */
const AdminToken = mongoose.model('Admin_token', adminTokenSchema);

module.exports = AdminToken;
