const express = require('express');
const router = express.Router();
const business = require("../business")
const COOKIE_NAME = "session"
const flash = require("../flash_msgs")

const BadgeManagement = require("../class/BadgeManagement")

async function programReferenceData(){
    //this function is just for reference as to what sort of user statistics we have in our application.
    const userStatistics = ["languageLearn","messagesSent","messagesReceived"]

}


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
    const languageLearn = business.getLangaugesInSystem().filter(language => req.sessionData.data.languageLearn.includes(language.name))
    const languageFluent =  business.getLangaugesInSystem().filter(language => req.sessionData.data.languageFluent.includes(language.name))
    const username = req.sessionData.data.username

    await business.manageUserBadges(username);
    let friends=await business.displayingFriends(languageLearn,username)
    let numFriends=friends.length

    res.render("profile", {
        layout:"main",
        isLoggedInUser:true,
        userFile:req.sessionData.data.userInfo.fileLink,
        firstName:req.sessionData.data.userInfo.firstName,
        lastName: req.sessionData.data.userInfo.lastName,
        userName:req.sessionData.data.username,
        nationality: req.sessionData.data.userInfo.nationality,
        numFriends:numFriends,
        numlanguageLearn: req.sessionData.data.languageLearn.length,
        numLanguageFluent:req.sessionData.data.languageFluent.length,
        languageLearn,
        languageFluent,
        userProfileImage:req.sessionData.data.userInfo.fileLink,
        helpers:{
            toTitleCase,
        },
        badges: BadgeManagement.getBadges()
    })
})

router.get("/visitedUser", sessionValidityChecker,async(req,res) => {
    let visitedUser = req.sessionData.data.visitedUser;
    let visitedUserData = await business.findUser(visitedUser);
    let visitedUserFriends=await business.displayingFriends(visitedUserData.languageLearn,visitedUser)
    let numFriends=visitedUserFriends.length

    const languageLearn = business.getLangaugesInSystem().filter(language => visitedUserData.languageLearn.includes(language.name))
    const languageFluent =  business.getLangaugesInSystem().filter(language => visitedUserData.languageFluent.includes(language.name))

    const completedBadges = await business.getCompletedBadges(visitedUser);
    res.render("profile", {
        layout:"main",
        userFile:visitedUserData.userInfo.fileLink,
        isLoggedInUser:false,
        firstName:visitedUserData.userInfo.firstName,
        lastName: visitedUserData.userInfo.lastName,
        userName:visitedUserData.username,
        nationality: visitedUserData.userInfo.nationality,
        numFriends:numFriends,
        numlanguageLearn: visitedUserData.languageLearn.length,
        numLanguageFluent:visitedUserData.languageFluent.length,
        languageLearn,
        languageFluent,
        helpers:{
            toTitleCase,
        },
        badges: completedBadges,
        userProfileImage:req.sessionData.data.userInfo.fileLink,

    })
})

router.post("/api/user", sessionValidityChecker,async(req,res)=> {
    console.log("request received")
    const {visitedUser} = req.body;
    await business.setVisitedUser(req.sessionData.sessionKey,visitedUser);
    return res.sendStatus(200);
})



module.exports = router;