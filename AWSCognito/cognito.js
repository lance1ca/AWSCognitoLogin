//Code by Lance

//requiring packages used for the AWS Cognito integration
//NOTE: Not all are used yet, but are still imported
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

//Setting the pool data for AWS user pool using environment variables
const poolData = {
    UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID, // Your user pool id here    
    ClientId: process.env.AWS_COGNITO_CLIENT_ID// Your client id here
};

//Setting pool region for AWS Cognito using environment variables
const pool_region = process.env.AWS_COGNITO_POOL_REGION;

//Initiating user pool and connecting to it using the pool data
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

//------------------------------------------------------------------------------------------------------------------------------
//REGISTER USER FUNCTION
//Register user function, this function registers a user into the user pool on AWS Cogntio.
//This function takes in parameters for each input entered on the register page (except for confirm password as this is automatically checked)
//Note: If a user enters an incorrect confirm password, or incorrect email or other input, AWS Cognito catches this and will wait until all inputs are filled and correct.
//AWS Cognito also encrypts the passwords entered.
async function RegisterUser(name, gender, email, phone, password) {


    //initialize attributelist
    var attributeList = [];
    //here we push each new cognito user attribute into the attribute list with the format ___ : ____ where it is name: ___ value: ___
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "name", Value: name }));
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "gender", Value: gender }));
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "email", Value: email }));
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "phone_number", Value: phone }));

    //Here we return a new Promise with a resolve or reject statement and corresponding value.
    //By returning a new promise, when this function is called it waits until the Promise / function has completed before proceeding and using its value.
    //This prevents the function from returning undefined or an incorrect value before the function is actually finished when called.
    return new Promise((resolve, reject) => {
        //here we sign the user up into the pool and we pass in the email (username), password, and the attribute list initialized above
        userPool.signUp(email, password, attributeList, null, function (err, result) {
            //if there is an error, we send the error message to the console and reject the promise with the error message
            if (err) {
                console.log("ERROR MESSAGE:" + err.message)
                reject(err.message)
            } else {

                //otherwise we indicate it was a success to the console and resolve the promise with the success message.
                // We also set cognito user to be the result.user object
                console.log('Register was a success!')
                cognitoUser = result.user;
                console.log('User name is ' + cognitoUser.getUsername());
                resolve("Account created successfully! A verification code was sent to your email, please verify below.");
            }
        });
    });

}


//------------------------------------------------------------------------------------------------------------------------------
//RESEND VERIFICATION CODE FUNCTION
//This is the resend verification code via email fuinction.
//It resends the code to the users email when the user clicks the resend verification code button on the web page.
//It takes the parameters of email and res.
function resendVerifyMe(email, res) {

    //Initializing the user data with a specific email and userPool (specific user)
    var userData = {
        Username: email,
        Pool: userPool,
    };

    //Connecting to the user pool for a specific user
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    //Here we return a new Promise with a resolve or reject statement and corresponding value.
    //By returning a new promise, when this function is called it waits until the Promise / function has completed before proceeding and using its value.
    //This prevents the function from returning undefined or an incorrect value before the function is actually finished when called.
    return new Promise((resolve, reject) => {
        //resending the confirmation code to the cognito user
        cognitoUser.resendConfirmationCode(function (err, result) {

            //if there is an error, log the error and reject the promise with the error message
            if (err) {
                console.log("There was an error resending the code:\n");
                reject(err.message)
            } else {
                //otherwise, resolve the promise with the success message
                resolve("Resent verification code, try again.");
            }
        });
    });

}
//------------------------------------------------------------------------------------------------------------------------------
//VERIFY EMAIL FUNCTION
//This is the verify email function.
//It sends the verification code to the users email automatically when the user registers for an account on the web page.
//It takes the parameters of email and code.
//Note: After around 5 wrong attempts for the verification code, AWS locks you out from trying for a little while based on their timing standards.
//In addition, I have set up a custom counter to have a maximum of 5 attempts per verification code before it resends a new code.
async function verifyMe(email, code) {

    //Initializing the user data with a specific email and userPool (specific user)
    var userData = {
        Username: email,
        Pool: userPool,
    };

    //Connecting to the user pool for a specific user
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);


    //Here we return a new Promise with a resolve or reject statement and corresponding value.
    //By returning a new promise, when this function is called it waits until the Promise / function has completed before proceeding and using its value.
    //This prevents the function from returning undefined or an incorrect value before the function is actually finished when called.
    return new Promise((resolve, reject) => {

        //Confirming the registration for a specific user by checking the verification code called "code"
        cognitoUser.confirmRegistration(code, true, function (err, result) {
            //if there is an error, log the error and reject the promise with the error message
            if (err) {
                console.log("INVALID CODE")
                reject(err.message)

            } else {
                //otherwise, resolve the promise with the success message
                resolve("Verification process complete, you may now log in.");
            }
        });

    });
}



