const express = require('express');
const router = express.Router();
const business = require("../business")
const COOKIE_NAME = "session"
const flash = require("../flash_msgs")


//trying to use a middleware here
// https://www.youtube.com/watch?v=nzSAf5cVyWY&list=PL_cUvD4qzbkwjmjy-KjbieZ8J9cGwxZpC&index=9 very good video for middlewares fr
async function sessionValidityChecker(req,res,next){
    let sessionKey = req.cookies[COOKIE_NAME];
    let sessionData = await business.getSessionData(sessionKey)
    if(!sessionData){
        res.redirect("/")
        return
    }
    req.sessionData = sessionData
    next()
}

router.get("/", sessionValidityChecker ,async (req,res) => {

    if(req.sessionData.data.languageLearn && req.sessionData.data.languageFluent){  
            res.render("home", {
                username:req.sessionData.data.username,
                languageLearn:req.sessionData.data.languageLearn,
                languageFluent:req.sessionData.data.languageFluent,
                flashData:req.sessionData.data.flashData
            })
    }
    else{
        flash.setFlash(sessionData.sessionKey,"Unauthorized Access to the Home Page")
        res.redirect("/")
    }
})

router.get("/welcome", sessionValidityChecker,async(req,res) => {    
    //ensure user has a valid session otherwise redirect
    if(req.sessionData.data.languageLearn === null){
        res.render("languageLearn", {
            username:req.sessionData.data.username
        })
        return
    }
    res.send("last resort")

})

router.get("/welcome/:languageLearn", sessionValidityChecker,async(req,res) => {
    const {languageLearn} = req.params
    console.log(languageLearn)
    console.log(req.sessionData.data.languageLearn)

    res.redirect("/home/welcome")
    return
    
})


module.exports = router;

