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

    module.exports = {RegisterUser}