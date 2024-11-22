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
    BadgeManagement.createBadge(
        name = "Bilingual", description = "Learn Two Langauges",target = 2,completedImageName = "trophy.png",incompletedImageName = "trophy_blackAndWhite.png"
    )
    BadgeManagement.createBadge("100 Messages Sent","Total messages sent reaches 100",100,"adventure.png","adventure_blackAndWhite.png");
    BadgeManagement.createBadge("First Conversation","Message sent and a reply received",1,"grapeSoda.png","grapeSoda_blackAndWhite.png");

    let userStatistics = await business.getUserStatistics(username)
    BadgeManagement.getBadges()["Bilingual"].updateFeature(userStatistics["languageLearn"]);

    let firstConversationCondition = (userStatistics["messagesSent"] >= 1 && userStatistics["messagesReceived"] >=1);
    BadgeManagement.getBadges()["First Conversation"].requirementsMet(firstConversationCondition)


    res.render("profile", {
        layout:"main",
        userFile:req.sessionData.data.userInfo.fileLink,
        firstName:req.sessionData.data.userInfo.firstName,
        lastName: req.sessionData.data.userInfo.lastName,
        userName:req.sessionData.data.username,
        nationality: req.sessionData.data.userInfo.nationality,
        numlanguageLearn: req.sessionData.data.languageLearn.length,
        numLanguageFluent:req.sessionData.data.languageFluent.length,
        languageLearn,
        languageFluent,
        helpers:{
            toTitleCase,
        },
        badges: BadgeManagement.getBadges()



    })
})


module.exports = router;