const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const versionSchema = mongoose.Schema(
    {
        version: {
            type: String,
            trim: true,
        },
        force_update: {
            type: Boolean,
        },
        soft_update: {
            type: Boolean,
        },
        default_config: {
            type: Boolean,
        },
        maintenance: {
            type: Boolean,
        },
        app_config: {
            type: Object,
            trim: true,
        },
        version_type: {
            type: String,
            trim: true,
        },
        admin: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'Admin',
            default: null,
        },
        maintenance_msg: {
            type: String,
            trim: true,
        },
        app_type: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// add plugin that converts mongoose to json
versionSchema.plugin(toJSON);
versionSchema.plugin(paginate);

/**
 * @typedef Version
 */
const Version = mongoose.model('Version', versionSchema);

module.exports = Version;
