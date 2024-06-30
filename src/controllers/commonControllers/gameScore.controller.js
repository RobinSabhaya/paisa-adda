const catchAsync = require('../../utils/catchAsync');
const ApiError = require('../../utils/ApiError');
const userService = require('../../services/user.service');
const gameService = require('../../services/game.service');
const gameScoreService = require('../../services/gameScore.service');
const httpStatus = require('http-status');

/** Create Update game Score  */
const createUpdateGameScore = catchAsync(async (req, res) => {
  const { game, game_score_id } = req.body;
  let gameScore, resMessage;
  /** Check user exist or not */
  const existUser = await userService.getUser({ _id: req.user._id });

  if (!existUser) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  req.body.user = existUser._id;

  /** Check game exists or not */
  const gameExists = await gameService.getGame({ _id: game });

  if (!gameExists) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Game not found');
  }

  req.body.game = gameExists._id;

  if (game_score_id) {
    /** update game score */
    gameScore = await gameScoreService.updateGameScore({ _id: game_score_id }, req.body);
    resMessage = 'Game score updated successfully';
  } else {
    /** Create game score */
    gameScore = await gameScoreService.createGameScore(req.body);
    resMessage = 'Game score created successfully';
  }

  res.status(httpStatus.OK).json({
    success: true,
    message: resMessage,
    data: gameScore,
  });
});

/** Get game score list */
const getGameScoreList = catchAsync(async (req, res) => {
  const { ...options } = req.query;
  const gameScoreList = await gameScoreService.getGameScoreList(options);

  res.status(httpStatus.OK).json({
    success: true,
    data: gameScoreList,
  });
});

/** Delete score */
const deleteGameScore = catchAsync(async (req, res) => {
  const { gameId } = req.params;
  const gameScoreExists = await gameScoreService.getGameScore({ _id: gameId, deletedAt: null });
  if (!gameScoreExists) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Game score not found');
  }
  const gameData = await gameScoreService.deleteScore({ _id: gameId });
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Game score deleted successfully',
    data: gameData,
  });
});

module.exports = {
  createUpdateGameScore,
  getGameScoreList,
  deleteGameScore,
};
