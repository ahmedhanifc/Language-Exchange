const express = require('express');
const router = express.Router();
const business = require("../business")


router.get("/",  async (req,res) => {
    //here, / is basically /home, because we're asking in the web.js that homeRouter take all the routes
    // the begin with /home
    console.log("heyy")
    res.send("Home Page")
})

router.get("/bio", async(req,res) => {
    res.send("Tell us more about yourself")
})

module.exports = router;

