const express = require('express');
const router = express.Router();
const business = require("../business")
/*where are we gonna check for sessions then? for now im adding the module for sessions here,also we are going to need to figure out how to 
access session across different files as flash msgs require the deletion of a pseudo-session storage */
const session = require('express-session');
const flash = require('connect-flash');

// Set up session middleware
router.use(
    session({
      secret: 'your_secret_key',
      resave: false,
      saveUninitialized: true,
    })
  );
                                                               //for now this is one possible trial where i store the flash msgs in the route file itself
                                                               //will do another commit to my trial branch to see if decalring flash middelware and msgs in the web.js is enough 
  // Set up connect-flash middleware
  router.use(flash());
  
  // Middleware to pass flash messages to views
  router.use((req, res, next) => {
    res.locals.success_msg = req.flash('success');
    res.locals.error_msg = req.flash('error');
    next();
  });


// "/" path will render the home page.
router.get("/", (req, res) => {
    // also in the lecture18 code, they authenticate directly in the / page. 

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