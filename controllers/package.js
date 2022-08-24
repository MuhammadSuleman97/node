const {getFirestore, doc, setDoc, getDoc, getDocs, collection, updateDoc} = require('firebase/firestore');
const db = getFirestore();
const {getAuth } = require('firebase/auth');
const auth = getAuth();


exports.getAllPackages = async (req, res, next) => {
    let docRef = collection(db, "Package");
    let packages = await getDocs(docRef);
    let questions = []
    packages.forEach((doc) => {
        questions.push({title: doc.data().title, id: doc.data().id, description: doc.data().description, price: doc.data().price})
    // console.log(`${doc.id} => ${doc.data()}`);
    });
    questions.sort()
    return res.json({
        questions
    })
}