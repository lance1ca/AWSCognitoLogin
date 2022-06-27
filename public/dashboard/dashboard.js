//Code by Lance
//This function takes an event and creates a hidden input to post to the dashboard route.
//It posts a boolean called signout that has a value of true, to indicate the user wants to sign out.
//Then when this value is posted, the route will call the sign out function to sign the user out based on the boolean
function signOut(e) {
    e.preventDefault() // stops submit form to get submitted in order to do the checks first

    //create a hidden attribute to post to the dashboard called signout_status and set it to true
    let signout = document.createElement('input')
    signout.setAttribute('name', "signout_status")
    signout.setAttribute('value', true)
    signout.setAttribute('type', 'hidden')

    //create the form variable and submit the form
    let form = document.getElementById('logout')
    form.appendChild(signout)
    form.submit()

}