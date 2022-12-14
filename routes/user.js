const express = require('express')

const router = express.Router()

const authenticateToken = require('../middlewares/auth')
const UserCtrl = require('../controllers/user')

router.get('/', authenticateToken,UserCtrl.getUserData);
router.post('/update', authenticateToken,UserCtrl.updateUserProgress)
router.post('/updateuser', authenticateToken, UserCtrl.updateUser)

module.exports = router