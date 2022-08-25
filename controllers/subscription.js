const {getFirestore, doc, setDoc, getDoc, getDocs, collection, updateDoc} = require('firebase/firestore');
const db = getFirestore();
const stripe = require('stripe')('sk_test_51LVrjiJKThHcYZjG9TI5demkopupihchNUMbQzMrVHDr65l7EdeONvZ1gP6XMNvirdWrSVCVupFnqSFaBKruFd6H00w7vyJPot');
const paypal = require('paypal-rest-sdk');
const {paymentEvent} = require('../utils/pusher');
const base_url = process.env.BASE_URL || 'http://localhost:3000'

exports.payForSubscription = async (req, res, next) => {
    try{
    const email = req.email;
    const user = req.user;
    const pay_method = req.query.pay_method
    const package_id = req.query.package
    
    if(!pay_method) return res.json({ status : "failed", message : "Please provide a valid payment Method!"})
    if(!package_id) return res.json({ status : "failed", message : "Please provide a valid package_id"})

    const packRef = doc(db,"Package",package_id);
    let packSnap = await getDoc(packRef);
    let package;
    if (packSnap.exists()) {
        package = packSnap.data()
    } else {
        console.log("Invalid Package ID");
        return res.json({status: 404, message: "No Package Found!"})
    }
    let date = new Date(user.subscription_validity.seconds * 1000);
    if (user.package_id == package_id && date > new Date()){
        return res.json({ status: 200, message: `Your ${packSnap.id} Subscription is Valid till ${date.toLocaleDateString()}`})
    }
    if (pay_method === "card"){
        const session = await stripe.checkout.sessions.create({
            line_items: [
                { 
                    price: 'price_1LZGWMJKThHcYZjGzhPdtupf',
                    quantity: 1
                }
            ], 
            mode: 'payment',
            success_url: `${base_url}/api/v1/payment/success/${email}`,
            cancel_url: `${base_url}/api/api/v1/payment/failed/${email}`,
            client_reference_id: req.email
        });

        user.transactions.push(session.id);
        const userRef = doc(db, "Users",req.email);
        await updateDoc(userRef, user);
        const tranRef = doc(db, "Transactions", session.id);
        const transaction = {
            price: package.price,
            currency: package.currency,
            email: req.email,
            status: "created"    
        }
        await setDoc(tranRef, transaction)
        // res.redirect(303, session.url)
        return res.json({
            status: 200,
            message: "Redirecting to Checkout Page!",
            data: {checkoutUrl : session.url}

        })
    }
    else if (pay_method === 'paypal'){
        const create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": `${base_url}/api/v1/payment/paypal_success`,
                "cancel_url": `${base_url}/api/v1/payment/paypal_failure`
            },
            "transactions": [{
                "item_list": {
                    "items": [{
                        "name": package.title,
                        "sku": "001",
                        "price": package.price,
                        "currency": package.currency,
                        "quantity": 1
                    }]
                },
                "amount": {
                    "currency": package.currency,
                    "total": package.price
                },
                "description": "This is the payment description."
            }]
          };

          paypal.payment.create(create_payment_json, async function (error, payment) {
            if (error) {
                throw error;
            } else {
                console.log("Create Payment Response");
                console.log(payment);
                user.transactions.push(payment.id);
                const userRef = doc(db, "Users",req.email);
                await updateDoc(userRef, user);
                const tranRef = doc(db, "Transactions", payment.id);
                const transaction = {
                    price: package.price,
                    currency: payment.transactions[0].amount.currency,
                    email: req.email,
                    status: payment.state      
                }
                await setDoc(tranRef, transaction)
                for (let i= 0; i< payment.links.length; i++){
                  if (payment.links[i].rel === 'approval_url') {
                    return res.json({status: 200, message: "Paypal Payment Initiated!", data: {checkoutUrl: payment.links[i].href} })}
                }
            }
          });
    } else{
        return res.json({status: 404, message: 'Invalid method'})
    }}
    catch(e){console.log(e); return e.messgae}
};

exports.StripePaymentSuccess = async (req, res, next) => {
    const email = req.params.email;

    let userRef = doc(db,"Users",email);
    let userSnap = await getDoc(userRef);
    let user = userSnap.data();

    user.subscription_validity = new Date(new Date().setMonth(new Date().getMonth() + 1));
    user.package_id = 'premium'

    await updateDoc(userRef, user);
    await paymentEvent(email, 'premium')

    res.redirect('/success.html')
}

exports.StripePaymentCancel = async (req, res) => {
    res.redirect('/failure.html')
}

exports.paypalSuccess = async (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    let docRef = doc(db, "Transactions", paymentId);
    let docSnap = await getDoc(docRef)
    let transaction;
    if (docSnap.exists()) {
        transaction = docSnap.data()
    } else {
    console.log("No such transaction exist!");
    return res.json({status: 404, message: "No Transaction Found!"})
    }

    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
        "amount" : {
            "currency" : transaction.currency,
            "total" : transaction.price
            }
        }]
    };

    paypal.payment.execute(paymentId, execute_payment_json , async function(err, payment) {
        if(err){
          console.log(err.message);
          throw err
        } else {
          console.log("Get payment Response");
          console.log(JSON.stringify(payment));
          let docRef = doc(db, "Transactions",payment.id);
          let docSnap = await getDoc(docRef)
          let transaction = docSnap.data()
          transaction.status = payment.state;
          updateDoc(docRef, transaction)
          let userRef = doc(db, "Users", transaction.email);
          userSnap = await getDoc(userRef);
          let user = userSnap.data();
          user.subscription_validity = new Date(new Date().setMonth(new Date().getMonth() + 1));
          user.package_id = 'premium'
      
          await updateDoc(userRef, user);
          await paymentEvent(transaction.email, 'premium')

          res.redirect('/success.html')
        }
    });
}

exports.paypalCancel = (req, res) => {
    res.redirect('/failure.html')
}

