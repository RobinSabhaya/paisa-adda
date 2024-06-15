const Game = require('../models/game.model');
const { paginationQuery } = require('../helper/mongoose.helper');

/**
 * Create a new game
 * @param {object} reqBody
 * @returns {Promise<Game>}
 */
const createGame = async (reqBody) => {
  return Game.create(reqBody);
};

/**
 * Update game
 * @param {object} filter
 * @param {object} reqBody
 * @returns {Promise<Game>}
 */
const updateGame = async (filter, reqBody) => {
  return Game.findOneAndUpdate(filter, reqBody, { new: true });
};

/**
 * Get game
 * @param {object} filter
 * @returns{Promise<Game>}
 */
const getGame = async (filter) => {
  return Game.findOne({ ...filter, deletedAt: null });
};

/**
 * Get game list
 * @param {object} options
 * @returns {Promise<Game>}
 */
const getGameList = async (options) => {
  const paginate = paginationQuery(options);
  return Game.aggregate([
    {
      $match: {
        deletedAt: null,
      },
    },
    ...paginate,
  ]);
};

module.exports = { createGame, updateGame, getGame, getGameList };
