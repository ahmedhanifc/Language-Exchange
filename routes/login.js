const express = require('express');
const router = express.Router();
const business = require("../business")
const COOKIE_NAME = "session"

/*where are we gonna check for sessions then? for now im adding the module for sessions here,also we are going to need to figure out how to 
access session across different files as flash msgs require the deletion of a pseudo-session storage */

// "/" path will render the home page.
router.get("/", async (req, res) => {
    let sessionKey = req.cookies[COOKIE_NAME];
    let sessionData = await business.getSessionData(sessionKey)
    if(!sessionData){
        let userCredentials = {
            username:null,
            email:null,
            password:null
        }
        sessionData = await business.startSession(userCredentials);
        res.cookie(
            "session",
            sessionData.sessionKey,
            {maxAge:sessionData.expiry}
        )
    }

    //What is the information we need to know for the login page of the user? 
    //1) Check if the cookie is present in the browser. if a cookie is present and is valid, then automatically log user in
    res.render("login")
    return;
});

//BUSINESS RULE: We intitiate a session only after login not during sign-up
//need to implement csrf token here
router.post("/", async (req,res) => {
    const {username , password} = req.body
    if(!username ||! password){
        //for now if user isnt succesful we redirect to same page with a flash msg
        res.redirect('/?errorCode=field(s) are empty')
        return
     }
    
    let userCredentials = await business.validateCredentials(username, password);
    if(!userCredentials){
        // How to implement flash messages here?
        res.redirect("/?errorCode=username wrong or does not exist")
        return
    }
    if(userCredentials===-1){
        // How to implement flash messages here?
        res.redirect("/?errorCode=invalid/wrong password")
        return
    }

    // check if session of that user already exists
    let sessionKey = req.cookies[COOKIE_NAME]
    let sessionData = await business.getSessionData(sessionKey)
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

router.post("/sign-up", async(req,res) => {
    const {username, email, password, repeatedPassword} = req.body
    
    if(!username || !email ||! password || ! repeatedPassword){
        //for now if user isnt succesful we redirect to same page with a flash msg
        res.redirect('/sign-up?error=field(s) are empty')
        return
     }

     if (password !== repeatedPassword) {
        res.redirect('/sign-up?error=passwords do not match');
        return;
    }

    let [formatEmail, formatPassword ] = business.validateRegistrationCredentials(email, password);
        /*this double assignment works as array or object,also the format password returns a hashed password if it is valid and
        that is what is stored in the db*/

    console.log(formatEmail,'space',formatPassword)
    if(formatEmail===-1 && formatPassword===-1){
        res.redirect('/sign-up?error=password & email invalid form');
        return;    }
    if(formatEmail===-1){
        res.redirect('/sign-up?error= email invalid form');
        return; 
    }
    if(formatPassword===-1){
        res.redirect('/sign-up?error= password invalid form');
        return; 
    }
    let [validRegisterName,validRegisterEmail]=await business.checkUsernameExistence(username,formatEmail)
    //this function returns the username if it doesnt exist already in the db and heck for email in next commit  
console.log(validRegisterEmail,' register in db ',validRegisterName)

    if(validRegisterEmail&&validRegisterName){
    await business.createUser(validRegisterName,validRegisterEmail,formatPassword,null)
    //the null is for the resettoken attribute by default
    res.redirect("/home/bio")
    return
}   
    res.redirect('/sign-up?error= user could not be created as user already exists');
    return; 
    
    })
module.exports = router;