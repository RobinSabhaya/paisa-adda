const express = require('express');
const commonRoutes = require('./commonRoutes/index');
const router = express.Router();

router.use('/', commonRoutes);

module.exports = router;
