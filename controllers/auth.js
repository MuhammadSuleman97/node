const {firebase} = require('firebase/app');
const jwt = require('jsonwebtoken');
const {getFirestore, doc, setDoc, getDoc, getDocs, collection, updateDoc} = require('firebase/firestore');
const db = getFirestore();
const {getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } = require('firebase/auth');
const auth = getAuth();
exports.signup = async (req,res,next)=>{
    try{
        const {email, password,first_name,last_name} = req.body;
        if(!email || !password || !first_name || !last_name){return res.json({
            status: "failed",
            message: "invalid Data!"
        })}
        const user = {
            email: email,
            emailVerified: false,
            disabled: false,
            first_name: first_name,
            last_name: last_name,
            attemptedQuestions: [],
            transactions:[],
            progress: 0.00,
            package_id:'free',
            subscription_validity: new Date(new Date().setFullYear(new Date().getFullYear() + 5))
        }
        let userResponse;
        try{
            userResponse = await createUserWithEmailAndPassword(auth,email,password)
            
        }catch(e){
            console.log(e);
            return res.json({status: 400, message: "Sorry, This Email is already Registered!" })
        }
        const docRef = doc(db, "Users",userResponse.user.email);
        user["accessToken"] = jwt.sign({id: email.toLowerCase()}, "ABCDEFG")
        await setDoc(docRef, user);
        return res.json({
            status: 200,
            message: "Congrats, Your account has been created!",
            data: {user: user}
        });
    }catch(e){
        console.log(e);
        return res.json({status: 400, message:e.message})
    }
};

exports.signIn = async (req, res, next) => {
    try{
        let email = req.body.email
        const password = req.body.password;
        
        if(!email || !password) return res.json({status: 400, message:"provide valid email and password!"});
        email = email.toLowerCase();
        let userResponse;
        const accessToken = jwt.sign({id: email.toLowerCase()}, "ABCDEFG");
        let user;
        try{
            userResponse = await signInWithEmailAndPassword(auth ,email , password);
            userRef = doc(db, "Users", email);
            let userSnap = await getDoc(userRef)
            user = await userSnap.data();
            user ? user["accessToken"] = accessToken : ''
        }catch(e){
            console.log(e);
            if (e.code === 'auth/wrong-password'){
                return res.json({status: 400, message: "Please Enter correct Password!" });
            } else if(e.code === 'auth/user-not-found'){
                return res.json({status: 404, message: "User Account Does not Exist!" });
            }
        }
        return res.json({status: 200, message: "Welcome to BestWebCv", data: {user}})

    }catch(e){
        console.log(e);
        return res.json({status: 400, message:e.message})
    }
};

exports.forgetPassword = async (req, res, next) => {
    try{
        const email = req.body.email;
        if (!email){
            return res.json({status: 400, message:"Provide a valid Email Address!"})
        }
        let Response = await sendPasswordResetEmail(auth, email);
        return res.json({status: 200, message: "Email Sent to your registered account (Please check spam as well)"})
    }catch(e){console.log(e);return res.json({status: 400, message: "Please Provide a valid Email Address"})}
}


