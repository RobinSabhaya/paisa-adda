const express = require('express');
const gameRoutes = require('./game.route');
const gameScoreRoutes = require('./gameScore.route');
const authRoutes = require('./auth.route');
const router = express.Router();

router.use('/game', gameRoutes);
router.use('/game-score', gameScoreRoutes);
router.use('/auth', authRoutes);

module.exports = router;
