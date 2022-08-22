const app = require('./config/api-config');
const path = require('path');

require('dotenv').config()

// const firebase = require('firebase-admin');
// const servicekey= JSON.parse(process.env.FIREBASE_CREDIENTIALS)

// firebase.initializeApp({ credential: firebase.credential.cert(servicekey) });
// const db = firebase.firestore();  

const {initializeApp} = require('firebase/app');
const paypal = require('paypal-rest-sdk');

paypal.configure({
  'mode': 'sandbox', 
  'client_id': 'AQrLroU-NzKZDIWck_9Qw01lU-9cXBsEz9zIXTO71MyiclB6ORM-V5lPkmw-JnL2n6XoluNavV9EKsYW',
  'client_secret': 'EP-UkocoZYxELsNUJL4kfef8lCzuz8HJeV7AdCURxmDVfS7L6_c7bf7fkjUkFMAAGHBKpDuCAEfVGC89'
});

const firebaseConfig = {
    apiKey: "AIzaSyAeC4JoigLnWM2sA6W9P0TMaHCmlqJKvyg",
    authDomain: "test-project-e283b.firebaseapp.com",
    databaseURL: "https://test-project-e283b-default-rtdb.firebaseio.com",
    projectId: "test-project-e283b",
    storageBucket: "test-project-e283b.appspot.com",
    messagingSenderId: "495382361512",
    appId: "1:495382361512:web:e4275e18afd7e6d1afd99d",
    measurementId: "G-KQE3XJ6H0P"
  };

const firebaseApp =initializeApp(firebaseConfig)
// const abc = getFirestore()
// abc.app.automaticDataCollectionEnabled
const indexRouter = require("./routes/index");

app.use("/api/v1/",indexRouter);

app.all("*", (req, res, next) => {
    // return next(new AppError(`${req.originalUrl} not found`, 404));
    const options = {
      root: path.join(__dirname, "public/"),
      dotfiles: "deny",
      headers: {
        "x-timestamp": Date.now(),
        "x-sent": true,
        "Content-Type": "text/html",
      },
    };
    return res.sendFile("404.html", options);
  });