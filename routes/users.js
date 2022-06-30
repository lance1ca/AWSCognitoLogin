//Code by Lance
//This program file handles all of the GET and POST routes related to the user such as: Register, Verify,
//Login, Dashboard, Logout, etc.

//Initializing user email for current email being used globally and code counter to track number of verification code attempts
let user_email = "";
let codeCounter = 0;

//Initializing the not in production variable to false
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
//------------------------------------------------------------------------------------------------------------------------------
//Importing all the required npm packages, not all are used yet.
//importing required npm packages and creating a new router
const express = require('express');
const router = express.Router();
const flash = require('connect-flash')
const expressFlash = require('express-flash')
const session = require('express-session')
const bodyParser = require('body-parser')
const zxcvbn = require('zxcvbn')

//requiring axios to do http requests and calls etc
const axios = require('axios');
const AWS_Cognito = require('../AWSCognito/cognito');
const urlEncodedParser = bodyParser.urlencoded({ extended: false })
const url = require('url')
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
const AWS = require('aws-sdk');

// ****REMOVE URL ENCODED PARSER??****//

//------------------------------------------------------------------------------------------------------------------------------
//Using a session for the router with the secret, resave, and save unitialized
router.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false, //Should we resave our session variables if nothing has changed
    saveUninitialized: false //Do you want to save an empty value in session if there is no value
}))

//Using flash for the router to pass messages to the web page.
router.use(flash())


//Routers allow us to nest itself inside a parent route like users
//so each router.get will automatically have /users/_______
//------------------------------------------------------------------------------------------------------------------------------
//LOGIN ROUTES BELOW:

//LOGIN GET ROUTE
router.get('/login', (req, res) => {
    //render the login ejs file with the req.flash content of message
    res.render("login", { message: req.flash('message') })
})

//LOGIN POST ROUTE
router.post('/login', urlEncodedParser, async (req, res) => {
    //Setting values to the values inputted into the login page
    //Taking in the email as the req.body.email and setting user email to that email
    let email = req.body.email;
    user_email = req.body.email;
    //Setting password to be the req.body.password 
    let password = req.body.password;

    //Here we try to login with the users entered details and we await the response of the login before proceeding.
    try {
        //If the authentication and login details are correct, we log the value returned (aka resolved promise), and we
        // flash this resolved value to message and we redirect the user to their dashboard.
        let value = await AWS_Cognito.Login(email, password)
        console.log(value)
        req.flash('message', value)
        res.redirect('/users/dashboard')
    } catch (error) {
        //Otherwise, we catch the error, flash the error to message, and redirect the user to the login page.
        console.log(error)
        req.flash('message', error)
        res.redirect('/users/login')
    }
})
//------------------------------------------------------------------------------------------------------------------------------
//REGISTER ROUTES BELOW:

//REGISTER GET ROUTE
router.get('/register', (req, res) => {
    //render the register ejs file with the req.flash content of message
    res.render("register", { message: req.flash('message') })
})

