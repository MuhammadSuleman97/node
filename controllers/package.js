const {getFirestore, doc, setDoc, getDoc, getDocs, collection, updateDoc} = require('firebase/firestore');
const db = getFirestore();
const {getAuth } = require('firebase/auth');
const auth = getAuth();


exports.getAllPackages = async (req, res, next) => {
    try{
    let docRef = collection(db, "Package");
    let packages = await getDocs(docRef);
    let package = []
    packages.forEach((doc) => {
        package.push({title: doc.data().title, id: doc.data().id, description: doc.data().description, price: doc.data().price})
    // console.log(`${doc.id} => ${doc.data()}`);
    });
    package.sort()
    return res.json({
        status: 200,
        data: {
            Packages: package
        }
    })}
    catch(err){console.log(err); return res.message}
}