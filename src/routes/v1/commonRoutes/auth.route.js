const express = require('express');
const validate = require('../../../middlewares/validate');
const authValidation = require('../../../validations/auth.validation');
const authController = require('../../../controllers/commonControllers/auth.controller');
const auth = require('../../../middlewares/auth');

const router = express.Router();

router.post('/social-login', validate(authValidation.socialLogin), authController.socialLogin);
router.post('/login', validate(authValidation.login), authController.login);
router.post('/register', validate(authValidation.register), authController.register);

module.exports = router;
