const express = require('express');
const router = express.Router();
const business = require("../business")


// "/" path will render the home page.
router.get("/", (req, res) => {
    // also in the lecture18 code, they authenticate directly in the / page. 

    //What is the information we need to know for the login page of the user? 
    //1) Check if the cookie is present in the browser. if a cookie is present and is valid, then automatically log user in
    res.render("login")
});

router.post("/", (req,res) => {
    const {username , password} = req.body
    // need to perform checks on whether the user actually exists or not. and display
    //the relevant error messages. As of now. it only gets the username and password 

    // after validation, we need to create session and cookies
    res.send("Hello World")
})

router.get("/sign-up", (req,res) => {
    res.render("register")
})

router.post("/sign-up", (req,res) => {
    const {username, email, password, repeatedPassword} = req.body
    //username validation
    //email validation
    //password validation
    //checking both passwords are the same
    //ensure username doesn't already exist in the database
        // if(username in database) return true
        // else return false
    //ensure email doesn't already exist in the database
        // if(username in database) return true
        // else return false
    // need to check both, cuz the username could be unique, but the user can pass in a non-unique email address

    //if all of those validations are valid, i want to create a user in the database, specifically, UserAccounts Collection
    business.createUser(username,email,password)
    res.send("Hello World")
})

module.exports = router;