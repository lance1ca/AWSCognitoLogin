

function signOut(e) {
    e.preventDefault() // stops submit form to get submitted in order to do the checks first
    let signout = document.createElement('input')
    signout.setAttribute('name', "signout_status")
    signout.setAttribute('value', true)
    signout.setAttribute('type', 'hidden')

    let form = document.getElementById('logout')
    form.appendChild(signout)
    form.submit()

}