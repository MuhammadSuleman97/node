const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000;
const cors = require("cors");
const path = require('path');
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());  

// app.use(cors())
app.listen(PORT, ()=> {
    console.log('listening on port: ', PORT)
})

module.exports = app