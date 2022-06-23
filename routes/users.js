//Code by Lance


//initialize variable first
let notInProduction = false

//if the node env is NOT in production, then we set notInProduction to true,
//which allows for console logging of different info for testing and development purposes
//Otherwise, it is false since it is in production, and no unsecure or sensitive info is logged.
if (process.env.NODE_ENV !== "production") {

   notInProduction = true
   //This allows us to access the env file
   //was not working with heroku, getting errors, going to fix later
    require('dotenv').config()

}

//importing required npm packages and creating a new router
const express = require('express');
const router = express.Router();


const flash = require('connect-flash')
const expressFlash = require('express-flash')
const session = require('express-session')
const bodyParser = require('body-parser')
const zxcvbn = require('zxcvbn')

//requiring axios to do http requests and calls
const axios = require('axios');
const AWS_Cognito = require('../AWSCognito/cognito');
const urlEncodedParser = bodyParser.urlencoded({extended: false})

//passport stuff


//router.use(express.urlencoded({extended:false}))





//routers allow us to nest itself inside a parent route like users
//so each router.get will automatically have /users/_______
router.get('/login',(req,res)=>{
    
    res.render("login")
})

router.post('/login',urlEncodedParser,async(req,res)=>{
    let email = req.body.email;
    let password = req.body.password;
    let password_confirm = req.body.password_confirm;

//    let validateUser = AWS_Cognito.Login(email, password)
//   console.log("USER FILE:"+validateUser) 
  await AWS_Cognito.Login(email,password).then(
    function(value){
        console.log(value)
    }
  )
//    if(validateUser){
//         res.redirect('/users/dashboard')
//    }else{
//     res.redirect('/users/login')
//    }
     
})

router.get('/register', (req,res)=>{
    res.render("register")
})

router.post('/register',urlEncodedParser, async (req,res)=>{
    console.log(req.body)
    let name = req.body.name;
    let gender = req.body.gender;
    let email = req.body.email;
    let phone = req.body.phone;
    let password = req.body.password;
    let password_confirm = req.body.password_confirm;
    console.log(name,gender,email,phone,password,password_confirm)

    const registered_user = await AWS_Cognito.RegisterUser(name,gender,email,phone,password,password_confirm)
    console.log(registered_user)
    res.redirect('/users/verify')
})

router.get('/verify',urlEncodedParser, (req,res)=>{
    res.render('verify')
})

router.post('/verify',urlEncodedParser, (req,res)=>{
    let email = req.body.email;
    let code = req.body.verify_code;
    console.log(email+code)
    AWS_Cognito.verifyMe(email,code);
})


router.get('/dashboard', (req,res)=>{
  
    res.render("dashboard")
})

router.get('/logout', (req,res)=>{
   res.render('logout')
})







//exporting the router for use in server.js
module.exports = router;