const express = require('express');
const router = express.Router();
const business = require("../business")
const COOKIE_NAME = "session"
const flash = require("../flash_msgs")
const crypto = require("crypto")


//the verified attr added to db,will be used to verify user signup,will be additional check in login only
//BUSINESS RULE:user cant even login wihtiut verification and once they have been verified,the rest of the site does not need to check for it.

// "/" path will render the home page.
router.get("/", async (req, res) => {
    
    let sessionKey = req.cookies[COOKIE_NAME];
    let sessionData = await business.getSessionData(sessionKey)
    if (!sessionData) {
        let data = {
            username: null,
            languageLearn: [],
            languageFluent: [],
            csrfToken: null,
            flashData: 0,
        }
        sessionData = await business.startSession(data);
        res.cookie(
            "session",
            sessionData.sessionKey,
            { maxAge: sessionData.expiry }
        )
    }

    //chunk of code for register
     //from the register page
     if(req.cookies.flashData){
        let fMessage=req.cookies.flashData
        res.clearCookie('flashData')
        let flashStyle = 'flash-message-yay'
        res.render("login", {
            layout: "loginMain",
            flash: fMessage,
            style: flashStyle
        })

        return
     }

    /*the flash gets deleted here and set in the post becaye even if its empty flash,wont display till it has a value
    same mechanism for the rest,we always redirect to the route that renders and put the getFlash before rendering, setFlash on the post routes.
    If i render in post,the refresh will just directly go to the post cuz whenevr we refresh it submits form again so we never render in post,only redirect*/
    let fMessage = await flash.getFlash(sessionKey)
    let flashStyle = 'flash-message-yay'
    if (fMessage && fMessage.errorCode === 'fail') {
        flashStyle = 'flash-message-fail'
    }
    res.render("login", {
        layout: "loginMain",
        flash: fMessage,
        style: flashStyle
    })
})


//What is the information we need to know for the login page of the user? 
//1) Check if the cookie is present in the browser. if a cookie is present and is valid, then automatically log user in


//BUSINESS RULE: We intitiate a session only after login not during sign-up
//need to implement csrf token here
router.post("/", async (req, res) => {
    // session will now always exist,only if its not successful login,user will have all attributes set to null
    let sessionKey = req.cookies[COOKIE_NAME]
    let sessionData = await business.getSessionData(sessionKey)
    const { username, password } = req.body

    if (!username || !password) {
        let message = { "errorCode": "fail", "content": "You cant leave the fields empty" }
        await flash.setFlash(sessionKey, message)
        res.redirect("/")
        return

        //for now if user isnt succesful we redirect to same page with a flash message
        //res.redirect('/?errorCode=field(s) are empty')
        //return
        //for flasg messages i wont have the redirect anymore i think, instead i will just render the login page again while seninf extra paramters now
        //redirection will prolly occur only for the new pages
    }
    else {
        /*here the else executes and checks for other stuff if the fields are not empty if i dont put the else
        the code for the rest will ofc execute even tho it shouldnt*/
        let userCredentials = await business.validateCredentials(username, password);
        if (!userCredentials) {
            // How to implement flash messages here?
            let message = { "errorCode": "fail", "content": "Wrong Username or User does not exist" }
            await flash.setFlash(sessionKey, message)
            res.redirect("/")
            return
        }
        if (userCredentials === -1) {
            // How to implement flash messages here?
            let message = { "errorCode": "fail", "content": "Invalid/Wrong password!!" }
            await flash.setFlash(sessionKey, message)
            res.redirect("/")
            return
        }

        if (!sessionData) {
            /*here i added because they will never have a sesson before login,plus if they login after resetting password,it should work now
            same with verification*/
            let data = {
                username: null,
                languageLearn: [],
                languageFluent: [],
                csrfToken: null,
                flashData: 0,
            }
            sessionData = await business.startSession(data);
            res.cookie(
                "session",
                sessionData.sessionKey,
                { maxAge: sessionData.expiry }
            )
        }

        //we updated it session here as the user has correct credentials,now the attributes will not be null anymore
        sessionData.data.username = userCredentials.username

        if(userCredentials.languageFluent && userCredentials.languageLearn){
            sessionData.data.languageFluent = userCredentials.languageFluent
            sessionData.data.languageLearn = userCredentials.languageLearn
        }
        await business.updateSession(sessionKey, sessionData);

        if (userCredentials.username && userCredentials.isVerified) {
            //this whole chunk of code only executes if a username exists/for valid users else the login page gets rendered again

            if (!userCredentials.languageFluent || !userCredentials.languageLearn) {
                res.redirect("/home/languageLearn")
                return
            }
            else if (userCredentials.languageLearn.length === 0 || userCredentials.languageFluent.length === 0) {
                res.redirect("/home/languageLearn")
                return
            }
            else {
                res.redirect("/home")
                return;
            }
        }
        if(!userCredentials.isVerified){
            let message = { "errorCode": "fail", "content": "You need to verify your email,check your email box." }
            await flash.setFlash(sessionKey, message)
            res.redirect("/")
            return
        }
    }
    /*we getflash right before rendering because by this point we will have hit one of the conditions if credentials wrong,so it will show the condition that is the most recent
    and then delete it */
    res.redirect("/")
    return;
})





