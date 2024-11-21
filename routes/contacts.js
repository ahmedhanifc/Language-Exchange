const express = require('express');
const router = express.Router();
const business = require("../business")
const COOKIE_NAME = "session"
const flash = require("../flash_msgs")

const BadgeManagement = require("../class/BadgeManagement")


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

function toTitleCase(word){
    return word.substring(0,1).toUpperCase() + word.substring(1,)
}

router.get("/", sessionValidityChecker,async(req,res) => {
let fMessage

let userTargetLanguage=req.sessionData.data.languageLearn
let data=await business.displayingContacts(userTargetLanguage,req.sessionData.data.username)
console.log(data)
if(!data){
        fMessage = { "errorCode": "fail", "content": "There are no users fluent in your target language." }
        await flash.setFlash(req.sessionData.sessionKey,fMessage)
       
}
//can also retreive from db the list of blocked ppl.
let friends=await business.displayingFriends(userTargetLanguage,req.sessionData.data.username)
if(!friends){
    fMessage = { "errorCode": "fail", "content": "You are friendless." }
    await flash.setFlash(req.sessionData.sessionKey,fMessage)
   
}
//will send titlecase helper function too

 fMessage = await flash.getFlash(req.sessionData.sessionKey)
let flashStyle = 'flash-message-yay'
if (fMessage && fMessage.errorCode === 'fail') {
    flashStyle = 'flash-message-fail'
}
res.render("contacts", {
    layout:"main",
    flash: fMessage,
    style: flashStyle,
    contacts:data,
    friends:friends,
    userName:req.sessionData.data.username,
    helpers:{
        toTitleCase
    }
})

})

//fetch requests here
router.get('/api/addFriend/:username/:friendAccount',async(req,res)=>{
    const {username,friendAccount}=req.params
    await business.addFriend(username,friendAccount)
    console.log('refresh page, one more person should be in the friends heading')
    res.send('ok')
})





module.exports = router;