const mongoose = require('mongoose');
const config = require('../config/config');
const { successColor, errorColor } = require('../helper/color.helper');

module.exports = connectDB = async () => {
  try {
    await mongoose.connect(config.mongoose.url, {
      useNewUrlParser: true,
      autoIndex: true,
      // keepAlive: true,
      useUnifiedTopology: true,
    }); // Database connected.
    console.log(successColor, '✅ Database Connected successfully...');
  } catch (error) {
    console.log(errorColor, '❌ Database Connections Error :', error);
  }
};
