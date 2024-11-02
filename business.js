//this file will be populated as project progresses
const persistence = require("./persistence.js")
const crypto = require("crypto")


async function createUser(username,email,password){

    // need to hash password
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


module.exports={
    createUser,
    validateCredentials,
    startSession,
    getSessionData
}