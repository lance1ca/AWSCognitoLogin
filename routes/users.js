//Code by Lance


//initialize variable first
let notInProduction = false

//if the node env is NOT in production, then we set notInProduction to true,
//which allows for console logging of different info for testing and development purposes
//Otherwise, it is false since it is in production, and no unsecure or sensitive info is logged.
if (process.env.NODE_ENV !== "production") {

   notInProduction = true
   //This allows us to access the env file
   //was not working with heroku, getting errors, going to fix later
    require('dotenv').config()

}

//importing required npm packages and creating a new router
const express = require('express');
const router = express.Router();


const flash = require('connect-flash')
const expressFlash = require('express-flash')
const session = require('express-session')

const zxcvbn = require('zxcvbn')

//requiring axios to do http requests and calls
const axios = require('axios');


//passport stuff


router.use(express.urlencoded({extended:false}))





//routers allow us to nest itself inside a parent route like users
//so each router.get will automatically have /users/_______
router.get('/login', (req,res)=>{
    
    res.render("login")
})

router.get('/register', (req,res)=>{
    res.render("register")
})

router.get('/dashboard', (req,res)=>{
  
    res.render("dashboard")
})

router.get('/logout', (req,res)=>{
   res.render('logout')
})







//exporting the router for use in server.js
module.exports = router;