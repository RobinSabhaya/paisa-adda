const Joi = require('joi');
const { objectId } = require('./custom.validation');

/** Create update game validation */
const createUpdateGame = {
  body: Joi.object().keys({
    game_name: Joi.string().optional(),
    game_images: Joi.array().items(Joi.string().required()).optional(),
    game_description: Joi.string().optional(),
    game_price: Joi.number().optional(),
    game_max_score: Joi.number().optional(),
    game_min_score: Joi.number().optional(),
    game_id: Joi.string().custom(objectId).optional(),
  }),
};

/** Get game list */
const getGameList = {
  query: Joi.object().keys({
    page: Joi.number().optional().allow('', null),
    limit: Joi.number().optional().allow('', null),
    sortBy: Joi.string().optional().allow('', null),
  }),
};

module.exports = { createUpdateGame, getGameList };
