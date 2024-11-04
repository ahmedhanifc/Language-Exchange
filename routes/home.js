const express = require('express');
const router = express.Router();
const business = require("../business")
const COOKIE_NAME = "session"


router.get("/",  async (req,res) => {
    //here, / is basically /home, because we're asking in the web.js that homeRouter take all the routes
    // that begin with /home
    let sessionKey = req.cookies[COOKIE_NAME];
    //declared it as a const abover cookie_name="session"
    console.log(sessionKey)
    console.log("heyy")
    res.send("Home Page")
})

router.get("/bio", async(req,res) => {
    res.send("Tell us more about yourself")
})

//console.log(req.cookies.session)
//we will need to define separate cookies here as well,it cant access the cookie created in login.js

module.exports = router;

