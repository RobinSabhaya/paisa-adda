const Role = require('../models/role.model');
const { successColor, errorColor } = require('../helper/color.helper');
const { ROLES } = require('../helper/constant.helper');
const Permission = require('../models/permission.model');
const AccessPermission = require('../models/accessPermission.model');

const permissions = [
  /** START: Role module */
  {
    module: 'role',
    permission: 'list',
  },
  {
    module: 'role',
    permission: 'view',
  },
  {
    module: 'role',
    permission: 'create',
  },
  {
    module: 'role',
    permission: 'edit',
  },
  {
    module: 'role',
    permission: 'delete',
  },
  /** END: Role module */
];

/**
 * Permissions seeder.
 */
async function permissionsSeeder() {
  try {
    // find new permissions
    const newPermissions = [];
    for (const item of permissions) {
      const existsPermission = await Permission.findOne({
        module: item.module,
        permission: item.permission,
      });

      if (!existsPermission) {
        newPermissions.push({
          slug: `${item.module}_${item.permission}`,
          module: item.module,
          permission: item.permission,
        });
      }
    }
    await Permission.create(newPermissions);
    console.log(successColor, '✅ Permission seeder run successfully...');
    await accessPermissionsSeeder();
  } catch (error) {
    console.log(errorColor, '❌ Error from Permission seeder: ', error);
  }
}

/**
 * Access permissions seeder.
 */
async function accessPermissionsSeeder() {
  try {
    // find admin role
    const adminRole = await Role.findOne({ slug: ROLES.super_admin });

    // get all permissions
    const allPermissions = await Permission.find();
    const accessPermissions = Array.from(allPermissions, (p) => ({
      role: adminRole._id,
      permission: p._id,
    }));

    const newAccessPermissions = [];

    for (const ap of accessPermissions) {
      const existsAP = await AccessPermission.findOne({
        role: ap.role,
        permission: ap.permission,
      });
      if (!existsAP) {
        newAccessPermissions.push({
          role: ap.role,
          permission: ap.permission,
        });
      }
    }
    await AccessPermission.create(newAccessPermissions);

    console.log(successColor, '✅ Access permission seeder run successfully...');
  } catch (error) {
    console.log(errorColor, '❌ Error from access permission seeder: ', error);
  }
}

module.exports = {
  permissionsSeeder,
  accessPermissionsSeeder,
};
