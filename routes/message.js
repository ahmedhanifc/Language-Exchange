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

        if (!sessionData.data.username) {
            fMessage = { "errorCode": "fail", "content": "You are not Authorized to access this page. Please Login" }
            await flash.setFlash(sessionData.sessionKey, fMessage)
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

function isLoggedInUser(a, b) {
    return a === b ? true : false;
}

router.get("/", sessionValidityChecker,async (req, res) => {
    let fMessage = await flash.getFlash(req.sessionData.sessionKey)
    let flashStyle = 'flash-message-yay'
    if (fMessage && fMessage.errorCode === 'fail') {
        flashStyle = 'flash-message-fail'
    }

    let loggedInUser = req.sessionData.data.username;
    let visitedUser = req.sessionData.data.visitedUser;

    let messages;
    let visitedUserData = await business.findUser(visitedUser);
    let users = [loggedInUser, visitedUserData.username];
    let messagesData = await business.getMessages(users);
    if(!messagesData || !messagesData.users){
        await business.createMessage(users)
        messages = []
    }
    else{
        messages = messagesData.messages;
    }

    let csrf = await business.generateFormToken(req.sessionData.sessionKey)
    
    res.render("messages", {
        layout: "main",
        messages: messages,
        visitedUserData: visitedUserData,
        loggedInUser: loggedInUser,
        flash: fMessage,
        style: flashStyle,
        csrf:csrf,
        userProfileImage:req.sessionData.data.userInfo.fileLink,
        helpers: {
            isLoggedInUser
        }
    })
})

router.post("/processMessage", sessionValidityChecker,async (req,res) => {
    let fMessage

    let {message, visitedUser, loggedInUser, csrf} = req.body;
    if(csrf !== req.sessionData.data.csrfToken){
        fmessage = { "errorCode": "fail", "content": "I don't think you're allowed to do that big man" }
        await flash.setFlash(sessionKey, message)
        res.redirect("/")
        return;
    }

    if(message.trim().length === 0){
        fMessage = { "errorCode": "fail", "content": "Empty Message, Are you trying to send a ghost?" }
        await flash.setFlash(req.sessionData.sessionKey,fMessage)
    }
    else{
        let messageData = {
            sender:loggedInUser,
            message:message,
            timestamp : new Date()
        }
        let users = [loggedInUser,visitedUser];
        await business.updateMessage(users,messageData);
        await business.incrementUserStatistics(loggedInUser,"messagesSent")
        await business.incrementUserStatistics(visitedUser,"messagesReceived")
    }

    res.redirect("/message")
    return
})

router.post("/api/user", sessionValidityChecker,async(req,res)=> {
    const {visitedUser} = req.body;
    await business.setVisitedUser(req.sessionData.sessionKey,visitedUser);
    return res.sendStatus(200);
})

module.exports = router;
