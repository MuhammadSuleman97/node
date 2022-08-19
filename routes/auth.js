const express = require('express');
const router = express.Router();

const AuthCrtl = require('../controllers/auth');

router.post('/signup', AuthCrtl.signup);
router.post('/login',AuthCrtl.signIn);
router.post('/reset', AuthCrtl.forgetPassword);


module.exports = router