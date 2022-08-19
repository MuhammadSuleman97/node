const {getFirestore, doc, setDoc, getDoc, getDocs, collection, updateDoc} = require('firebase/firestore');
const db = getFirestore();

exports.getUserData = async (req, res, next) => {
    try{
        return res.json({status:201, message: "User Received", data: {user: req.user}})
    }
    catch(e)
    {
      console.log(e);
      return res.json({status: 400, message:e.message})
    }
}

exports.updateUserProgress = async (req, res, next) => {
    try{
        const querySnapshot = await getDocs(collection(db, "Questions"));
        let questions=[]
        querySnapshot.forEach((doc) => {
            questions.push(doc.data().title)
        });
        let Questions_length = questions.length;
        let question_id = req.body.question_id;
        
        let user = req.user
        user.attemptedQuestions.findIndex(q=>q==question_id)==-1?user.attemptedQuestions.push(question_id):''
        user.progress = ((user.attemptedQuestions.length/Questions_length)*100).toFixed(2)+'%'
        const docRef = doc(db, "Users",req.email);
        await updateDoc(docRef, user)
        return res.json({status: 200, message: "Updated user",data: {user}})
  
    }
    catch(e)
    {
        console.log(e);
        return res.json({status: 400, message:e.message})
    }
}