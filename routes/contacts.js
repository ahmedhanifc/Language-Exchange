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

router.get("/", sessionValidityChecker,async(req,res) => {

let userTargetLanguage=req.sessionData.data.languageLearn
let excludedUsername=req.sessionData.data.username
let data=await business.getPossibleContacts(userTargetLanguage,excludedUsername)

//will send titlecase helper function too
res.render("contacts", {
    layout:"main",
    contacts:data,
    userName:req.sessionData.data.username,




})


})







module.exports = router;