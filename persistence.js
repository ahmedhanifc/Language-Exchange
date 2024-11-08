const { MongoClient } = require('mongodb')
const mongodb = require('mongodb')

const database = "Language-Exchange";

 //These are the four collections we have in our database. We can access them via indexing as needed, reducing variable names
const collections = ["UserAccounts","UserSessions","UserContacts","UserBlocked"]

let userAccounts = undefined; //This variable will contain the data defined in the collection userAccountCollectionName
let userSessions = undefined; //This variable will contain the data defined in the collection userSessionCollectionName
let userContacts = undefined;
let userBlocked = undefined;


// also need to write jsdocs.app
async function connectDatabase() {
    if (!userAccounts) {
        client = new MongoClient('mongodb+srv://ahmed:12class34@cluster0.jj6rj.mongodb.net/')
        await client.connect()
        userAccounts = client.db(database).collection(collections[0]) // loads userAccounts collection data into the variable userAccounts
    }
    if(!userSessions) {
        client = new MongoClient('mongodb+srv://ahmed:12class34@cluster0.jj6rj.mongodb.net/')
        await client.connect()
        userSessions = client.db(database).collection(collections[1]) // loads userSessions collection data into the variable userAccounts
    }
    if(!userContacts) {
        client = new MongoClient('mongodb+srv://ahmed:12class34@cluster0.jj6rj.mongodb.net/')
        await client.connect()
        userContacts = client.db(database).collection(collections[2]) 
    }
    if(!userBlocked) {
        client = new MongoClient('mongodb+srv://ahmed:12class34@cluster0.jj6rj.mongodb.net/')
        await client.connect()
        userBlocked = client.db(database).collection(collections[3])
    }
}

async function findUser(username,email){
    await connectDatabase()
    return await userAccounts.findOne(({ 
        $or: [
          { username},
          { email},
        ]
      }))
      //will reutrn a document that matches either and this function can be reused
}

async function findUserReset(resetKey){
    await connectDatabase()
    return await userAccounts.findOne({resetKey})
      //will reutrn a document that matches either and this function can be reused
}



async function createUser(username,email,password,resetKey){
    await connectDatabase()
    return await userAccounts.insertOne({username, email, password,resetKey})
    //resetKey is always set to null after a password has been reset

}

async function updateUserReset(email,resetKey){
    await connectDatabase()
    return await userAccounts.updateOne({email},{ $set:{
        "resetKey": resetKey,
    }
})
    //resetKey is always set to null after a password has been reset
}


async function updatePassword(resetKey,newPassword){
    await connectDatabase()
    return await userAccounts.updateOne({resetKey},{ $set:{
        "password": newPassword,
    }
})
    //resetKey is always set to null after a password has been reset
}

async function updateUserVerification(email,verificationStatus){
    await connectDatabase()
    return await userAccounts.updateOne({email},{ $set:{
        "isVerified": verificationStatus,
    }
})
    //resetKey is always set to null after a password has been reset
}

async function saveSession(sessionData) {
    await connectDatabase()
    return await userSessions.insertOne(sessionData)
}

async function updateSession(sessionKey, data){
    await connectDatabase()
    let sessionData = await userSessions.updateOne({sessionKey}, {
        $set:{
            "data.username": data.data.username,
            "data.languageLearn":data.data.languageLearn,
            "data.languageFluent":data.data.languageFluent,
            "data.csrfToken":data.data.csrfToken,
            "data.flashData":data.data.flashData
        }
    })

    return sessionData
}

async function updateUserAccountLanguageLearn(username, languageLearn){
    await connectDatabase()
    return await userAccounts.updateOne({username:username}, {$set:{languageLearn:languageLearn}})
}

async function updateUserAccountLanguageFluent(username, languageFluent){
    await connectDatabase()
    return await userAccounts.updateOne({username:username}, {$set:{languageFluent:languageFluent}})
}

async function getSessionData(sessionKey) {
    await connectDatabase()
    return await userSessions.findOne({sessionKey})
}

async function deleteSession(sessionKey){
    await connectDatabase()
    return await userSessions.deleteOne({sessionKey})
}


module.exports={
    createUser,
    findUser,
    findUserReset,
    updateUserReset,
    updatePassword,
    updateUserVerification,
    getSessionData,
    saveSession,
    updateSession,
    updateUserAccountLanguageLearn,
    updateUserAccountLanguageFluent,
    deleteSession
   
}