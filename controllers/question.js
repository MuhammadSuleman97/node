const {getFirestore, doc, setDoc, getDoc, getDocs, collection, updateDoc, getId} = require('firebase/firestore');
const db = getFirestore();
const { getAuth } = require('firebase/auth');
const auth = getAuth();

exports.getSingleQuestion = async (req, res, next) => {
    try{
        let docRef = doc(db,"Questions",req.params.id);
        let docSnap = await getDoc(docRef) 
        if (docSnap.exists()) {
            let question = docSnap.data()
            console.log("Document data:", docSnap.data());
            return res.json({status: 200, message: "Retrieved document",question})
          } else {
            console.log("No such Question!");
            return res.json({status: 404, message: "No Such Question Exist"})
          }
    }
    catch(e)
    {
        console.log(e);
        return res.json({status: 400, message:e.message})
    }
}

exports.getAllQuestions = async (req, res, next) => {
    try{
        const querySnapshot = await getDocs(collection(db, "Questions"));
        let questions=[]
        querySnapshot.forEach((doc) => {
            questions.push({title: doc.data().title, isLocked: doc.data().isLocked, is_attempted: req.user.attemptedQuestions.includes(doc.id), question_id: doc.id})
        });
        questions.sort()
        return res.json({status: 200, message: "Retrieved all documents",data: {questions: questions, is_subscribed: new Date(req.user.subscription_validity.seconds * 1000) > new Date() && req.user.package_id == 'premium'}})
    }
    catch(e)
    {
        console.log(e);
        return res.json({status: 400, message:e.message})
    }
}