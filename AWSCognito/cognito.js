const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
const AWS = require('aws-sdk');
const request = require('request');
const jwkToPem = require('jwk-to-pem');
const jwt = require('jsonwebtoken');
require("dotenv").config()
const alert = require('alert')
const url = require('url')
//------------------------------------------------------------------------------------------------------------------------------

//setting the pool data for aws user pool
const poolData = {    
    UserPoolId : process.env.AWS_COGNITO_USER_POOL_ID, // Your user pool id here    
    ClientId : process.env.AWS_COGNITO_CLIENT_ID// Your client id here
    }; 

    //setting pool region
    const pool_region = process.env.AWS_COGNITO_POOL_REGION;

    //initiating user pool and connecting
    const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

//------------------------------------------------------------------------------------------------------------------------------
    //Register user function, this function registers a user into the user pool.
    //This function takes in parameters for each input entered on the register page
    function RegisterUser(name,gender,email,phone,password){

        return new Promise((resolve, reject)=>{
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
                console.log('here first3')
                reject(err.message)
            }else{

            //otherwise we indicate it was a success to the console and the page
            // and we set user and cognito user to be the result.user object
            console.log('Register was a success!')
            cognitoUser = result.user;
            user = result.user;
            console.log('User name is ' + cognitoUser.getUsername());
            console.log('User object is:\n'+cognitoUser.toString())
            console.log('here first2')
            resolve("Account created successfully! A verification code was sent to your email, please verify below.");
            }
        });
        console.log('here first1')
        reject("WHY DO U GO HERE FIRST :((((((((((((((((((((((")
    })
    }


//------------------------------------------------------------------------------------------------------------------------------
    //resend verification code via email

    function resendVerifyMe(email,res){
        var userData = {
            Username: email,
            Pool: userPool,
        };
        
        var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);


        cognitoUser.resendConfirmationCode(function(err, result) {
            if (err) {
                console.log("resending code")
                console.log(err.message || JSON.stringify(err));
                //res.redirect('/users/verify')
                //resendVerifyMe(email,res)
            }else{
            console.log('call result2: ' + result);
            res.redirect('/users/login')
            }
        });

    }
//------------------------------------------------------------------------------------------------------------------------------
    //verify email / user function

    function verifyMe(email, code,res){
        res.redirect('/users/verify')
        var userData = {
            Username: email,
            Pool: userPool,
        };
        
        var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
        cognitoUser.confirmRegistration(code, true, function(err, result) {
            if (err) {
                console.log("INVALID CODE")
                console.log(err.message || JSON.stringify(err));
                //res.redirect('/users/verify')
                resendVerifyMe(email,res)
            }else{
            console.log('call result1: ' + result);
            res.redirect('/users/login')
            }
        });
    }



//------------------------------------------------------------------------------------------------------------------------------
    //Login function
   function Login (email, password,res) {
        var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
            Username : email,
            Password : password,
        });
    
        var userData = {
            Username : email,
            Pool : userPool
        };
        
        var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
      
       
        
     cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function (result) {
                //console.log(result)
                console.log('access token + ' + result.getAccessToken().getJwtToken());
                console.log('id token + ' + result.getIdToken().getJwtToken());
                console.log('refresh token + ' + result.getRefreshToken().getToken());
                
      
           res.redirect(url.format({
            pathname: '/users/dashboard',
            query: {
                "email":email
            }
        }))
               
            },
            onFailure: function(err) {
                console.log("ERROR:"+err);
                
                
                res.redirect('/users/login')
                
            },
    
        });
      
        
      
    }
//------------------------------------------------------------------------------------------------------------------------------
    //user logout

    function signOut(email,res){
        var userData = {
            Username : email,
            Pool : userPool
        };
        
        var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
        cognitoUser.signOut();
        console.log("signed out")
res.redirect('/users/logout')
        

    }

//------------------------------------------------------------------------------------------------------------------------------
    //user forget password

    

//------------------------------------------------------------------------------------------------------------------------------
    //user change info

    


//------------------------------------------------------------------------------------------------------------------------------
    module.exports = {RegisterUser, Login,verifyMe,signOut,resendVerifyMe}