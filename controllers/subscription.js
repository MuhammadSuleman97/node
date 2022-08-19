const {getFirestore, doc, setDoc, getDoc, getDocs, collection, updateDoc} = require('firebase/firestore');
const db = getFirestore();
const stripe = require('stripe')('sk_test_51LVrjiJKThHcYZjG9TI5demkopupihchNUMbQzMrVHDr65l7EdeONvZ1gP6XMNvirdWrSVCVupFnqSFaBKruFd6H00w7vyJPot');

exports.payForSubscription = async (req, res, next) => {
    const email = req.email;
    const user = req.user;
    let date = new Date(user.subscription_validity.seconds * 1000);
    if (date> new Date()){
        return res.json({ status: 200, message: `Your Subscription is Valid till ${date.toLocaleDateString()}`})
    }
    const session = await stripe.checkout.sessions.create({
        line_items: [
            { 
                price: 'price_1LVsIGJKThHcYZjG1t1QQTBI',
                quantity: 1
            }
        ], 
        mode: 'payment',
        success_url: `http://localhost:3000/api/v1/payment/success/${email}`,
        cancel_url: `http://localhost:3000/api/v1/payment/failed/${email}`,
        client_reference_id: req.email
    });

    // res.redirect(303, session.url)
    return res.json({
        status: 200,
        message: "Redirecting to Checkout Page!",
        data: {checkoutUrl : session.url}

    })
};

exports.paymentSuccess = async (req, res, next) => {
    const email = req.params.email;

    let docRef = doc(db,"Users",email);
    let docSnap = await getDoc(docRef);
    let user = docSnap.data();

    user.subscription_validity = new Date(new Date().setMonth(new Date().getMonth() + 1));

    await updateDoc(docRef, user)


    res.redirect('/success.html')
}

exports.paymentCancel = async (req, res) => {
    res.redirect('/failure.html')
}