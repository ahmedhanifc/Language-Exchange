//this file will be populated as project progresses
const persistence = require("./persistence.js")
const crypto = require("crypto")


async function createUser(username,email,password){

    // need to hash password,links to 
    //await persistence.storeHashedPassword(userPassword)
    //create separate function here for generating and concantenating salt
//hashPassword
    return await persistence.createUser(username,email,password)
}

async function validateCredentials(username, password){

    //need to verify hashed passwords. I can implement something but i thought you'd be
    // more interested in this since yk, crypto
    // I will just get the basic skeleton going because I want to more forward with the application
    let userCredentials = await persistence.findUser(username);
    if(userCredentials && userCredentials.username === username && userCredentials.password === password){
        // first checking to see if userCredentials exist. If we don't do this, app will crash
        return {
            username:userCredentials.username
        } // no need to return password. We can add more fields as needed
    }
    else{
        return null;
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

async function getSessionData(key) {
    let sessionData = await persistence.getSessionData(key)
    return sessionData
}

//BUSINESS RULE: 'Only unique usernames',can enable this in the db too
async function checkUsernameExistence(signupUsername,signupEmail){
    let existingUsers=await persistence.getUsers()
    for(let user of existingUsers){
        if(signupUsername===user.username || signupEmail===user.email){
            return null
            //if username exists it returns null and in presentation it'll show a coresponding error
        }

    }

    return signupUsername
    //on the presentation if we get a valid unique username then we do password validation
    //use of flash msg in presentation to showcase success or failure

}

module.exports={
    createUser,
    validateCredentials,
    startSession,
    getSessionData,
    checkUsernameExistence
}