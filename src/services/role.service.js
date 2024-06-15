const httpStatus = require('http-status');
const Admin = require('../models/admin.model');
const Role = require('../models/role.model');
const ApiError = require('../utils/ApiError');
const { generateMessage, generateSlug, str2regex } = require('../helper/function.helper');
const { ROLES } = require('../helper/constant.helper');

/**
 * Get role by name
 * @param {string} roleName
 * @returns {Promise<Role>}
 */
const getRoleByName = async (roleName) => {
  return Role.findOne({
    role: { $regex: '^' + str2regex(roleName) + '$', $options: 'i' },
    deletedAt: null,
  });
};

/**
 * Get role by slug
 * @param {String} slug
 * @returns {Promise<Role>}
 */
const getRoleBySlug = async (slug) => {
  const role = await Role.findOne({ slug: slug, deletedAt: null });

  return role;
};

/**
 * Get role by id
 * @param {ObjectId} roleId
 * @returns {Promise<Role>}
 */
const getRoleById = async (roleId) => {
  return Role.findOne({ _id: roleId, deletedAt: null });
};

/**
 * Create role
 * @param {string} roleName
 * @returns {Promise<Role>}
 */
const createRole = async (roleName) => {
  return Role.create({
    role: roleName,
    role_slug: await generateSlug(roleName),
    slug: ROLES.sub_admin,
  });
};

/**
 * Get role list
 * @param {object} filter
 * @param {object} options
 * @returns {Promise<Role>}
 */
const getRoleList = async (filter, options) => {
  return Role.paginate(filter, options);
};

/**
 * Get sub admin role list
 * @param {object} filter
 * @returns {Promise<Role>}
 */
const getSubAdminRoleList = async (filter) => {
  return Role.find(filter).select('role');
};

/**
 * Update role by id
 * @param {Object} updateBody
 * @param {ObjectId} roleId
 * @returns {Promise<Role>}
 */
const updateRoleById = async (updateBody, roleId) => {
  /** check role exists or not */
  const roleExists = await getRoleById(roleId);
  if (!roleExists) {
    throw new ApiError(httpStatus.NOT_FOUND, generateMessage('not_found', 'role'));
  }

  /** check the role will be update is sub admin or not */
  if (roleExists && roleExists.slug !== ROLES.sub_admin)
    throw new ApiError(httpStatus.BAD_REQUEST, generateMessage('not_allow_update', 'role'));

  const roleSlug = await generateSlug(updateBody.role);

  /** check role name used in other role or not */
  const existsRoleName = await Role.findOne({
    role_slug: roleSlug,
    _id: { $not: { $eq: roleId } },
    deletedAt: null,
  });
  if (existsRoleName) throw new ApiError(httpStatus.BAD_REQUEST, generateMessage('already_taken', 'role'));

  /** update the role data */
  Object.assign(roleExists, {
    ...updateBody,
    role_slug: roleSlug,
  });
  await roleExists.save();

  return roleExists;
};

/**
 * Update role active status by role id
 * @param {ObjectId} roleId
 * @returns {Promise<Role>}
 */
const updateIsActiveByRoleId = async (roleId) => {
  // Get role By _id.
  const roleExists = await getRoleById(roleId);
  if (!roleExists) throw new ApiError(httpStatus.NOT_FOUND, generateMessage('not_found', 'role'));

  /** check the role will be update is sub admin or not */
  if (roleExists && roleExists.slug !== ROLES.sub_admin)
    throw new ApiError(httpStatus.BAD_REQUEST, generateMessage('not_allow_update', 'role'));

  await Role.findByIdAndUpdate(roleExists._id, { $set: { is_active: !roleExists.is_active } });

  return roleExists;
};

/**
 * Delete role by id
 * @param {ObjectId} roleId
 * @returns {Promise<Role>}
 */
const deleteByRoleId = async (roleId) => {
  /** check role exists or not */
  const roleExists = await getRoleById(roleId);
  if (!roleExists) {
    throw new ApiError(httpStatus.NOT_FOUND, generateMessage('not_found', 'role'));
  }

  /** check the role will be delete is sub admin or not */
  if (roleExists && roleExists.slug !== ROLES.sub_admin)
    throw new ApiError(httpStatus.BAD_REQUEST, generateMessage('not_allow_delete', 'role'));

  const findAdminByThisRole = await Admin.findOne({ role: roleId, deletedAt: null });
  if (findAdminByThisRole) {
    throw new ApiError(400, "Role is in used so you can't delete this role.");
  }

  /** update the role data */
  Object.assign(roleExists, {
    deletedAt: new Date(),
  });
  await roleExists.save();

  /** Delete all access permissions for deleted role. */
  await AccessPermission.deleteMany({ role: roleId });

  return roleExists;
};

/**
 * All role services are exported from here 👇
 */
module.exports = {
  getRoleByName,
  getRoleBySlug,
  getRoleById,
  createRole,
  getRoleList,
  updateRoleById,
  updateIsActiveByRoleId,
  deleteByRoleId,
  getSubAdminRoleList,
};
