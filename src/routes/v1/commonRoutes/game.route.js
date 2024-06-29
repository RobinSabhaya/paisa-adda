const express = require('express');
const { createUpdateGame, getGameList } = require('../../../controllers/commonControllers/game.controller');
const gameValidation = require('../../../validations/game.validation');
const validate = require('../../../middlewares/validate');
const { authorizeV3 } = require('../../../middlewares/auth');
const { ROLES } = require('../../../helper/constant.helper');
const upload = require('../../../middlewares/upload');
const router = express.Router();

/** Create update game */
router.post(
  '/create-update',
  upload.single('game_image'),
  authorizeV3(ROLES.super_admin, ROLES.user),
  validate(gameValidation.createUpdateGame),
  createUpdateGame
);
/** Get game */
router.get('/list', authorizeV3(ROLES.super_admin, ROLES.user), validate(gameValidation.getGameList), getGameList);

module.exports = router;
