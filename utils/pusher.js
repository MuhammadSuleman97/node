var Pusher = require('pusher');

const pusher = new Pusher({
    appId: "1468489",
            key: "a0729393e26007806945",
            secret: "08f5bd3ab6918e304f17",
            cluster: "ap2",
            useTLS: true
});
const paymentEvent = async (email, package) => {
    try{
        let EVENT = {
            email: email,
            event: package + '-' + email,
        };
        let a = await pusher.trigger(email,"payment", EVENT);
        return;
    }catch(e){
        console.log("Error processing payment event: " + e.message);
        return e.message
    }
};
const questionAttemptEvent = async (email, question_id)  => {
    try{
        let EVENT = {
            email: email,
            event: "questionAttempted",
            question_id : email + '-' + question_id
        };

        let b = await pusher.trigger(email,"questionAttempted", EVENT);
        return;
    }catch(e){ 
        console.log("Error processing questionAttempted event: " + e.message); 
        return
    }
}

module.exports = {
    paymentEvent,
    questionAttemptEvent,
}