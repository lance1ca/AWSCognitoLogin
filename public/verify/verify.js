

function verifyEmail(event){
    console.log('hi')
    event.preventDefault() // stops submit form to get submitted in order to do the checks first

    const parameters = new Proxy(new URLSearchParams(window.location.search),{
        get: (searchParams, prop) => searchParams.get(prop)
    })

    let email = params.email
    console.log(email)
    document.getElementById('verify').submit()
}