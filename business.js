//this file will be populated as project progresses
const persistence = require("./persistence.js")
const crypto = require("crypto")


async function createUser(username,email,password){

//hashPassword is done when we check for validation ,not adding salt no need to make complex rn
    return await persistence.createUser(username,email,password)
}

async function findUserReset(resetKey){
    return await persistence.findUserReset(resetKey)
}

async function updateUserReset(email,resetKey) {
    return await persistence.updateUserReset(email,resetKey)
    
}

async function updatePassword(resetKey,newPassword) {
    return await persistence.updatePassword(resetKey,newPassword)
    
}

async function updateUserVerification(email,verificationStatus) {
    return await persistence.updateUserVerification(email,verificationStatus)
    
}


async function checkValidResetLink(formResetKey) {
    let user=await persistence.findUserReset(formResetKey)
    if(user){
        return user
    } 
    return  
}


async function validateCredentials(username, password){

    let userCredentials = await persistence.findUser(username);

    if(userCredentials && userCredentials.username === username && userCredentials.password === crypto.createHash('sha256').update(password).digest('hex'))
        // directly check the hash of user entered password against hash stored in db
    {
        console.log("isVerified:", userCredentials.isVerified);

        // first checking to see if userCredentials exist. If we don't do this, app will crash
        return {
            username:userCredentials.username,
            languageFluent:userCredentials.languageFluent,
            languageLearn:userCredentials.languageLearn,
            isVerified:userCredentials.isVerified
        } // no need to return password. We can add more fields as needed
    }
    else if(!userCredentials)
        {return null}
    else if(userCredentials.password !== crypto.createHash('sha256').update(password).digest('hex')){
        return -1;
    }
}

async function startSession(data) {
    let sessionKey = crypto.randomUUID()
    let expiryTime = Date.now() + 1000 * 60 * 1; //5 minutes
    let sessionData = {
        sessionKey,
        expiry: new Date(expiryTime), 
        data
    }
    await persistence.saveSession(sessionData)
    return  sessionData

}

async function updateSession(sessionKey,data){
    return await persistence.updateSession(sessionKey,data)
}

async function generateFormToken(sessionKey) {
    let token = crypto.randomUUID()
    let sessionData = await persistence.getSessionData(sessionKey)
    sessionData.data.csrfToken = token
    await persistence.updateSession(sessionKey,sessionData)
    return token
}

async function updateUserAccountLanguageLearn(username, languageLearn){
    return persistence.updateUserAccountLanguageLearn(username, languageLearn)
}

async function updateUserAccountLanguageFluent(username, languageFluent){
    return persistence.updateUserAccountLanguageFluent(username, languageFluent)
}

async function getSessionData(sessionKey) {
    let sessionData = await persistence.getSessionData(sessionKey)
    return sessionData
}

//BUSINESS RULE: 'Only unique usernames',can enable this in the db too
async function checkUsernameExistence(signupUsername,signupEmail){
    let existingUser=await persistence.findUser(signupUsername,signupEmail)
        if(existingUser){
            return [null,null]
            //if username exists it returns null and in presentation it'll show a coresponding error
            //in js we can return it as array or object,i chose array
        }

    

    return [signupUsername,signupEmail]
    //on the presentation if we get a valid unique username then we do password validation
    //use of flash msg in presentation to showcase success or failure

}


//format validation functions for email and password
function validateRegistrationCredentials(email, password) {
    // Regular expressions for email and password validations
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    let returnEmail=null
    let returnPassword=null
  
    const isEmailValid = emailRegex.test(email);
    const isPasswordValid = passwordRegex.test(password);
  
    if (isEmailValid && isPasswordValid) {
        //hashing password if it is valid
        let hashedPassword=crypto.createHash('sha256').update(password).digest('hex')
        return [ email, hashedPassword ];
    }
     if(!isEmailValid){
        returnEmail=-1
        //to catch for flash
    } if(!isPasswordValid){
        returnPassword=-1
        //password is not 8 char long and alphanumeric
    }
  
    return [returnEmail,returnPassword];
    //if both values are wrong
  }


//will make these functions perfect later and integrate into one,for now im trying to do the functionality
function validatePassword(newPassword,confirm) {
    // Minimum 8 characters, at least one letter and one number
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if(regex.test(newPassword)){
        return newPassword
    }
    return null
  }

  function validateEmail(email) {
    // Simple email regex pattern
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if(regex.test(email)){
        return email
    }
    return null  }

    function validateUsername(username) {
        // Regular expression to allow only alphanumeric characters, hyphens, and underscores, with a max length of 8
        const regex = /^[a-zA-Z0-9_-]{1,8}$/;
        if(regex.test(username)){
            return username
        }
        return null  }
    


async function deleteSession(sessionKey){
    return await persistence.deleteSession(sessionKey);
}

  

module.exports={
    createUser,
    updateUserReset,
    updateUserVerification,
    findUserReset,
    updatePassword,
    checkValidResetLink,
    validateCredentials,
    startSession,
    getSessionData,
    checkUsernameExistence,
    validateRegistrationCredentials,
    updateSession,
    validateEmail,
    validatePassword,
    validateUsername,
    updateUserAccountLanguageLearn,
    updateUserAccountLanguageFluent,
    deleteSession,
    generateFormToken
}