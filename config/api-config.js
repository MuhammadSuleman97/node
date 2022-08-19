const express = require('express')
const app = express()
port = 3000;
const cors = require("cors");
const path = require('path');
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());  

app.use(cors())
app.listen(port, ()=> {
    console.log('listening on port: ', port)
})

module.exports = app