//Code by Lance

let user_email="";
let codeCounter =0;

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
const urlEncodedParser = bodyParser.urlencoded({ extended: false })
const url = require('url')


const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
const AWS = require('aws-sdk');
//passport stuff


//router.use(express.urlencoded({extended:false}))
router.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false, //Should we resave our session variables if nothing has changed
    saveUninitialized: false //Do you want to save an empty value in session if there is no value
}))
router.use(flash())




//routers allow us to nest itself inside a parent route like users
//so each router.get will automatically have /users/_______
router.get('/login', (req, res) => {

    res.render("login",{message: req.flash('message') })
})

router.post('/login', urlEncodedParser, (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    let password_confirm = req.body.password_confirm;


    AWS_Cognito.Login(email, password, res)


})

router.get('/register', (req, res) => {
    res.render("register", { message: req.flash('message') })
})

router.post('/register', urlEncodedParser, async (req, res) => {
    console.log(req.body)
    let name = req.body.name;
    let gender = req.body.gender;
    let email = req.body.email;
    user_email = req.body.email;
    let phone = req.body.phone;
    let password = req.body.password;
    let password_confirm = req.body.password_confirm;
    console.log(name, gender, email, phone, password, password_confirm)

    try {
        let value = await AWS_Cognito.RegisterUser(name, gender, email, phone, password)
        console.log(value)
        req.flash('message', value)
        res.redirect('/users/verify')
    } catch (error) {
        console.log(error)
        req.flash('message', error)
        res.redirect('/users/register')
    }

    //ANOTHER WAY TO DO IT USING OLD SYNTAX
    // AWS_Cognito.RegisterUser(name,gender,email,phone,password).then(
    //     function(value){
    //         console.log(value)
    //         req.flash('message',value)
    //         res.redirect('/users/verify')
    //     }).catch(
    //     function(error){
    //        console.log(error)
    //         req.flash('message',error)
    //         res.redirect('/users/register')
    //     }
    //     )



})

router.get('/verify', urlEncodedParser, (req, res) => {
    res.render('verify', {message: req.flash('message') })
})

router.post('/verify', urlEncodedParser, async(req, res) => {
    let code = req.body.verify_code;
    let resendStatus = req.body.resend_code
    if(resendStatus){
        
        try{
        let resendingCode = await AWS_Cognito.resendVerifyMe(user_email,res)
        console.log(resendingCode)
        req.flash('message', resendingCode)
        res.redirect('/users/verify')

        }catch(error){
            console.log(error)
           
            req.flash('message', error)
            res.redirect('/users/verify')
        }

    }else{

    try {
        let value = await AWS_Cognito.verifyMe(user_email, code);
        console.log(value)
        req.flash('message', value)
        res.redirect('/users/login')
        user_email = ""
    } catch (error) {
        codeCounter = codeCounter+1;
        console.log(error)
        console.log("Code attempts:"+codeCounter)

        if(codeCounter <5){

        req.flash('message', error)
        res.redirect('/users/verify')
        }else{

            try{
                let resendingCode = await AWS_Cognito.resendVerifyMe(user_email,res)
                console.log(resendingCode)
                codeCounter=0;
                req.flash('message', "You reached the maximum of 5 failed attempts per verificaiton code. "+resendingCode)
                res.redirect('/users/verify')
        
                }catch(error){
                    console.log(error)
                   
                    req.flash('message', error)
                    res.redirect('/users/verify')
                }

        }
    }
}

    
    
})


router.get('/dashboard', urlEncodedParser, (req, res) => {
    console.log("GET")
    console.log(req.query.email)
    res.render("dashboard")
})

router.post('/dashboard', urlEncodedParser, (req, res) => {
    console.log("POST")
    console.log(req.body.email)

    AWS_Cognito.signOut(req.body.email, res)
})

// router.post('/dashboard',urlEncodedParser, (req,res)=>{
//     console.log("POST")
//     console.log(res)
//     res.redirect(url.format({
//         pathname: '/users/logout',
//         query: {
//             "email":email
//         }
//     }))
//   })



router.get('/logout', urlEncodedParser, (req, res) => {
    // console.log(req)
    // AWS_Cognito.signOut()
    res.render('logout')
})

router.post('/logout', urlEncodedParser, (req, res) => {
    console.log(req.query.email)
    AWS_Cognito.signOut(req.query.email)
    // console.log(req)
    //    res.render('logout')
})

router.post('/logout', urlEncodedParser, (req, res) => {
    let email = req.body.email;
    console.log(email)
    AWS_Cognito.signOut(email, res)
})







//exporting the router for use in server.js
module.exports = router;