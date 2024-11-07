const express = require('express');
const router = express.Router();
const business = require("../business")
const COOKIE_NAME = "session"
const flash = require("../flash_msgs")

/*where are we gonna check for sessions then? for now im adding the module for sessions here,also we are going to need to figure out how to 
access session across different files as flash messages require the deletion of a pseudo-session storage */

// "/" path will render the home page.
router.get("/", async (req, res) => {
    let sessionKey = req.cookies[COOKIE_NAME];
    let sessionData = await business.getSessionData(sessionKey)
    if (!sessionData) {
        let data = {
            username: null,
            languageLearn: null,
            languageFluent: null,
            csrfToken: null,
            flashData: 0
        }
    sessionData = await business.startSession(data);
    res.cookie(
        "session",
        sessionData.sessionKey,
        { maxAge: sessionData.expiry }
    )
    }

    //What is the information we need to know for the login page of the user? 
    //1) Check if the cookie is present in the browser. if a cookie is present and is valid, then automatically log user in
    res.render("login", {
        layout: undefined
    })
    return;
});

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
            res.redirect("/?errorCode=username wrong or does not exist")
            return
        }
        if (userCredentials === -1) {
            // How to implement flash messages here?
            res.redirect("/?errorCode=invalid/wrong password")
            return
        }

        if (!sessionData) {
            //flash message here saying u dont have a valid session something
            res.redirect("/")
            return;
        }

        //we updated it session here as the user has correct credentials,now the attributes will not be null anymore
        await business.updateSession(sessionKey, userCredentials);

        if (userCredentials.username) {
            //this whole chunk of code only executes if a username exists/for valid users else the login page gets rendered again

            if (!userCredentials.languageFluent || !userCredentials.languageLearn) {
                res.redirect("/home/welcome")
                return
            }
            else if (userCredentials.languageFluent.length === 0 || userCredentials.languageFluent.length === 0) {
                res.redirect("/home/welcome")
                return
            }
            else {
                res.redirect("/home")
                return
            }
        }
    }
    /*we getflash right before rendering because by this point we will have hit one of the conditions if credentials wrong,so it will show the condition that is the most recent
    and then delete it */
    let fMessage = await flash.getFlash(sessionKey)
    let flashStyle = 'flash-message-yay'
    if (fMessage && fMessage.errorCode === 'fail') {
        flashStyle = 'flash-message-fail'
    }
    res.render("login", {
        layout: undefined,
        flash: fMessage,
        style: flashStyle
    })
})

router.get("/sign-up", (req, res) => {
    res.render("register", {
        layout: undefined,

    })
})


//need to implement csrf token here most importantly, will see where to put it tomorrow,will also add the functionality for flash messages

router.post("/sign-up", async (req, res) => {
    const { username, email, password, repeatedPassword } = req.body

    if (!username || !email || !password || !repeatedPassword) {
        //for now if user isnt succesful we redirect to same page with a flash message
        res.redirect('/sign-up?error=field(s) are empty')
        return
    }

    if (password !== repeatedPassword) {
        res.redirect('/sign-up?error=passwords do not match');
        return;
    }

    let [formatEmail, formatPassword] = business.validateRegistrationCredentials(email, password);
    /*this double assignment works as array or object,also the format password returns a hashed password if it is valid and
    that is what is stored in the db*/

    console.log(formatEmail, 'space', formatPassword)
    if (formatEmail === -1 && formatPassword === -1) {
        res.redirect('/sign-up?error=password & email invalid form');
        return;
    }
    if (formatEmail === -1) {
        res.redirect('/sign-up?error= email invalid form');
        return;
    }
    if (formatPassword === -1) {
        res.redirect('/sign-up?error= password invalid form');
        return;
    }
    let [validRegisterName, validRegisterEmail] = await business.checkUsernameExistence(username, formatEmail)
    //this function returns the username if it doesnt exist already in the db and heck for email in next commit  
    console.log(validRegisterEmail, ' register in db ', validRegisterName)

    if (validRegisterEmail && validRegisterName) {
        await business.createUser(validRegisterName, validRegisterEmail, formatPassword, null)
        //the null is for the resettoken attribute by default
        res.redirect("/home/welcome")
        return
    }
    res.redirect('/sign-up?error= user could not be created as user already exists');
    return;

})


router.get("/forgetPassword", async (req, res) => {
    res.render("forgetPassword", {
        layout: undefined
    })
})


router.post("/forgetPassword", async (req, res) => {

    let email = await business.validateEmail(req.body.email)
    if (email) {
        let token = crypto.randomUUID()
        await business.updateUserReset(email, token)

        console.log(`from:hafsa@lab.com,
                to:${email},
                subject:Your reset link,
                html:this is the link http://127.0.0.1:8000/resetPassword/${token}`)


        res.redirect("/forgetPassword?msg=check ur mail")
        return
    }
    //flash msg
    res.redirect("/forgetPassword?msg=cwrite a proper email")


})

router.get('/resetPassword/:token', async (req, res) => {
    let formResetKey = req.params.token
    let user = await business.checkValidResetLink(formResetKey)
    if (user) {
        res.render('resetPassword',
            { resetKey: formResetKey })
        return
    }

    res.redirect('/?message=Your token is wrong or no such user exists')
    return
    //always put this in an else block or put return after rendering
})


router.post('/resetPassword/:token', async (req, res) => {
    const { newPassword, confirm, resetKey } = req.body
    let user = await business.checkValidResetLink(resetKey)
    let validatedPassword = await business.validatePassword(newPassword, confirm)
    //i just check for one password cuz if one of them the correct format the other needs to be too else they wont match
    if (validatedPassword) {

        user.password = validatedPassword
        await business.updatePassword(resetKey, user.password)
        await business.updateUserReset(user.email, null)
        res.redirect('/?message=succesful login')
        return

    }
    else {
        if (user.resetKey !== resetKey) {
            //flash for someone else trying to attack
            res.send('attack')
            return
        }
        if (newPassword !== confirm) {
            //flash for not same passwords
            res.send('not same ps')
            return
        }
        await business.updateUserReset(user.email, null)
        console.log('check db')
        res.redirect('/?message=not valid password')
        return
    }
})


module.exports = router;