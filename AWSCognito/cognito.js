const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
const AWS = require('aws-sdk');
const request = require('request');
const jwkToPem = require('jwk-to-pem');
const jwt = require('jsonwebtoken');
require("dotenv").config()
const alert = require('alert')


const poolData = {    
    UserPoolId : process.env.AWS_COGNITO_USER_POOL_ID, // Your user pool id here    
    ClientId : process.env.AWS_COGNITO_CLIENT_ID// Your client id here
    }; 
    const pool_region = process.env.AWS_COGNITO_POOL_REGION;

    //initiating user pool and connecting
    const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);


    //Register user function
    function RegisterUser(name,gender,email,phone,password,password_confirm){
        var attributeList = [];
        attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"name",Value:name}));
        
        attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"gender",Value:gender}));
       
        attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"email",Value:email}));
        attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"phone_number",Value:phone}));
        let user;
    console.log('gets here')
        userPool.signUp(email, password, attributeList, null, function(err, result){
            if (err) {
                console.log('gets here pt 2')
                console.log(err);
                return;
            }
            console.log('gets here pt 3')
            console.log('Register was a success!')
            cognitoUser = result.user;
            user = result.user;
            console.log('user name is ' + cognitoUser.getUsername());
        });
        return user;
    }

    //verify email / user function

    function verifyMe(email, code,res){
        var userData = {
            Username: email,
            Pool: userPool,
        };
        
        var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
        cognitoUser.confirmRegistration(code, true, function(err, result) {
            if (err) {
                alert(err.message || JSON.stringify(err));
                res.redirect('/users/verify')
               
            }
            console.log('call result: ' + result);
            res.redirect('/users/login')
        });
    }


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
        //here
      
       
        
     cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function (result) {
                //console.log(result)
                console.log('access token + ' + result.getAccessToken().getJwtToken());
                console.log('id token + ' + result.getIdToken().getJwtToken());
                console.log('refresh token + ' + result.getRefreshToken().getToken());
                
      
           res.redirect('/users/dashboard')
               
            },
            onFailure: function(err) {
                console.log("ERROR:"+err);
                
                
                res.redirect('/users/login')
                
            },
    
        });
      
        
      
    }

    //user logout

    function signOut(email,res){
        var userData = {
            Username : email,
            Pool : userPool
        };
        
        var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
        cognitoUser.signOut();
        res.redirect('/users/login')

    }


    //user forget password

    


    //user change info

    



    module.exports = {RegisterUser, Login,verifyMe,signOut}