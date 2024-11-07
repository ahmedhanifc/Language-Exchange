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
    let fMessage;
    if(req.sessionData.data.languageLearn.length === 0){
        fMessage = { "errorCode": "fail", "content": "You did not select a language that you want to learn. Please select a language" }
        flash.setFlash(req.sessionData.sessionKey,fMessage);
        res.redirect("/home/languageLearn")
        return;
    }
    if(req.sessionData.data.languageFluent.length === 0){
        fMessage = { "errorCode": "fail", "content": "You did not select a language that you are Fluent in. Please select a language" }
        flash.setFlash(req.sessionData.sessionKey,fMessage);
        res.redirect("/home/languageFluent")
        return;
    }
    res.render("home", {
        username:req.sessionData.data.username,
        languageLearn:req.sessionData.data.languageLearn,
        languageFluent:req.sessionData.data.languageFluent,
        flashData:req.sessionData.data.flashData
    })
})

router.get("/languageLearn", sessionValidityChecker, async(req,res)=> {
    let fMessage = await flash.getFlash(req.sessionData.sessionKey)
    let flashStyle = 'flash-message-yay'
    if (fMessage && fMessage.errorCode === 'fail') {
        flashStyle = 'flash-message-fail'
    }
    res.render("languageLearn", {
        username:req.sessionData.data.username,
        flash:fMessage,
        style:flashStyle,
        languageLearn:req.sessionData.data.languageLearn,
    })
})

router.get("/languageFluent", sessionValidityChecker, async(req,res) => {
    let fMessage;
    if(req.sessionData.data.languageLearn.length === 0){
        fMessage = { "errorCode": "fail", "content": "You did not select a language that you want to learn. Please select a language" }
        flash.setFlash(req.sessionData.sessionKey,fMessage);
        res.redirect("/home/languageLearn")
        return;
    }

    
    fMessage = await flash.getFlash(req.sessionData.sessionKey)
    let flashStyle = 'flash-message-yay'
    if (fMessage && fMessage.errorCode === 'fail') {
        flashStyle = 'flash-message-fail'
    }
    res.render("languageFluent", {
        username:req.sessionData.data.username,
        flash:fMessage,
        style:flashStyle,
        languageFluent:req.sessionData.data.languageFluent
    })
})

router.get("/languageLearn/:languageLearn", sessionValidityChecker, async(req,res) => {
        const {languageLearn} = req.params
        let fMessage;
        if(req.sessionData.data.languageFluent.includes(languageLearn)){
            fMessage = { "errorCode": "fail", "content": "Cannot learn a language you are fluent in! Please go to the next page if you wish to make changes" }
        }

        else if(req.sessionData.data.languageLearn.includes(languageLearn)){
            fMessage = { "errorCode": "yay", "content": "Langauge Successfully Removed" }
            req.sessionData.data.languageLearn.pop(languageLearn)
            await business.updateSession(req.sessionData.sessionKey, req.sessionData)
            await business.updateUserAccountLanguageLearn(req.sessionData.data.username,req.sessionData.data.languageLearn);

        }
        else if(!req.sessionData.data.languageFluent.includes(languageLearn)&&!req.sessionData.data.languageLearn.includes(languageLearn)){
            req.sessionData.data.languageLearn.push(languageLearn)
            await business.updateSession(req.sessionData.sessionKey, req.sessionData)
            await business.updateUserAccountLanguageLearn(req.sessionData.data.username,req.sessionData.data.languageLearn);
            fMessage = { "errorCode": "yay", "content": "Langauge Successfully Added. Click Again if you wish to remove the language" }
        }
        flash.setFlash(req.sessionData.sessionKey,fMessage)
        res.redirect("/home/languageLearn")
})

router.get("/languageFluent/:languageFluent", sessionValidityChecker, async(req,res) => {
    const {languageFluent} = req.params
    let fMessage;
    if(req.sessionData.data.languageLearn.includes(languageFluent)){
        fMessage = { "errorCode": "fail", "content": "You selected that you are learning this language, no? Please go back if you wish to make changes" }

    }
    else if(req.sessionData.data.languageFluent.includes(languageFluent)){
        req.sessionData.data.languageFluent.pop(languageFluent)
        await business.updateSession(req.sessionData.sessionKey, req.sessionData)
        await business.updateUserAccountLanguageFluent(req.sessionData.data.username,req.sessionData.data.languageFluent);
        await business.updateUserAccountLanguageFluent(req.sessionData.data.username,req.sessionData.data.languageFluent)
        fMessage = { "errorCode": "yay", "content": "Langauge Successfully Removed" }


    }
    else if(!req.sessionData.data.languageFluent.includes(languageFluent)&&!req.sessionData.data.languageLearn.includes(languageFluent)){
        req.sessionData.data.languageFluent.push(languageFluent)
        await business.updateSession(req.sessionData.sessionKey, req.sessionData)
        await business.updateUserAccountLanguageFluent(req.sessionData.data.username,req.sessionData.data.languageFluent);
        await business.updateUserAccountLanguageFluent(req.sessionData.data.username,req.sessionData.data.languageFluent)
        fMessage = { "errorCode": "yay", "content": "Langauge Successfully Added" }

    }
    flash.setFlash(req.sessionData.sessionKey,fMessage)
    res.redirect("/home/languageFluent")
})



module.exports = router;

