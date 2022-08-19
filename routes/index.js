const express = require('express');
const router = express.Router();

const authRouter = require('./auth');
const quesRouter = require('./question');
const userRouter = require('./user');
const subsRouter = require('./subscription');
const packRouter = require('./package');

router.use("/auth", authRouter);
router.use('/questions', quesRouter);
router.use('/user', userRouter);
router.use('/payment', subsRouter);
router.use('/package', packRouter)

module.exports = router