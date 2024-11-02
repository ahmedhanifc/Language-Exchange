const express = require('express');
const router = express.Router();
const business = require("../business")

function errorHandler(req,res,next){
    let {errorCode} = req.query;
    errorCode = parseInt(errorCode)
    let message = ""
    if(errorCode === -1){
        message = "Invalid Username and Password"
    }

    next();
}

router.use(errorHandler);
// "/" path will render the home page.
router.get("/", (req, res) => {
    // also in the lecture18 code, they authenticate directly in the / page. 

    //What is the information we need to know for the login page of the user? 
    //1) Check if the cookie is present in the browser. if a cookie is present and is valid, then automatically log user in
    res.render("login")
    return;
});

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