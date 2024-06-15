// const ActivityLog  = require('../models/ac');

/**
 * Store activity logs
 * @param {object} logData
 * @returns
 */
const storeActivityLog = async (logData) => {
  // return ActivityLog.create(logData);
};

/**
 * Get activity log list for admin
 * @param {object} reqQuery
 * @returns {Promise<ActivityLog>}
 */
const getActivityLogList = async (reqQuery) => {
  // const { search, ...options } = reqQuery;
  // let filter = {};
  // if (search) {
  //   filter.$or = [
  //     { email: { $regex: search, $options: 'i' } },
  //     { log_type: { $regex: search, $options: 'i' } },
  //     { status: { $regex: search, $options: 'i' } },
  //   ];
  // }
  // options.populate = { path: 'user', select: ['first_name', 'last_name', 'user_image'] };
  // return ActivityLog.paginate(filter, options);
};

module.exports = {
  storeActivityLog,
  getActivityLogList,
};
