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
const url = require('url')


const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
const AWS = require('aws-sdk');
//passport stuff


//router.use(express.urlencoded({extended:false}))
router.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false, //Should we resave our session variables if nothing has changed
    saveUninitialized : false //Do you want to save an empty value in session if there is no value
}))
router.use(flash())




//routers allow us to nest itself inside a parent route like users
//so each router.get will automatically have /users/_______
router.get('/login',(req,res)=>{
    
    res.render("login")
})

router.post('/login',urlEncodedParser,(req,res)=>{
    let email = req.body.email;
    let password = req.body.password;
    let password_confirm = req.body.password_confirm;


  AWS_Cognito.Login(email,password,res)
 
     
})

router.get('/register', (req,res)=>{
    res.render("register", {message:req.flash('message')})
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

    //AWS_Cognito.RegisterUser(name,gender,email,phone,password,password_confirm,res,req)

    // console.log(message)
    // req.flash('message','error test')
    // res.redirect('/users/register')

    const poolData = {    
        UserPoolId : process.env.AWS_COGNITO_USER_POOL_ID, // Your user pool id here    
        ClientId : process.env.AWS_COGNITO_CLIENT_ID// Your client id here
        }; 
    
        //setting pool region
        const pool_region = process.env.AWS_COGNITO_POOL_REGION;
    
        //initiating user pool and connecting
        const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

        //initialize attributelist
        var attributeList = [];
        //here we push each new cognito user attribute into the attribute list with the format ___ : ____ where it is name: ___ value: ___
        attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"name",Value:name}));
        attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"gender",Value:gender}));
        attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"email",Value:email}));
        attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"phone_number",Value:phone}));

        //here we sign the user up into the pull and we pass in the email (username), password, and the attribute list initialized above
        userPool.signUp(email, password, attributeList, null, function(err, result){
            //if there is an error, we send the error message to the console and back to the page for the user to see
            if (err) {
                //console.log(err);
                console.log("ERROR MESSAGE:"+err.message)
                req.flash('message',err.message)
                res.redirect('/users/register')
            }else{

            //otherwise we indicate it was a success to the console and the page
            // and we set user and cognito user to be the result.user object
            console.log('Register was a success!')
            cognitoUser = result.user;
            user = result.user;
            console.log('User name is ' + cognitoUser.getUsername());
            req.flash('message',"Account created successfully! A verification code was sent to your email, please verify below.")
            res.redirect('/users/verify')
            }
        });
       
    

    
    
})

router.get('/verify',urlEncodedParser, (req,res)=>{
    res.render('verify',{message:req.flash('message')})
})

router.post('/verify',urlEncodedParser, (req,res)=>{
    let email = req.body.email;
    let code = req.body.verify_code;
    AWS_Cognito.verifyMe(email,code,res);
})


router.get('/dashboard',urlEncodedParser, (req,res)=>{
    console.log("GET")
  console.log(req.query.email)
    res.render("dashboard")
})

router.post('/dashboard',urlEncodedParser, (req,res)=>{
    console.log("POST")
  console.log(req.body.email)
  
  AWS_Cognito.signOut(req.body.email,res)
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



router.get('/logout',urlEncodedParser, (req,res)=>{
    // console.log(req)
    // AWS_Cognito.signOut()
   res.render('logout')
})

router.post('/logout',urlEncodedParser, (req,res)=>{
    console.log(req.query.email)
    AWS_Cognito.signOut(req.query.email)
    // console.log(req)
//    res.render('logout')
})

router.post('/logout',urlEncodedParser,(req,res)=>{
    let email = req.body.email;
    console.log(email)
    AWS_Cognito.signOut(email,res)
})







//exporting the router for use in server.js
module.exports = router;