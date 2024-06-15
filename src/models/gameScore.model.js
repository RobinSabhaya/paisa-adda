const mongoose = require('mongoose');
const { paginate, toJSON } = require('./plugins');

const gameScoreSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    game: {
      type: mongoose.Types.ObjectId,
      ref: 'Game',
    },
    score: {
      type: Number,
      default: 0,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timeStamps: true,
    versionKey: false,
  }
);

// add plugin that converts mongoose to json
gameScoreSchema.plugin(toJSON);
gameScoreSchema.plugin(paginate);

const GameScore = mongoose.model('Game_Score', gameScoreSchema);

module.exports = GameScore;
