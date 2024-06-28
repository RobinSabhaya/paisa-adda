const { paginationQuery } = require('../helper/mongoose.helper');
const GameScore = require('../models/gameScore.model');

/**
 * Create game score
 * @param {object} reqBody
 * @returns {Promise<GameScore>}
 */
const createGameScore = async (reqBody) => {
  return GameScore.create(reqBody);
};
/**
 * Create game score
 * @param {object} filter
 * @param {object} reqBody
 * @returns {Promise<GameScore>}
 */
const updateGameScore = async (filter, reqBody) => {
  return GameScore.findOneAndUpdate(filter, reqBody, { new: true });
};

/**
 * Get game list
 * @param {object} options
 * @returns {Promise<Game>}
 */
const getGameScoreList = async (options) => {
  const paginate = paginationQuery(options);
  return GameScore.aggregate([
    {
      $match: {
        deletedAt: null,
      },
    },
    {
      $lookup: {
        from: 'games',
        localField: 'game',
        foreignField: '_id',
        as: 'game',
      },
    },
    ...paginate,
  ]);
};

module.exports = {
  createGameScore,
  updateGameScore,
  getGameScoreList,
};
