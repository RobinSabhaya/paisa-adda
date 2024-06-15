const passport = require('passport');
const httpStatus = require('http-status');
const Permission = require('../models/permission.model');
const AccessPermission = require('../models/accessPermission.model');
const Role = require('../models/role.model');
const ApiError = require('../utils/ApiError');

const verifyCallback = (req, resolve, reject, requiredRights) => async (err, user, info) => {
  try {
    let requireRights = requiredRights;
    // /**
    //  * if route have optional, then check the auth token exists or valid
    //  * 1. no need to check the permissions if requiredRights have optional and no auth user
    //  * 2. remove optional from requiredRights if have optional and auth user have value and check the permissions
    //  * 3. if requiredRights have not optional and no auth user then gives an error for required authentication
    //  */
    if (requiredRights.includes('optional')) {
      if (user) {
        requireRights = requiredRights.filter((e) => e !== 'optional');
      } else {
        return resolve();
      }
    }

    if (err || info || !user) {
      return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
    }
    req.user = user;

    const permissionExists = await Permission.findOne({ slug: requireRights });
    if (permissionExists) {
      /** check user have access permission */
      const accessPermission = await AccessPermission.findOne({
        permission: permissionExists._id,
        role: user.role,
      });
      if (!accessPermission) {
        return reject(new ApiError(httpStatus.BAD_GATEWAY, 'Permission denied.'));
        // return reject(new ApiError(httpStatus.FORBIDDEN, 'Permission denied.'));
      }

      return resolve();
    }
    return reject(new ApiError(httpStatus.BAD_REQUEST, 'Permission denied.'));
    // return reject(new ApiError(httpStatus.FORBIDDEN, 'Permission denied.'));
  } catch (error) {
    return reject(error);
  }
};

/**
 * Auth middleware.
 * @param  {Array} requiredRights
 * @returns
 */
exports.auth =
  (...requiredRights) =>
  async (req, res, next) => {
    return new Promise((resolve, reject) => {
      passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights))(req, res, next);
    })
      .then(() => next())
      .catch((err) => next(err));
  };

const verifyRoleCallBack = (req, resolve, reject, requiredRights) => async (err, user, info) => {
  try {
    if (requiredRights.includes('optional') && !user) {
      return resolve();
    }

    if (err || info || !user) {
      return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
    }

    const rolesData = await Role.findOne({ _id: user.role });
    if (!rolesData) {
      return reject(new ApiError(httpStatus.NOT_FOUND, 'Role not found!'));
    }

    /** Check user role is include in role require rights. */
    if (!requiredRights.includes(rolesData.slug)) {
      return reject(new ApiError(httpStatus.FORBIDDEN, `FORBIDDEN!`));
    }

    if (!user?.is_active) {
      return reject(new ApiError(httpStatus.UNAUTHORIZED, 'User is not activate.'));
    }

    req.user = user;
    resolve();
  } catch (error) {
    return reject(error);
  }
};
/**
 * If token then decode else give access to get
 * @returns
 */
exports.authorizeV3 =
  (...requiredRights) =>
  async (req, res, next) => {
    return new Promise((resolve, reject) => {
      passport.authenticate('jwt', { session: false }, verifyRoleCallBack(req, resolve, reject, requiredRights))(
        req,
        res,
        next
      );
    })
      .then(() => next())
      .catch((err) => next(err));
  };
