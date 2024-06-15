const express = require('express');
const { createUpdateGameScore, getGameScoreList } = require('../../../controllers/commonControllers/gameScore.controller');
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
/** Get game */
router.get(
  '/list',
  authorizeV3(ROLES.super_admin, ROLES.user),
  validate(gameScoreValidation.getGameScoreList),
  getGameScoreList
);

module.exports = router;