router.get("/sign-up", async (req, res) => {
    let sessionKey = req.cookies[COOKIE_NAME]
    let sessionData = await business.getSessionData(sessionKey)
    if(!sessionData){
        //user first needs to have a session, which they receive in the /route
        res.redirect("/")
        return;
    }

    let fMessage = await flash.getFlash(sessionKey)
    let flashStyle = 'flash-message-yay'
    if (fMessage && fMessage.errorCode === 'fail') {
        flashStyle = 'flash-message-fail'
    }

    let csrf = await business.generateFormToken(sessionKey)

    res.render("register", {
    //by not specifying a layout,its getting a layout from the main for the flash msgs but that doesnt work for this special page
        layout:"loginMain",
        flash: fMessage,
        style: flashStyle,
        csrf:csrf
    })
    return
})


//need to implement csrf token here most importantly, will see where to put it tomorrow,will also add the functionality for flash messages

router.post("/sign-up", async (req, res) => {
    let sessionKey = req.cookies[COOKIE_NAME]
    let sessionData = await business.getSessionData(sessionKey)
    // can use this to add flash messages also
    if(!sessionData){
        //user first needs to have a session, which they receive in the /route
        res.redirect("/")
        return
    }
    const { username, email, password, repeatedPassword, csrf} = req.body
    let validatedUsername=business.validateUsername(username)


    if(csrf !== sessionData.data.csrfToken){
        let message = { "errorCode": "fail", "content": "I don't think you're allowed to do that big man" }
        await flash.setFlash(sessionKey, message)
        res.redirect("/")
        return;
    }

    if(!validatedUsername){
        let message = { "errorCode": "fail", "content": "Username cannot be greater than 8 characters.Only _ and - allowed as symbols." }
        await flash.setFlash(sessionKey, message)
        res.redirect("/sign-up")
        return;  
    }
    if (usernamesername || !email || !password || !repeatedPassword) {
        
        let message = { "errorCode": "fail", "content": "Field(s) are empty" }
        await flash.setFlash(sessionKey, message)
        res.redirect("/sign-up")
        return;       
    }

    if (password !== repeatedPassword) {
        let message = { "errorCode": "fail", "content": "Your entries in the password fields need to be the same!" }
        await flash.setFlash(sessionKey, message)
        res.redirect("/sign-up")
        return;  
    }

    let [formatEmail, formatPassword] = business.validateRegistrationCredentials(email, password);
    /*this double assignment works as array or object,also the format password returns a hashed password if it is valid and
    that is what is stored in the db*/

    console.log(formatEmail, 'space', formatPassword)
    if (formatEmail === -1 && formatPassword === -1) {
        let message = { "errorCode": "fail", "content": "Your email and password entries both are not of a valid form!" }
        await flash.setFlash(sessionKey, message)
        res.redirect("/sign-up")
        return;  
    }
    if (formatEmail === -1) {
        let message = { "errorCode": "fail", "content": "You entered an invalid email." }
        await flash.setFlash(sessionKey, message)
        res.redirect("/sign-up")
        return;  
    }
    if (formatPassword === -1) {
        let message = { "errorCode": "fail", "content": "You entered an invalid password format." }
        await flash.setFlash(sessionKey, message)
        res.redirect("/sign-up")
        return;  
    }
    let [validRegisterName, validRegisterEmail] = await business.checkUsernameExistence(validatedUsername, formatEmail)
    //this function returns the username if it doesnt exist already in the db and heck for email in next commit  
    console.log(validRegisterEmail, ' register in db ', validRegisterName)

    if (validRegisterEmail && validRegisterName) {
        //the null is for the resettoken attribute by default

        await business.createUser(validRegisterName, validRegisterEmail, formatPassword, null)
        sessionData.data.username = validRegisterName
        await business.updateSession(sessionData.sessionKey,sessionData)
        //here if registration succeessful we send an email with the verification link  and display flash
            let verificationToken=crypto.randomUUID()
            //the path parameter makes the cookie accesible through allpaths in the same domain
              console.log(`from:hafsa@lab.com,
                to:${email},
                subject:Your verification link,
                html:this is the link http://127.0.0.1:8000/signup-verification/${verificationToken}?email=${validRegisterEmail}`)


                let message = { "errorCode": "yay", "content": "Your account has been created!Verify your account through the link in your email." }
                await flash.setFlash(sessionKey, message)
                res.redirect("/sign-up")
                return; 
    
    }
    let message = { "errorCode": "fail", "content": "User already exists! Use another username and make sure you are not reusing email addresses." }
        await flash.setFlash(sessionKey, message)
        res.redirect("/sign-up")
        return;  

})

