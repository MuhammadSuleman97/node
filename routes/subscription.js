const express = require('express')
const router = express.Router()

const SubsCrtl = require('../controllers/subscription')
router.use('/success/:email',SubsCrtl.paymentSuccess);
router.use('/failed/:email',SubsCrtl.paymentCancel)
const authorizationToken = require('../middlewares/auth');


router.use('/checkout', authorizationToken,SubsCrtl.payForSubscription);
module.exports = router