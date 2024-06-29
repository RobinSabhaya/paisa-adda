const config = require('../config/config');
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
        pipeline: [
          {
            $project: {
              game_name: 1,
              game_description: 1,
              game_max_score: 1,
              game_min_score: 1,
              game_price: 1,
              game_images: {
                $map: {
                  input: '$game_images',
                  as: 'game_image',
                  in: {
                    $concat: [config.img_url, '$$game_image'],
                  },
                },
              },
            },
          },
        ],
      },
    },
    {
      $unwind: {
        path: '$game',
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
