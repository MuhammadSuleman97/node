const {getFirestore, doc, setDoc, getDoc, getDocs, collection, updateDoc, getId} = require('firebase/firestore');
const db = getFirestore();
const { getAuth } = require('firebase/auth');
const auth = getAuth();

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
    const {question_id, answer, isLocked} = req.body

    let user = req.user;

    if (!question_id || !answer || !isLocked) {
        return res.json({status: 400, message: "Invalid question_id, answer or isLocked."});
    }
    // Write request here;
    let percentage = answer === "yes" ? 55 : 42;

    let ans = {
        question_id: question_id,
        answer: answer,
        score: percentage,
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

    let userRef = doc(db, 'Users', user.email)
    updateDoc(userRef, user)

    let is_subscribed = new Date(user.subscription_validity.seconds * 1000) > new Date() && req.user.package_id == 'premium';
    return res.json({status: 200, message: " Your question has been evaluated!", data: {percentage: percentage, is_subscribed: is_subscribed, isLocked: isLocked }})
}