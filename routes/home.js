const express = require('express');
const router = express.Router();
const business = require("../business")
const fileUpload = require('express-fileupload');
const COOKIE_NAME = "session"
const flash = require("../flash_msgs")

function titleCase(string) {
    formattedString = string.slice(0, 1).toUpperCase() + string.slice(1,);
    return formattedString
}


//trying to use a middleware here
// https://www.youtube.com/watch?v=nzSAf5cVyWY&list=PL_cUvD4qzbkwjmjy-KjbieZ8J9cGwxZpC&index=9 very good video for middlewares fr
async function sessionValidityChecker(req, res, next) {
    let fMessage

    if (req.cookies[COOKIE_NAME]) {
        let sessionKey = req.cookies[COOKIE_NAME];
        let sessionData = await business.getSessionData(sessionKey)
        if (!sessionData) {
            res.redirect("/")
            return
        }
        
        if(!sessionData.data.username){
            fMessage = { "errorCode": "fail", "content": "You are not Authorized to access this page. Please Login" }
            await flash.setFlash(sessionData.sessionKey,fMessage)
            res.redirect("/")
            return
        }
        req.sessionData = sessionData
        next()
    }
    else {
        res.redirect('/logout')
        return;
    }
}

router.get("/", sessionValidityChecker, async (req, res) => {
    let fMessage;
    if (req.sessionData.data.languageLearn.length === 0) {
        fMessage = { "errorCode": "fail", "content": "You did not select a language that you want to learn. Please select a language" }
        flash.setFlash(req.sessionData.sessionKey, fMessage);
        res.redirect("/home/languageLearn")
        return;
    }
    if (req.sessionData.data.languageFluent.length === 0) {
        fMessage = { "errorCode": "fail", "content": "You did not select a language that you are Fluent in. Please select a language" }
        flash.setFlash(req.sessionData.sessionKey, fMessage);
        res.redirect("/home/languageFluent")
        return;
    }
    res.render("home", {
        username: req.sessionData.data.username,
        languageLearn: req.sessionData.data.languageLearn,
        languageFluent: req.sessionData.data.languageFluent,
        flashData: req.sessionData.data.flashData,
        helpers: {
            titleCase
        },
        layout:"main"
    })
})


router.get("/info", sessionValidityChecker, async(req,res)=> {
    let fMessage = await flash.getFlash(req.sessionData.sessionKey)
    let flashStyle = 'flash-message-yay'
    if (fMessage && fMessage.errorCode === 'fail') {
        flashStyle = 'flash-message-fail'
    }

    res.render("info", {
        layout:"main",
        flash: fMessage,
        style: flashStyle,
    })
})

router.post("/info", sessionValidityChecker,fileUpload(), async(req,res) => {
    let {firstName,lastName,nationality, dateOfBirth} = req.body;
    if(firstName.trim().length===0 || lastName.trim().length===0 || lastName.trim().length===0 || dateOfBirth.trim().length===0){
        fMessage = { "errorCode": "fail", "content": "Field(s) Cannot be Empty" }
        flash.setFlash(req.sessionData.sessionKey, fMessage);
        res.redirect("/home/info")
        return;
    }
    let [year,month,day] = dateOfBirth.split("-")
    if(year < "1920" || year > "2020"){
        fMessage = { "errorCode": "fail", "content": "Illegal Date" }
        flash.setFlash(req.sessionData.sessionKey, fMessage);
        res.redirect("/home/info")
        return;
    }

    //here retrieve uploaded file and move to directory
    console.log(req.files)
    let userFile=req.files.userFile
    let fileName=req.sessionData.data.username
    console.log(fileName,req.files.mimetype)
    let filePath=`${__dirname}/user_files/${Date.now()}_${fileName}`
    await userFile.mv(`${filePath}`)
    console.log('check taht a new directory should be made')

    console.log(req.sessionData.data.imageLink)

    req.sessionData.userInfo=[firstName,lastName,nationality, dateOfBirth,filePath]
  //  await business.updateSessionData(req.sessionData.sessionKey, req.sessionData)
    await business.updateuserInfo(req.sessionData.data.username,[firstName,lastName,nationality, dateOfBirth,filePath]);
    //this function updates the useraccount db with the user info
    res.redirect("/home/languageLearn")
    return;
})

