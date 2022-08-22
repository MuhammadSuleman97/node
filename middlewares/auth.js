const jwt = require('jsonwebtoken');
const {getFirestore, doc, setDoc, getDoc, getDocs, collection, updateDoc} = require('firebase/firestore');
const db = getFirestore();
// token authentication middleware:
module.exports = authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.sendStatus(401)
    }

    jwt.verify(token, "ABCDEFG", async (err, payload) => {
        if (err) {
            return res.sendStatus(403);
        }
        req.email = payload.id;
        let docRef = doc(db,"Users",req.email);
        let docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
            req.user = docSnap.data()
          } else {
            console.log("No such user's document!");
            return res.json({status: 404, message: "No User Found!"})
          }
        next();
    });
}
