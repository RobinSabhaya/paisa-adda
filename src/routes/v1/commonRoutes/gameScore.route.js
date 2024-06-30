const express = require('express');
const {
  createUpdateGameScore,
  getGameScoreList,
  deleteGameScore,
} = require('../../../controllers/commonControllers/gameScore.controller');
const gameScoreValidation = require('../../../validations/gameScore.validation');
const validate = require('../../../middlewares/validate');
const { authorizeV3 } = require('../../../middlewares/auth');
const { ROLES } = require('../../../helper/constant.helper');

const router = express.Router();

/** Create update game score */
router.post(
  '/create-update',
  authorizeV3(ROLES.super_admin, ROLES.user),
  validate(gameScoreValidation.createUpdateGameScore),
  createUpdateGameScore
);
/** Get game score */
router.get(
  '/list',
  authorizeV3(ROLES.super_admin, ROLES.user),
  validate(gameScoreValidation.getGameScoreList),
  getGameScoreList
);
/** delete game */
router.delete(
  '/:gameId',
  authorizeV3(ROLES.super_admin, ROLES.user),
  validate(gameScoreValidation.deleteGameScore),
  deleteGameScore
);

module.exports = router;
