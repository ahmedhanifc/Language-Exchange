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
    const languageLearn = business.getLangaugesInSystem().filter(language => req.sessionData.data.languageLearn.includes(language.name))
    const languageFluent =  business.getLangaugesInSystem().filter(language => req.sessionData.data.languageFluent.includes(language.name))

    BadgeManagement.createBadge(
        name = "Bilingual", description = "Learn Two Langauges",target = 2,completedImageName = "3.svg",incompletedImageName = "4.svg"
    )

    BadgeManagement.getBadges()["Bilingual"].updateFeature(languageLearn.length);
    console.log(BadgeManagement.getBadges()["Bilingual"]) // accessing badge properties

    // let image=filePath


    res.render("profile", {
        layout:"main",
        // image:image,
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