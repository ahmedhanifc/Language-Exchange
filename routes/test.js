const BadgeManagement = require("../class/BadgeManagement");

const express = require('express');
const router = express.Router();

router.get("/", async(req,res) => {


    BadgeManagement.createBadge(name = "Message Achievement", description = "100 messages sent"
        ,target = 100,completedImageName = "3.svg",incompletedImageName = "4.svg");
    BadgeManagement.createBadge(name = "Message Achievement1", description = "200 messages sent"
        ,target = 200,completedImageName = "3.svg",incompletedImageName = "4.svg");


    console.log(BadgeManagement.getBadges()["Message Achievement"]["target"]);

    BadgeManagement.getBadges()["Message Achievement"].requirementsMet(77);



    res.send("Hello Test")
})

module.exports = router;