//Code by Lance
//requiring the aws cognito file
const AWS_Cognito = require('../../AWSCognito/cognito');

//This function verifies the email of the user. It takes the users email from the url and creates a hidden value
//to post to the verify route to pass the email value.

// ****I THINK THIS FUNCTION IS NO LONGER USED ****//
function verifyEmail(e) {
    console.log('hi')
    e.preventDefault() // stops submit form to get submitted in order to do the checks first

    const parameters = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop)
    })

    let email = parameters.email
    let user_data = document.createElement('input')
    user_data.setAttribute('name', "email")
    user_data.setAttribute('value', email)
    user_data.setAttribute('type', 'hidden')

    console.log(email)
    let form = document.getElementById('verify_email')
    form.appendChild(user_data)
    form.submit()
}

//This function resends the code to the users email. What is does is it creates a hidden value called resend_code and sets
//it to true and posts it to the verify route. This indicates the user has clicked the resend code button and it will run the resend code function
//to resend the code to the users email
function resendCode(e) {
    e.preventDefault() // stops submit form to get submitted in order to do the checks first


    //create a hidden attribute to post to the verify route called resend_code and set it to true
    let resendElement = document.createElement('input')
    resendElement.setAttribute('name', "resend_code")
    resendElement.setAttribute('value', true)
    resendElement.setAttribute('type', 'hidden')

    //create the form variable and submit the form
    let form = document.getElementById('resend_code')
    form.appendChild(resendElement)
    form.submit()

}