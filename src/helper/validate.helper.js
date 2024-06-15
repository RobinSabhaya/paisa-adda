const Joi = require('joi');
const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/apiError');

const validateReqFromController = (schema, req) => {
    const validSchema = pick(schema, ['params', 'query', 'body']);
    const object = pick(req, Object.keys(validSchema));
    const { value, error } = Joi.compile(validSchema)
        .prefs({ errors: { label: 'key' }, abortEarly: false })
        .validate(object);

    if (error) {
        const errorMessage = error.details.map((details) => details.message).join(', ');
        throw new ApiError(httpStatus.BAD_REQUEST, errorMessage);
    }
    Object.assign(req, value);
    return true;
};

/** Validate records key value for csv file. */
const validateReqFromControllerForCsv = (schema, req) => {
    const validSchema = pick(schema, ['body']);
    const object = pick(req, Object.keys(validSchema));
    const { value, error } = Joi.compile(validSchema)
        .prefs({ errors: { label: 'key' }, abortEarly: false })
        .validate(object);

    if (error) {
        const errorMessage = error.details.map((details) => details.message).join(', ');
        return { error: errorMessage };
    }
    Object.assign(req, value);
    return { value: true };
};

module.exports = { validateReqFromController, validateReqFromControllerForCsv };
