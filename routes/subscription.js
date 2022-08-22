const express = require('express')
const router = express.Router()

const SubsCrtl = require('../controllers/subscription')
router.use('/success/:email',SubsCrtl.StripePaymentSuccess);
router.use('/failed/:email',SubsCrtl.StripePaymentCancel);
router.use('/paypal_success', SubsCrtl.paypalSuccess);
router.use('/paypal_cancel', SubsCrtl.paypalCancel)
const authorizationToken = require('../middlewares/auth');


router.use('/checkout', authorizationToken,SubsCrtl.payForSubscription);
module.exports = router