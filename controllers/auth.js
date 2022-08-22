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
            progress: '0%', 
            subscription_validity: new Date(new Date().setDate(new Date().getDate() - 1))
        }
        let userResponse;
        try{
            userResponse = await createUserWithEmailAndPassword(auth,email,password)
            
        }catch(e){
            console.log(e);
            return res.json({status: 400, message: e.message })
        }
        const docRef = doc(db, "Users",userResponse.user.email);
        await setDoc(docRef, user)
        return res.json({
            status: 200,
            message: "User Created",
            data: {userResponse}
        });
    }catch(e){
        console.log(e);
        return res.json({status: 400, message:e.message})
    }
};

exports.signIn = async (req, res, next) => {
    try{
        const email = req.body.email
        const password = req.body.password
        
        if(!email || !password) return res.json({status: 400, message:"provide valid email and password!"})
        let userResponse;
        const accessToken = jwt.sign({id: email}, "ABCDEFG")
        try{
            userResponse = await signInWithEmailAndPassword(auth ,email , password);
            userResponse["accessToken"] = accessToken;
            userRef = doc(db, "Users", email);
            let userSnap = await getDoc(userRef)
            let user = userSnap.data();
            user.Token ? user.Token = accessToken : user["Token"] = accessToken;
            await updateDoc(userRef, user)
        }catch(e){
            console.log(e);
            return res.json({status: 400, message: e.message });
        }
        return res.json({status: "success", data: {userResponse}})

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
        return res.json({status: 200, message: "Email Sent"})
    }catch(e){console.log(e);return res.json({status: 400, message:e.message})}
}


