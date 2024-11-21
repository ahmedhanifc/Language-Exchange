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
    let visitedUser = "message"

    let visitedUserData = await business.findUser(visitedUser);
    let users = [loggedInUser, visitedUserData.username];
    let messagesData = await business.getMessages(users);
    if(!messagesData || !messagesData.users){
        await business.createMessage(users)
    }
    let messages = messagesData.messages;

    if(!messages){
        messages = []
    }
    
    res.render("messages", {
        layout: "main",
        messages: messages,
        visitedUserData: visitedUserData,
        loggedInUser: loggedInUser,
        flash: fMessage,
        style: flashStyle,
        helpers: {
            isLoggedInUser
        }
    })
})

router.post("/processMessage", sessionValidityChecker,async (req,res) => {
    let fMessage

    let {message, visitedUser, loggedInUser} = req.body;
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

    }

    res.redirect("/message")
    return
})


module.exports = router;


/*

    // let messages = [
    //     {
    //         user: loggedInUser,
    //         message: "Hello",
    //         timestamp: new Date()
    //     },
    //     {
    //         user: visitedUser,
    //         message: "i am doing amazingly",
    //         timestamp: new Date()
    //     },
    //     {
    //         user: loggedInUser,
    //         message: "i am doing amazingly. Well thats nice",
    //         timestamp: new Date()
    //     },
    // ]
*/