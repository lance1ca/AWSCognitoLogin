// require('cross-fetch/polyfill');
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');



var poolData = {
	UserPoolId: 'ca-central-1_QGQSOjDu6', // Your user pool id here
	ClientId: '5eh5avvo5vq491oms0tj75mea6', // Your client id here
};
var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

var attributeList = [];

var dataEmail = {
	Name: 'email',
	Value: 'email@mydomain.com',
};

var dataPhoneNumber = {
	Name: 'phone_number',
	Value: '+15555555555',
};
var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);
var attributePhoneNumber = new AmazonCognitoIdentity.CognitoUserAttribute(
	dataPhoneNumber
);

attributeList.push(attributeEmail);
attributeList.push(attributePhoneNumber);

userPool.signUp('username', 'password', attributeList, null, function(
	err,
	result
) {
	if (err) {
		//alert(err.message || JSON.stringify(err));
		return;
	}
	var cognitoUser = result.user;
	console.log('user name is ' + cognitoUser.getUsername());
});





// //Use case 2. Confirming a registered, unauthenticated user using a confirmation code received via SMS.

// var poolData = {
// 	UserPoolId: '...', // Your user pool id here
// 	ClientId: '...', // Your client id here
// };

// var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
// var userData = {
// 	Username: 'username',
// 	Pool: userPool,
// };

// var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
// cognitoUser.confirmRegistration('123456', true, function(err, result) {
// 	if (err) {
// 		alert(err.message || JSON.stringify(err));
// 		return;
// 	}
// 	console.log('call result: ' + result);
// });




// //Use case 3. Resending a confirmation code via SMS for confirming registration for a unauthenticated user.

// cognitoUser.resendConfirmationCode(function(err, result) {
// 	if (err) {
// 		alert(err.message || JSON.stringify(err));
// 		return;
// 	}
// 	console.log('call result: ' + result);
// });

////Use case 4. Authenticating a user and establishing a user session with the Amazon Cognito Identity service.
// import * as AWS from 'aws-sdk/global';

// var authenticationData = {
// 	Username: 'username',
// 	Password: 'password',
// };
// var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(
// 	authenticationData
// );
// var poolData = {
// 	UserPoolId: '...', // Your user pool id here
// 	ClientId: '...', // Your client id here
// };
// var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
// var userData = {
// 	Username: 'username',
// 	Pool: userPool,
// };
// var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
// cognitoUser.authenticateUser(authenticationDetails, {
// 	onSuccess: function(result) {
// 		var accessToken = result.getAccessToken().getJwtToken();

// 		//POTENTIAL: Region needs to be set if not already set previously elsewhere.
// 		AWS.config.region = '<region>';

// 		AWS.config.credentials = new AWS.CognitoIdentityCredentials({
// 			IdentityPoolId: '...', // your identity pool id here
// 			Logins: {
// 				// Change the key below according to the specific region your user pool is in.
// 				'cognito-idp.<region>.amazonaws.com/<YOUR_USER_POOL_ID>': result
// 					.getIdToken()
// 					.getJwtToken(),
// 			},
// 		});

// 		//refreshes credentials using AWS.CognitoIdentity.getCredentialsForIdentity()
// 		AWS.config.credentials.refresh(error => {
// 			if (error) {
// 				console.error(error);
// 			} else {
// 				// Instantiate aws sdk service objects now that the credentials have been updated.
// 				// example: var s3 = new AWS.S3();
// 				console.log('Successfully logged!');
// 			}
// 		});
// 	},

// 	onFailure: function(err) {
// 		alert(err.message || JSON.stringify(err));
// 	},
// });