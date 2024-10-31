const express = require('express');
const router = express.Router();
const business = require("../business")


// "/" path will render the home page.
router.get("/", (req, res) => {
    res.render("login")
});

router.post("/", (req,res) => {
    const {username , password} = req.body
    // need to perform checks on whether the user actually exists or not. and display
    //the relevant error messages. As of now. it only gets the username and password 
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