//REGISTER POST ROUTE
router.post('/register', urlEncodedParser, async (req, res) => {
    //Console logging the request body
    console.log(req.body)
    //Setting the variables to the different values sent in the request body
    let name = req.body.name;
    let gender = req.body.gender;
    let email = req.body.email;
    //Setting global user_email to the email for later use
    user_email = req.body.email;
    let phone = req.body.phone;
    let password = req.body.password;
    let password_confirm = req.body.password_confirm;
    //Console logging the values for any debugging purposes
    console.log(name, gender, email, phone, password, password_confirm)

    //Here we try to register the user with the above details into the AWS Cognito user pool
    try {
        //If the user is registered correctly, we log the value returned (aka resolved promise), and we
        // flash this resolved value to message and we redirect the user to the verify page.
        let value = await AWS_Cognito.RegisterUser(name, gender, email, phone, password)
        console.log(value)
        req.flash('message', value)
        res.redirect('/users/verify')
    } catch (error) {
        //Otherwise, we catch the error, flash the error to message, and redirect the user to the register page.
        console.log(error)
        req.flash('message', error)
        res.redirect('/users/register')
    }

    //ANOTHER WAY TO DO IT USING OLDER SYNTAX
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
//------------------------------------------------------------------------------------------------------------------------------
//VERIFY ROUTES BELOW:

//VERIFY GET ROUTE
router.get('/verify', urlEncodedParser, (req, res) => {
    //render the verify ejs file with the req.flash content of message
    res.render('verify', { message: req.flash('message') })
})

//VERIFY POST ROUTE
router.post('/verify', urlEncodedParser, async (req, res) => {
    //Initializng the verification code sent and the boolean of if the user clicked the resend verification code button
    let code = req.body.verify_code;
    let resendStatus = req.body.resend_code

    //if the user clicked the resend verification code button, we resend the code, and reload the verify page
    if (resendStatus) {

        //Here we try to resend the code and we log the value returned (aka resolved promise), and we
        // flash this resolved value to message and we redirect the user to the verify page.
        try {
            let resendingCode = await AWS_Cognito.resendVerifyMe(user_email, res)
            console.log(resendingCode)
            req.flash('message', resendingCode)
            res.redirect('/users/verify')

        } catch (error) {
            //Otherwise, we catch the error, flash the error to message, and redirect the user to the register page.
            console.log(error)
            req.flash('message', error)
            res.redirect('/users/verify')
        }

        //otherwise, we check the entered verification code with the verification code entered by the user
    } else {

        try {
            //Here we try to verify the user and check the code sent with the code entered and we log the value returned (aka resolved promise), and we
            // flash this resolved value to message and we redirect the user to the verify page.
            let value = await AWS_Cognito.verifyMe(user_email, code);
            console.log(value)
            req.flash('message', value)
            res.redirect('/users/login')
            //reset the user email to an empty string after this process is completed
            user_email = ""
        } catch (error) {
            //Otherwise, we catch the error, flash the error to message, and redirect the user to the verify page.
            //Incrementing the wrong attempts per verification code
            codeCounter = codeCounter + 1;
            //log the error and attempts
            console.log(error)
            console.log("Code attempts:" + codeCounter)

            //if the code counter is less than 5, allow another attempt and flash the error message and redirect to verify
            if (codeCounter < 5) {

                req.flash('message', error)
                res.redirect('/users/verify')

                //otherwise, if there are more than 5 wrong attempts, we resend the verification code
            } else {
                //Here we try to resend the code and we log the value returned (aka resolved promise), and we
                // flash this resolved value to message and we redirect the user to the verify page.
                try {
                    let resendingCode = await AWS_Cognito.resendVerifyMe(user_email, res)
                    console.log(resendingCode)
                    //resetting the number of attempts
                    codeCounter = 0;
                    req.flash('message', "You reached the maximum of 5 failed attempts per verificaiton code. " + resendingCode)
                    res.redirect('/users/verify')

                } catch (error) {
                    //Otherwise, we catch the error, flash the error to message, and redirect the user to the register page.
                    console.log(error)
                    req.flash('message', error)
                    res.redirect('/users/verify')
                }

            }
        }
    }



})
//------------------------------------------------------------------------------------------------------------------------------
//DASHBOARD ROUTES BELOW:

//DASHBOARD GET ROUTE
router.get('/dashboard', urlEncodedParser, (req, res) => {
    //render the dashboard ejs file with the req.flash content of message
    res.render("dashboard", { message: req.flash('message') })
})

//DASHBOARD POST ROUTE
router.post('/dashboard', urlEncodedParser, async (req, res) => {

    //setting the signout status to be the boolean returned/posted (is true only if the user clicked the sign out button)
    let signOutStatus = req.body.signout_status
    //log the values
    console.log(signOutStatus)
    console.log(user_email)

    //if the user clicked sign out, then log the user out.
    if (signOutStatus) {
        //Here we try to sign the user out and we log the value returned (aka resolved promise), and we
        // flash this resolved value to message and we redirect the user to the login page.
        try {
            let value = await AWS_Cognito.signOut(user_email)
            console.log(value)
            //set user email to empty string
            user_email = ""
            console.log('user email set to:' + user_email)
            req.flash('message', value)
            res.redirect('/users/login')
        } catch (error) {
            //Otherwise, we catch the error, flash the error to message, and redirect the user to the dashboard page.
            console.log(error)
            req.flash('message', error)
            res.redirect('/users/dashboard')
        }
    }


})


//------------------------------------------------------------------------------------------------------------------------------
//CHANGE PASSWORD ROUTES BELOW:

//CHANGE PASSWORD GET ROUTE
router.get('/changePassword', (req, res) => {
    //render the register ejs file with the req.flash content of message
    res.render("changePassword", { message: req.flash('message') })
})

//CHANGE PASSWORD POST ROUTE
router.post('/changePassword', urlEncodedParser, async (req, res) => {
    //Console logging the request body
    console.log(req.body)
    //Setting the variables to the different values sent in the request body
  console.log("user email check:"+user_email)
    let old_password = req.body.oldPassword
    let new_password = req.body.newPassword
    let confirm_new_password = req.body.confirmNewPassword
    //Here we try to register the user with the above details into the AWS Cognito user pool
    try {
        //If the user is registered correctly, we log the value returned (aka resolved promise), and we
        // flash this resolved value to message and we redirect the user to the verify page.
        let value = await AWS_Cognito.changePassword(user_email, old_password,new_password)
        console.log(value)
        req.flash('message', value)
        res.redirect('/users/dashboard')
    } catch (error) {
        //Otherwise, we catch the error, flash the error to message, and redirect the user to the register page.
        console.log(error)
        req.flash('message', error)
        res.redirect('/users/changePassword')
    }

})
//------------------------------------------------------------------------------------------------------------------------------
//FORGOT PASSWORD ROUTES BELOW:

router.get('/forgotPassword', (req, res) => {
    //render the register ejs file with the req.flash content of message
    res.render("forgotPassword", { message: req.flash('message') })
})


//FORGOT PASSWORD POST ROUTE
router.post('/forgotPassword', urlEncodedParser, async (req, res) => {
    
    let resetPasswordStatus = req.body.forgot_password_status
    let email = req.body.email
    user_email = req.body.email
console.log(resetPasswordStatus+" "+email+" "+user_email)
    if(resetPasswordStatus){

        try {
            //If the user is registered correctly, we log the value returned (aka resolved promise), and we
            // flash this resolved value to message and we redirect the user to the verify page.
            let value = await AWS_Cognito.forgetPassword(user_email)
            console.log(value)
            req.flash('message', value)
            res.redirect('/users/resetPassword')
        } catch (error) {
            //Otherwise, we catch the error, flash the error to message, and redirect the user to the change password page.
            console.log(error)
            req.flash('message', error)
            res.redirect('/users/changePassword')
        }

    }else{
        req.flash('message', "Please enter your email and request a reset password code.")
        res.redirect('/users/forgotPassword')
    }

  

})


//------------------------------------------------------------------------------------------------------------------------------
//RESET PASSWORD ROUTES BELOW:

router.get('/resetPassword', (req, res) => {
    //render the register ejs file with the req.flash content of message
    res.render("resetPassword", { message: req.flash('message') })
})




//RESET PASSWORD POST ROUTE
router.post('/resetPassword', urlEncodedParser, async (req, res) => {
    
    let code = req.body.password_code
    let newPassword = req.body.newPassword
console.log('email is still: '+user_email)
    try {
        //If the user is registered correctly, we log the value returned (aka resolved promise), and we
        // flash this resolved value to message and we redirect the user to the login page.
        let value = await AWS_Cognito.resetPassword(user_email, code, newPassword)
        console.log(value)
        req.flash('message', value)
        res.redirect('/users/login')
    } catch (error) {
        //Otherwise, we catch the error, flash the error to message, and redirect the user to the register page.
        console.log(error)
        req.flash('message', error)
        res.redirect('/users/resetPassword')
    }

})



//------------------------------------------------------------------------------------------------------------------------------
//LOGOUT ROUTES BELOW:

//LOGOUT GET ROUTE
//Currently not being used
router.get('/logout', urlEncodedParser, (req, res) => {
    res.render('logout')
})

//------------------------------------------------------------------------------------------------------------------------------
//exporting the router for use in server.js
module.exports = router;