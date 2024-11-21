const express = require('express');
const router = express.Router();
const business = require("../business")
const COOKIE_NAME = "session"
const flash = require("../flash_msgs")
const persistence = require("../persistence");

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

router.get("/", async (req, res) => {
    let loggedInUser = "nigesh";
    let visitedUser = "admin"
    let messages = [
        {
            user: loggedInUser,
            message: "Hello",
            timestamp: new Date()
        },
        {
            user: visitedUser,
            message: "i am doing amazingly",
            timestamp: new Date()
        },
        {
            user: loggedInUser,
            message: "i am doing amazingly. Well thats nice",
            timestamp: new Date()
        },
    ]

    let users = [loggedInUser, visitedUser];

    let messageData = await persistence.getMessages(users);


    res.render("messages", {
        layout: "main",
        messages: messages,
        visitedUser: visitedUser,
        loggedInUser: loggedInUser,
        helpers: {
            isLoggedInUser
        }

    })
})


module.exports = router;