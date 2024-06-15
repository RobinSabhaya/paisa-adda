const userService = require('../../services/user.service');
const mongoose = require('mongoose');
const agenda = require('../agenda');

/**
 * Create a agenda
 * @param {objectId} user_id
 */
const createAgenda = async (user_id) => {
  if (user_id) {
    agenda.define(user_id, async (job, done) => {
      const { magic_code } = job.attrs.data;
      /** Add magic code */
      await userService.updateUser(
        { _id: mongoose.Types.ObjectId(user_id), join_bonus: false },
        { join_bonus: true, magic_code }
      );
      done();
    });
  } else {
    const users = await mongoose.connection.db.collection('agendaJobs').find();
    users.forEach((user) => {
      agenda.define(user.name, async (job) => {
        const { magic_code } = job.attrs.data;
        /** Add magic code */
        await userService.updateUser(
          { _id: mongoose.Types.ObjectId(user.name), join_bonus: false },
          { join_bonus: true, magic_code }
        );
      });
    });
  }
};

module.exports = createAgenda;
