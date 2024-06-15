const { successColor, errorColor } = require('../helper/color.helper');
const { ROLES } = require('../helper/constant.helper');
const Role = require('../models/role.model');

/**
 * Role seeder.
 */
module.exports = roleSeeder = async () => {
  try {
    // const rolesData = Object.values(ROLES) // Get all role name.
    const rolesData = [
      {
        role: ROLES.super_admin,
        role_slug: ROLES.super_admin,
        slug: ROLES.super_admin,
        is_active: true,
        deletedAt: null,
      },
      {
        role: ROLES.user,
        role_slug: ROLES.user,
        slug: ROLES.user,
        is_active: true,
        deletedAt: null,
      },
    ];

    for (let role of rolesData) {
      const alreadyExist = await Role.findOne({ role_slug: role.role_slug }); // Get role by role name.

      if (!alreadyExist) await Role.create(role); // If role doesn't exists, create role.
    }

    console.log(successColor, '✅ Role seeder run successfully...');
  } catch (error) {
    console.log(errorColor, '❌ Error from role seeder :', error);
  }
};
