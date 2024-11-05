const express = require('express');
const router = express.Router();
const business = require("../business")
const COOKIE_NAME = "session"

//trying to use a middleware here
// https://www.youtube.com/watch?v=nzSAf5cVyWY&list=PL_cUvD4qzbkwjmjy-KjbieZ8J9cGwxZpC&index=9 very good video for middlewares fr
async function sessionValidityChecker(req,res,next){
    let sessionKey = req.cookies[COOKIE_NAME];
    let sessionData = await business.getSessionData(sessionKey)
    if(!sessionData){
        //flash message here
        res.redirect("/")
        return
    }
    req.sessionData = sessionData
    next()
}

router.get("/", sessionValidityChecker ,async (req,res) => {

    res.render("home", {
        username:req.sessionData.data.username,
        languageLearn:req.sessionData.data.languageLearn,
        languageFluent:req.sessionData.data.languageFluent,
    })
})

router.get("/welcome", sessionValidityChecker,async(req,res) => {
    //ensure user has a valid session otherwise redirect
    res.render("welcome")
})

module.exports = router;

