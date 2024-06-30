const Joi = require('joi');
const { objectId } = require('./custom.validation');

/** Create update game validation */
const createUpdateGameScore = {
  body: Joi.object().keys({
    game: Joi.string().custom(objectId).required(),
    score: Joi.number().required(),
    game_score_id: Joi.string().custom(objectId).optional(),
  }),
};

/** Delete game score */
const deleteGameScore = {
  params: Joi.object().keys({
    gameId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = { createUpdateGameScore, deleteGameScore };
