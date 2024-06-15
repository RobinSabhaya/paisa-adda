const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const roleSchema = mongoose.Schema(
    {
        role: {
            type: String,
            trim: true,
        },
        role_slug: {
            type: String,
            trim: true,
        },
        slug: {
            type: String,
            trim: true,
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
    { timestamps: true, versionKey: false }
);

roleSchema.plugin(toJSON);
roleSchema.plugin(paginate);

const Role = mongoose.model('Role', roleSchema);
module.exports = Role;
