const express = require('express');
const validate = require('../../../middlewares/validate');
const authValidation = require('../../../validations/auth.validation');
const authController = require('../../../controllers/commonControllers/auth.controller');
const { authorizeV3 } = require('../../../middlewares/auth');
const { ROLES } = require('../../../helper/constant.helper');

const router = express.Router();

router.post('/social-login', validate(authValidation.socialLogin), authController.socialLogin);
router.post('/login', validate(authValidation.login), authController.login);
router.post('/register', validate(authValidation.register), authController.register);
router.get('/verify-token', authorizeV3(ROLES.user), authController.verifyToken);

module.exports = router;