//------------------------------------------------------------------------------------------------------------------------------
//LOGIN FUNCTION
//This is the login function.
//This function logs the user into their account given they provide a correct email address that is registered in the user pool, and 
//the correct password for that corresponding email. AWS Cognito has an automatic limit to the number of password attempts (around 5),
//and I am going to implement a custom number of attempts as well before locking the user out for a period of time etc.
//Note: AWS Cogntio provides an automatic authentication check when logging into the users account.
//This function takes the email and password (encrypted) parameters
function Login(email, password) {

    //Initializing authentication details with the email and password passed in
    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
        Username: email,
        Password: password,
    });

    //Initializing the user data with a specific email and userPool (specific user)
    var userData = {
        Username: email,
        Pool: userPool
    };

    //Connecting to the user pool for a specific user
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);


    //Here we return a new Promise with a resolve or reject statement and corresponding value.
    //By returning a new promise, when this function is called it waits until the Promise / function has completed before proceeding and using its value.
    //This prevents the function from returning undefined or an incorrect value before the function is actually finished when called.
    return new Promise((resolve, reject) => {
        //Authenticating the user trying to log in with the authentication details
        cognitoUser.authenticateUser(authenticationDetails, {
            //If there is a success and the user is authenticated and entered in the correct email and password,
            //then we print out the 3 different access tokens, and resolve the promise with the success message.
            onSuccess: function (result) {
                //console.log(result)
                console.log('access token + ' + result.getAccessToken().getJwtToken());
                console.log('id token + ' + result.getIdToken().getJwtToken());
                console.log('refresh token + ' + result.getRefreshToken().getToken());
                resolve("Successfully logged in")

            },
            //if there is an error, log the error and reject the promise with the error message
            onFailure: function (err) {
                console.log("ERROR:" + err);
                reject(err.message)
            },

        });

    });

}
//------------------------------------------------------------------------------------------------------------------------------
//LOGOUT FUNCTION
//This is the logout function, it ends the users session and logs them out of their account / dashboard so they need to sign in again
//afterwards. It redirects them to the login page.
//Note: AWS Cogntio automatically handles the sign out.
//Signout takes an email parameter.

function signOut(email) {

    //Initializing the user data with a specific email and userPool (specific user)
    var userData = {
        Username: email,
        Pool: userPool
    };
    //Connecting to the user pool for a specific user
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    //Here we return a new Promise with a resolve or reject statement and corresponding value.
    //By returning a new promise, when this function is called it waits until the Promise / function has completed before proceeding and using its value.
    //This prevents the function from returning undefined or an incorrect value before the function is actually finished when called.
    return new Promise((resolve, reject) => {

        // ***********INSERT TRY CATCH HERE*********************//

        //Here we sign out the user and resolve the promise with a success message.
        cognitoUser.signOut();
        resolve("Successfully Signed out.")

    });


}


//------------------------------------------------------------------------------------------------------------------------------
//user change password

function changePassword(email,password,newPassword){
    //Initializing authentication details with the email and password passed in
    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
        Username: email,
        Password: password,
    });

    //Initializing the user data with a specific email and userPool (specific user)
    var userData = {
        Username: email,
        Pool: userPool
    };

    //Connecting to the user pool for a specific user
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);


    //Here we return a new Promise with a resolve or reject statement and corresponding value.
    //By returning a new promise, when this function is called it waits until the Promise / function has completed before proceeding and using its value.
    //This prevents the function from returning undefined or an incorrect value before the function is actually finished when called.
    return new Promise((resolve, reject) => {

        cognitoUser.authenticateUser(authenticationDetails, {
            //If there is a success and the user is authenticated and entered in the correct email and password,
            //then we print out the 3 different access tokens, and resolve the promise with the success message.
            onSuccess: function (result) {
                //console.log(result)
                cognitoUser.changePassword(password, newPassword, function(err, result) {
            
                    if (err) {
                        console.log(err.message)
                        reject("ERROR with password change")
                    }else{
                        resolve("PASSWORD CHANGED")
                    }
                   
                });

            },
            //if there is an error, log the error and reject the promise with the error message
            onFailure: function (err) {
                console.log("ERROR Authenticating:" + err);
                reject(err.message)
            },

        });



     

    });

}


//------------------------------------------------------------------------------------------------------------------------------
//user forget password

function forgetPassword(email){

//Initializing the user data with a specific email and userPool (specific user)
var userData = {
    Username: email,
    Pool: userPool
};

//Connecting to the user pool for a specific user
var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

return new Promise((resolve, reject) => {
    cognitoUser.forgotPassword({
        onSuccess: function(data) {
            // successfully initiated reset password request
            console.log('CodeDeliveryData from forgotPassword: ' + data);
            console.log("code sent to email??")
            resolve("Reset password code was sent to your email.")
        },
        onFailure: function(err) {
            reject(err.message)
        }
       
    });
});
}



//------------------------------------------------------------------------------------------------------------------------------
//user change info
//TODO

//------------------------------------------------------------------------------------------------------------------------------
//Facebook sign in
//TODO


//------------------------------------------------------------------------------------------------------------------------------
//Google sign in
//TODO



//------------------------------------------------------------------------------------------------------------------------------
module.exports = { RegisterUser, Login, verifyMe, signOut, resendVerifyMe,changePassword,forgetPassword }