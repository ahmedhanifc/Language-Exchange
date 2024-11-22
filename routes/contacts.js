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

if(!data || data.length===0){
    data=null
}
//can also retreive from db the list of blocked ppl.
let friends=await business.displayingFriends(userTargetLanguage,req.sessionData.data.username)

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
    userProfileImage:req.sessionData.data.userInfo.fileLink,
    helpers:{
        toTitleCase
    }
})

})

//BUSINESS RULE:When userA adds userB as friend,in userB's contacts list-userAgets added as well
router.get('/api/addFriend/:username/:friendAccount',async(req,res)=>{
    const {username,friendAccount}=req.params
    try{
    await business.addFriend(username,friendAccount)
    await business.addFriend(friendAccount,username)
    console.log('refresh page, one more person should be in the friends heading')
    res.sendStatus(200)

    }
    catch(error){
        res.sendStatus(404)
    }
})

router.get('/api/removeFriend/:username/:targetAccount',async(req,res)=>{
    const {username,targetAccount}=req.params
    try{
    await business.removeFriend(username,targetAccount)
    console.log('check db person should not be friends anymore')
    res.sendStatus(200)
    }
    catch(error){
        res.sendStatus(404)
    }
   
})

router.get('/api/blockContact/:username/:targetAccount',async(req,res)=>{
    const {username,targetAccount}=req.params
    try{
    await business.blockContact(username,targetAccount)
    console.log('check db person should not be visible anymore anymore')
    res.sendStatus(200)
    } 
    catch(error){
        res.sendStatus(404)
    }
    
})


module.exports = router;