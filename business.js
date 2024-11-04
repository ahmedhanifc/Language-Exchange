//this file will be populated as project progresses
const persistence = require("./persistence.js")
const crypto = require("crypto")


async function createUser(username,email,password){

//hashPassword is done when we check for validation ,not adding salt no need to make complex rn
    return await persistence.createUser(username,email,password)
}

async function validateCredentials(username, password){

    let userCredentials = await persistence.findUser(username);
    if(userCredentials && userCredentials.username === username && userCredentials.password === crypto.createHash('sha256').update(password).digest('hex'))
        // directly check the hash of user entered password against hash stored in db
    {
        // first checking to see if userCredentials exist. If we don't do this, app will crash
        return {
            username:userCredentials.username
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
    return await sessionData

}

async function getSessionData(sessionKey) {
    let sessionData = await persistence.getSessionData(sessionKey)
    return sessionData
}

//BUSINESS RULE: 'Only unique usernames',can enable this in the db too
async function checkUsernameExistence(signupUsername,signupEmail){
    let existingUsers=await persistence.getUsers()
    for(let user of existingUsers){
        if(signupUsername===user.username || signupEmail===user.email){
            return [null,null]
            //if username exists it returns null and in presentation it'll show a coresponding error
            //in js we can return it as array or object,i chose array
        }

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



module.exports={
    createUser,
    validateCredentials,
    startSession,
    getSessionData,
    checkUsernameExistence,
    validateRegistrationCredentials
}