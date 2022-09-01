const {getFirestore, doc, setDoc, getDoc, getDocs, collection, updateDoc, getId} = require('firebase/firestore');
const db = getFirestore();
const { getAuth } = require('firebase/auth');
const auth = getAuth();
const {questionAttemptEvent} = require('../utils/pusher')
const axios = require('axios');

exports.getSingleQuestion = async (req, res, next) => {
    try{
        let docRef = doc(db,"Questions",req.params.id);
        let docSnap = await getDoc(docRef);
        let training = req.query.training
        let is_subscribed = new Date(req?.user?.subscription_validity.seconds * 1000) > new Date() && req.user.package_id == 'premium'
        if (docSnap.exists()) {
            let question = docSnap.data();
            question["question_id"] = docSnap.id
            if (training) {
                question = (({ title, question_id, isLocked}) =>({title, question_id, isLocked: is_subscribed ? false : isLocked}))(question)
            }
            console.log("Document data:", docSnap.data());
            const user = req.user;

            let allAnswers = user?.answers ? user.answers : [];
            let answers = []
            if (allAnswers){
                allAnswers.forEach((ans)=>{
                    if (ans.question_id == req.params.id){
                        let submit_at = new Date(ans.submit_at?.seconds * 1000)
                        ans.submit_at = submit_at
                        answers.push(ans)
                    }
                })
                let ANS = answers.length ? answers.reduce((a, b) => {
                    return new Date(a.submit_at) > new Date(b.submit_at) ? a : b; 
                }): {};
                question["answer"] = ANS
            }
            
            return res.json({status: 200, message: "Retrieved document",data :{question: question}})
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
        let is_subscribed = new Date(req?.user?.subscription_validity.seconds * 1000) > new Date() && req.user.package_id == 'premium'
        querySnapshot.forEach((doc) => {
            questions.push({title: doc.data().title, isLocked: is_subscribed ? false : doc.data().isLocked, is_attempted: req?.user?.attemptedQuestions.includes(doc.id), question_id: doc.id})
        });
        questions.sort()
        return res.json({status: 200, message: "Retrieved all documents",data: {questions: questions, is_subscribed: is_subscribed }})
    }
    catch(e)
    {
        console.log(e);
        return res.json({status: 400, message:e.message})
    }
};

exports.submitAnswer = async (req, res) => {
    try{
    const {question_id, answer, isLocked} = req.body

    let user = req.user;

    if (!question_id || !answer ) {
        return res.json({status: 400, message: "Invalid question_id or answer."});
    }
    // Write request here;
    let percentage;
    await axios
    .post('http://1a1f-35-237-192-94.ngrok.io/predict', {
        ques_id: (question_id-1),
        text: answer
    })
    .then(res => {
        percentage = res.data.result
        console.log(`statusCode: ${res.status}`);
        console.log(res);
        
    })
    .catch(error => {
        console.error(error);
    });
    if (percentage) { 
        if (percentage < 45){
            percentage > 20 ? percentage -= 20 : percentage =1;

        }
        percentage = percentage.toFixed(2) }
    // let percentage = answer === "yes" ? 55 : 42;

    let ans = {
        question_id: question_id,
        answer: answer,
        score: percentage ? percentage : 0,
        submit_at : new Date()
    }

    user.answers ? user.answers.push(ans) : user["answers"] = [ans];

    const querySnapshot = await getDocs(collection(db, "Questions"));
    let questions=[]
    querySnapshot.forEach((doc) => {
        questions.push(doc.data().title)
    });
    let Questions_length = questions.length;

    user.attemptedQuestions.findIndex(q=>q==question_id)==-1?user.attemptedQuestions.push(question_id):''
    user.progress = parseFloat(((user.attemptedQuestions.length/Questions_length)).toFixed(2))

    let userRef = doc(db, 'Users', user.email.toLowerCase())
    updateDoc(userRef, user);
    await questionAttemptEvent(req.email, question_id)

    let is_subscribed = new Date(user.subscription_validity.seconds * 1000) > new Date() && req.user.package_id == 'premium';
    return res.json({status: 200, message: " Your question has been evaluated!", data: {percentage: percentage, is_subscribed: is_subscribed, isLocked: is_subscribed ? false : isLocked }})
}catch(e){console.log(e); return e.message}  
}