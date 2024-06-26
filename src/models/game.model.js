const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const gameSchema = mongoose.Schema(
  {
    game_name: {
      type: String,
    },
    game_description: {
      type: String,
    },
    game_price: {
      type: Number,
    },
    game_max_score: {
      type: Number,
    },
    game_min_score: {
      type: Number,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// add plugin that converts mongoose to json
gameSchema.plugin(toJSON);
gameSchema.plugin(paginate);

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;
