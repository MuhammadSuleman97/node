const express = require('express')
const router = express.Router()

const CtrlPack = require('../controllers/package');

router.get('/all', CtrlPack.getAllPackages)

module.exports = router