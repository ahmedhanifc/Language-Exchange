//this file will be populated as project progresses
const persistence = require("./persistence.js")
const crypto = require("crypto")


async function createUser(username,email,password){

    // need to hash password,links to 
    //await persistence.storeHashedPassword(userPassword)
    //create separate function here for generating and concantenating salt

    return await persistence.createUser(username,email,HashedPassword)
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

async function checkUsernameExistence(signupUsername){
    //code for the sign up page acc to business rule 'Only unique usernames',can enable this in the db too
    //for (let username of user db)
    //if signupUsername===username {dont add} else{add this user to users db}
    //use of flash msg in presentation to showcase success or failure
}

module.exports={
    createUser,
    validateCredentials,
    startSession,
    getSessionData
}