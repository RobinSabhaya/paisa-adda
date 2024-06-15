const httpStatus = require('http-status');
const gameService = require('../../services/game.service');
const catchAsync = require('../../utils/catchAsync');
const ApiError = require('../../utils/ApiError');

/** Create update game */
const createUpdateGame = catchAsync(async (req, res) => {
  const { game_name, game_id } = req.body;
  let gameData, resMessage;
  /** Check game exist or not */
  const gameExist = gameService.getGame({ game_name, _id: game_id });
  if (!gameExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Game not found');
  }
  if (game_id) {
    gameData = await gameService.updateGame({ _id: game_id }, req.body);
    resMessage = 'Game updated successfully';
  } else {
    /** Create game */
    gameData = await gameService.createGame(req.body);
    resMessage = 'Game created successfully';
  }
  res.status(httpStatus.CREATED).json({
    success: true,
    message: resMessage,
    data: gameData,
  });
});

/** Get game list */
const getGameList = catchAsync(async (req, res) => {
  const { ...options } = req.query;

  /** Get game list */
  const getGameList = await gameService.getGameList(options);

  res.status(httpStatus.OK).json({
    success: true,
    data: getGameList,
  });
});

module.exports = { getGameList, createUpdateGame };