router.get("/signup-verification/:verificationToken",async(req,res)=>{
    let email=req.query.email
    let verification=req.params.verificationToken
    console.log(verification)
    if(verification){
        delete req.params.verificationToken
        await business.updateUserVerification(email,true)
        let message = { "errorCode": "yay", "content": "You have now been verified!!Proceed to login with your created credentials :)" }
        res.cookie('flashData', message);
        res.redirect('/')
        return
    }

})

router.get("/forgetPassword", async (req, res) => {
    let sessionKey = req.cookies[COOKIE_NAME]
    let fMessage = await flash.getFlash(sessionKey)
    let flashStyle = 'flash-message-yay'
    if (fMessage && fMessage.errorCode === 'fail') {
        flashStyle = 'flash-message-fail'
    }

    res.render("resetPasswordRequest", {
        layout: "loginMain",
        flash: fMessage,
        style: flashStyle

    })
})


router.post("/forgetPassword", async (req, res) => {
    let sessionKey = req.cookies[COOKIE_NAME]
    let email = await business.validateEmail(req.body.email)
    if (email) {
        let token = crypto.randomUUID()
        await business.updateUserReset(email, token)

        console.log(`from:hafsa@lab.com,
                to:${email},
                subject:Your reset link,
                html:this is the link http://127.0.0.1:8000/resetPassword/${token}`)


                let message = { "errorCode": "yay", "content": "Please check your mail for the link to reset your password." }
                await flash.setFlash(sessionKey, message)
                res.redirect("/forgetPassword")
                return; 
    }
    //flash msg
    let message = { "errorCode": "fail", "content": "Invalid email." }
    await flash.setFlash(sessionKey, message)
    res.redirect("/forgetPassword")
    return; 

})

//for reset we have no session,to avoid using session and db for a minute message,cookies will be used to store
router.get('/resetPassword/:token', async (req, res) => {
    let formResetKey = req.params.token
    let user = await business.checkValidResetLink(formResetKey)
    let sessionKey = req.cookies[COOKIE_NAME]

    let fMessage=req.cookies.flashData
    res.clearCookie('flashData')
    let flashStyle = 'flash-message-yay'
    if (fMessage && fMessage.errorCode === 'fail') {
        flashStyle = 'flash-message-fail'
    }
    if (user) {
        res.render('resetPassword', {
                resetKey: formResetKey , 
                flash: fMessage,
                style: flashStyle,
                layout:"loginMain"
            })
        return
    }

    res.status(404).send("You were not sent a password link");
    return;  
    //always put this in an else block or put return after rendering
})


router.post('/resetPassword/:token', async (req, res) => {
    const { newPassword, confirm, resetKey } = req.body
    let user = await business.checkValidResetLink(resetKey)
    let validatedPassword = await business.validatePassword(newPassword)
    //i just check for one password cuz if one of them the correct format the other needs to be too else they wont match
    if (validatedPassword && validatedPassword===confirm) {

        user.password =crypto.createHash('sha256').update(validatedPassword).digest('hex')

        await business.updatePassword(resetKey, user.password)
        await business.updateUserReset(user.email, null)
        let message = { "errorCode": "yay", "content": "Hurrah! Your password got reset." }
        res.cookie('flashData', message);
        res.redirect(`/`)
        return; 

    }
    else {
        if(!validatedPassword){
            let message = { "errorCode": "fail", "content": "Please enter a valid password format of min. 8 characters and make it alphanumeric." }
            res.cookie('flashData', message);
            res.redirect(`/resetPassword/${resetKey}`)
            return

        }
        if (user.resetKey !== resetKey) {
            res.status(404).send("Page not found");
            return;  
        }
        if (newPassword !== confirm) {
            let message = { "errorCode": "fail", "content": "Please enter the same passwords in both fields!" }
            res.cookie('flashData', message);
            console.log(req.params.token)
            res.redirect(`/resetPassword/${resetKey}`)
            //using resetKey instead of token because idk why it was being weird and giving me a string literal
            return;  
        }
        return
    }
})

router.get('/logout', async (req, res) => {
    console.log(req.cookies[COOKIE_NAME])
    let sessionKey = req.cookies[COOKIE_NAME]
    await business.deleteSession(sessionKey)
    delete res.cookie.COOKIE_NAME
    let message = { "errorCode": "fail", "content": "You logged out!" }
    res.cookie('flashData', message);
    res.redirect('/')
    return
})


module.exports = router;