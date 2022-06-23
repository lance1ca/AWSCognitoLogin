

function signOut(e){
    console.log('hi')
    e.preventDefault() // stops submit form to get submitted in order to do the checks first

   const parameters = new Proxy(new URLSearchParams(window.location.search),{
       get: (searchParams, prop) => searchParams.get(prop)
   })

   let email = parameters.email
   let user_data = document.createElement('input')
   user_data.setAttribute('name',"email")
   user_data.setAttribute('value',email)
   user_data.setAttribute('type', 'hidden')

   console.log('dashboard email')
   console.log(email)
   let form = document.getElementById('logout')
   form.appendChild(user_data)
   form.submit()
}