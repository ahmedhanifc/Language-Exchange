const express = require('express');
const router = express.Router();
const business = require("../business")
const fileUpload = require('express-fileupload');
const COOKIE_NAME = "session"
const flash = require("../flash_msgs")
const BadgeManagement = require("../class/BadgeManagement")

function toTitleCase(word){
    return word.substring(0,1).toUpperCase() + word.substring(1,)
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


    let completedBadges = await business.getCompletedBadges(req.sessionData.data.username);
    res.render("home", {
        username: req.sessionData.data.username,
        languageLearn: req.sessionData.data.languageLearn,
        languageFluent: req.sessionData.data.languageFluent,
        flashData: req.sessionData.data.flashData,
        helpers: {
            toTitleCase
        },
        layout:"main",
        userProfileImage:req.sessionData.data.userInfo.fileLink,
        badges:completedBadges,
        
    })
})

//BUSINESS RULE: USERS MMUST UPLOAD PROFILE PICTURES,THERE WILL BE NO DEFAULT FOR THEM.we want personlized profiles and visible ones.
router.get("/info", sessionValidityChecker, async(req,res)=> {
    let fMessage = await flash.getFlash(req.sessionData.sessionKey)
    let flashStyle = 'flash-message-yay'
    if (fMessage && fMessage.errorCode === 'fail') {
        flashStyle = 'flash-message-fail'
    }

    let csrf = await business.generateFormToken(req.sessionData.sessionKey)


    res.render("info", {
        layout:"main",
        flash: fMessage,
        style: flashStyle,
        csrf:csrf
    })
    return
})

router.post("/info", sessionValidityChecker,fileUpload(), async(req,res) => {
    let {firstName,lastName,nationality, dateOfBirth,csrf} = req.body;
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
    //checks for file uploaded
    if(!req.files){
        fMessage = { "errorCode": "fail", "content": "You must upload a profile picture" }
        flash.setFlash(req.sessionData.sessionKey, fMessage);
        res.redirect("/home/info")
        return;
    }
    let userFile=req.files.userFile

    if(userFile.mimetype!=='image/png' && userFile.mimetype!=='image/jpeg' ){
        fMessage = { "errorCode": "fail", "content": "File needs to be .png,.jpg or .jpeg" }
        flash.setFlash(req.sessionData.sessionKey, fMessage);
        res.redirect("/home/info")
        return;
    }
    
    if(csrf !== req.sessionData.data.csrfToken){
        let message = { "errorCode": "fail", "content": "I don't think you're allowed to do that big man" }
        await flash.setFlash(req.sessionData.sessionKey, message)
        await business.cancelToken(req.sessionData.sessionKey)
        res.redirect("/")
        return;
    }else{
        await business.cancelToken(req.sessionData.sessionKey)
    }

    //if file is correct then it saves
 let fileName=req.sessionData.data.username
 let timestamp = Date.now();
let relativeFilePath = `/user_files/${timestamp}_${fileName}`; // Relative path for browser access so that we can render this easily when we retrieve
let absoluteFilePath = `${__dirname.slice(0,-6)}static/user_files/${timestamp}_${fileName}`;
// Move the file to the server directory
await userFile.mv(absoluteFilePath);
console.log("File uploaded and moved to directory:", absoluteFilePath);
     //to save file path that can be called later from useraccounts to display profile picture
     let infoData={
        firstName: firstName,
        lastName:lastName,
        nationality:nationality,
        dateOfBirth:dateOfBirth,
        fileLink: relativeFilePath,
    }
    //saving infoData object as itself within sessionData.data.userInfo
    req.sessionData.data.userInfo=infoData

    let contactData={
        username:req.sessionData.data.username,
        friends:[],
        blockedUsers:[]
    }


        console.log(infoData)
    //here i initialize the user contacts till they add friends because we are initializing everything else here too
    await business.createUserContacts(contactData)
   // req.sessionData.userInfo=[firstName,lastName,nationality, dateOfBirth,filePath]
    await business.updateSessionData(req.sessionData.sessionKey, req.sessionData)
    await business.updateuserInfo(req.sessionData.data.username,infoData);
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
        userProfileImage:req.sessionData.data.userInfo.fileLink,
        helpers: {
            toTitleCase
        },
        layout:"main"
    })
})

router.get("/languageFluent", sessionValidityChecker, async (req, res) => {
    let fMessage;
    if (req.sessionData.data.languageLearn.length === 0) {
        fMessage = { "errorCode": "fail", "content": "You did not select a language that you want to learn. Please select a language" }
        await flash.setFlash(req.sessionData.sessionKey, fMessage);
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
        userProfileImage:req.sessionData.data.userInfo.fileLink,
        helpers: {
            toTitleCase
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
    await flash.setFlash(req.sessionData.sessionKey, fMessage)
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
        await business.decrementUserStatistics(req.sessionData.data.username,"languageLearn")

    }
    else if (!req.sessionData.data.languageFluent.includes(languageFluent) && !req.sessionData.data.languageLearn.includes(languageFluent)) {
        req.sessionData.data.languageFluent.push(languageFluent)
        await business.updateSessionData(req.sessionData.sessionKey, req.sessionData)
        await business.updateUserAccountLanguageFluent(req.sessionData.data.username, req.sessionData.data.languageFluent);
        fMessage = { "errorCode": "yay", "content": "Langauge Successfully Added" }
        await business.incrementUserStatistics(req.sessionData.data.username,"languageLearn")

    }
    await flash.setFlash(req.sessionData.sessionKey, fMessage)
    res.redirect("/home/languageFluent")
})






module.exports = router

