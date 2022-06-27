function forgotPassword(e) {
    e.preventDefault() // stops submit form to get submitted in order to do the checks first

    //create a hidden attribute to post to the dashboard called signout_status and set it to true
    let forgotPassword = document.createElement('input')
    forgotPassword.setAttribute('name', "forgot_password_status")
    forgotPassword.setAttribute('value', true)
    forgotPassword.setAttribute('type', 'hidden')

    //create the form variable and submit the form
    let form = document.getElementById('forgotPasswordCode')
    form.appendChild(forgotPassword)
    form.submit()

}