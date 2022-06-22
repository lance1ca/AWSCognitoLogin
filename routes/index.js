//importing express and creating a new router
const express = require('express');
const router = express.Router();



router.get('/', (req,res)=>{
   //index.ejs
   res.render('index')
})




//exporting the router for use in server.js
module.exports = router;