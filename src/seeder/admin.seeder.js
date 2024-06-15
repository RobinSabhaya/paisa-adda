const { successColor, errorColor } = require('../helper/color.helper');
const { ROLES } = require('../helper/constant.helper');
const Admin = require('../models/admin.model');
const Role = require('../models/role.model');

const adminData = [
  {
    first_name: 'Admin',
    last_name: 'user',
    email: 'admin.happypet@gmail.com',
    password: 'Admin@123',
    mobile_no: null,
    is_email_verified: true,
    is_active: true,
  },
];

/**
 * Admin seeder.
 */
module.exports = adminSeeder = async () => {
  const adminRole = await Role.findOne({ role_slug: ROLES.super_admin });

  try {
    for (let admin of adminData) {
      const adminExist = await Admin.findOne({ email: admin.email }); // Get Admin by email.

      if (!adminExist) await Admin.create({ ...admin, role: adminRole._id }); // If admin doesn't exists, create admin.
    }

    console.log(successColor, '✅ Admin seeder run successfully...');
  } catch (error) {
    console.log(errorColor, '❌ Error from admin seeder :', error);
  }
};
