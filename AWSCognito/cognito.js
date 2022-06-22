const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
const AWS = require('aws-sdk');
const request = require('request');
const jwkToPem = require('jwk-to-pem');
const jwt = require('jsonwebtoken');
require("dotenv").config()


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


    //Login function
    async function Login (email, password) {
        var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
            Username : email,
            Password : password,
        });
    
        var userData = {
            Username : email,
            Pool : userPool
        };
        console.log('LOGIN GETS HERE')
        var cognitoUser = await new AmazonCognitoIdentity.CognitoUser(userData);
        console.log('ERROR HAS NOT OCCURRED')
        //here
        let test2;
        let test = await cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: await function (result) {
                console.log('LOGIN GETS HEREEEEEEE')
                console.log('access token + ' + result.getAccessToken().getJwtToken());
                console.log('id token + ' + result.getIdToken().getJwtToken());
                console.log('refresh token + ' + result.getRefreshToken().getToken());
                console.log('LOGIN GETS HERE?!?!?!?')
                test2 = true;
                console.log(test2)
                return true;
            },
            onFailure: await function(err) {
                console.log(err);
                test2 = false;
                console.log(test2)
                return false;
            },
    
        });
        //why
        console.log("test variable:"+test)
        return test;
    }





    module.exports = {RegisterUser, Login}