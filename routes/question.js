const express = require('express');
const router = express.Router();

const authenticateToken = require('../middlewares/auth')
const QuestionCtrl = require('../controllers/question')

router.get('/:id', authenticateToken ,QuestionCtrl.getSingleQuestion);
router.get('/',authenticateToken , QuestionCtrl.getAllQuestions);
router.post('/submit', authenticateToken, QuestionCtrl.submitAnswer)


module.exports = router