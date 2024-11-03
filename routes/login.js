const express = require('express');
const router = express.Router();
const business = require("../business")



// "/" path will render the home page.
router.get("/", (req, res) => {

    //What is the information we need to know for the login page of the user? 
    //1) Check if the cookie is present in the browser. if a cookie is present and is valid, then automatically log user in
    res.render("login")
    return;
});

//need to implement csrf token here
router.post("/", async (req,res) => {
    const {username , password} = req.body
    let userCredentials = await business.validateCredentials(username, password);
    if(!userCredentials){
        // How to implement flash messages here?
        res.redirect("/?errorCode=-1")
        return
    }
    // check if session of that user already exists
    let sessionData = await business.getSessionData(req.cookies.session)
    if(!sessionData){
        sessionData = await business.startSession(userCredentials);
        res.cookie(
            "session",
            sessionData.sessionKey,
            {maxAge:sessionData.expiry}
        )
    }
    res.redirect("/home")
})

router.get("/sign-up", (req,res) => {
    res.render("register")
})


//need to implement csrf token here most importantly, will see where to put it tomorrow,will also add the functionality for flash msgs

router.post("/sign-up", (req,res) => {
    const {username, email, password, repeatedPassword} = req.body
    //username validation
    //email validation
    //password validation
    //checking both passwords are the same
    //ensure username doesn't already exist in the database
        // if(username in database) return true , --> hafsa saying that this will be checked through business function 
        // else return false
    //ensure email doesn't already exist in the database --> in business layer ,here flash msg at the end will be displayed
        // if(username in database) return true
        // else return false
    // need to check both, cuz the username could be unique, but the user can pass in a non-unique email address

    //if all of those validations are valid, i want to create a user in the database, specifically, UserAccounts Collection
    business.createUser(username,email,password)
    res.redirect("/home/bio")
})

module.exports = router;