router.get("/languageLearn", sessionValidityChecker, async (req, res) => {
    let fMessage = await flash.getFlash(req.sessionData.sessionKey)
    let flashStyle = 'flash-message-yay'
    if (fMessage && fMessage.errorCode === 'fail') {
        flashStyle = 'flash-message-fail'
    }
    res.render("languageLearn", {
        username: req.sessionData.data.username,
        flash: fMessage,
        style: flashStyle,
        languageLearn: req.sessionData.data.languageLearn,
        languages: business.getLangaugesInSystem(),
        helpers: {
            titleCase
        },
        layout:"main"
    })
})

router.get("/languageFluent", sessionValidityChecker, async (req, res) => {
    let fMessage;
    if (req.sessionData.data.languageLearn.length === 0) {
        fMessage = { "errorCode": "fail", "content": "You did not select a language that you want to learn. Please select a language" }
        flash.setFlash(req.sessionData.sessionKey, fMessage);
        res.redirect("/home/languageLearn")
        return;
    }


    fMessage = await flash.getFlash(req.sessionData.sessionKey)
    let flashStyle = 'flash-message-yay'
    if (fMessage && fMessage.errorCode === 'fail') {
        flashStyle = 'flash-message-fail'
    }
    res.render("languageFluent", {
        username: req.sessionData.data.username,
        flash: fMessage,
        style: flashStyle,
        languageFluent: req.sessionData.data.languageFluent,
        languages: business.getLangaugesInSystem(),
        helpers: {
            titleCase
        },
        layout:"main"
    })
})

router.get("/languageLearn/:languageLearn", sessionValidityChecker, async (req, res) => {
    const { languageLearn } = req.params
    let fMessage;
    if (req.sessionData.data.languageFluent.includes(languageLearn)) {
        fMessage = { "errorCode": "fail", "content": "Cannot learn a language you are fluent in! Please go to the next page if you wish to make changes" }
    }

    else if (req.sessionData.data.languageLearn.includes(languageLearn)) {
        req.sessionData.data.languageLearn.pop(languageLearn)
        await business.updateSessionData(req.sessionData.sessionKey, req.sessionData)
        await business.updateUserAccountLanguageLearn(req.sessionData.data.username, req.sessionData.data.languageLearn);
        fMessage = { "errorCode": "yay", "content": "Langauge Successfully Removed" }

    }
    else if (!req.sessionData.data.languageFluent.includes(languageLearn) && !req.sessionData.data.languageLearn.includes(languageLearn)) {
        req.sessionData.data.languageLearn.push(languageLearn)
        await business.updateSessionData(req.sessionData.sessionKey, req.sessionData)
        await business.updateUserAccountLanguageLearn(req.sessionData.data.username, req.sessionData.data.languageLearn);
        fMessage = { "errorCode": "yay", "content": "Langauge Successfully Added. Click Again if you wish to remove the language" }
    }
    flash.setFlash(req.sessionData.sessionKey, fMessage)
    res.redirect("/home/languageLearn")
})

router.get("/languageFluent/:languageFluent", sessionValidityChecker, async (req, res) => {
    const { languageFluent } = req.params
    let fMessage;
    if (req.sessionData.data.languageLearn.includes(languageFluent)) {
        fMessage = { "errorCode": "fail", "content": "You selected that you are learning this language, no? Please go back if you wish to make changes" }

    }
    else if (req.sessionData.data.languageFluent.includes(languageFluent)) {
        req.sessionData.data.languageFluent.pop(languageFluent)
        await business.updateSessionData(req.sessionData.sessionKey, req.sessionData)
        await business.updateUserAccountLanguageFluent(req.sessionData.data.username, req.sessionData.data.languageFluent);
        fMessage = { "errorCode": "yay", "content": "Langauge Successfully Removed" }
    }
    else if (!req.sessionData.data.languageFluent.includes(languageFluent) && !req.sessionData.data.languageLearn.includes(languageFluent)) {
        req.sessionData.data.languageFluent.push(languageFluent)
        await business.updateSessionData(req.sessionData.sessionKey, req.sessionData)
        await business.updateUserAccountLanguageFluent(req.sessionData.data.username, req.sessionData.data.languageFluent);
        fMessage = { "errorCode": "yay", "content": "Langauge Successfully Added" }
    }
    flash.setFlash(req.sessionData.sessionKey, fMessage)
    res.redirect("/home/languageFluent")
})



module.exports = router

