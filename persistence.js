const { MongoClient } = require('mongodb')
const mongodb = require('mongodb')

const database = "Language-Exchange";

 //These are the four collections we have in our database. We can access them via indexing as needed, reducing variable names
const collections = ["UserAccounts","UserSessions","UserContacts","UserBlocked","UserMessages"]

let userAccounts = undefined; //This variable will contain the data defined in the collection userAccountCollectionName
let userSessions = undefined; //This variable will contain the data defined in the collection userSessionCollectionName
let userContacts = undefined;
let userBlocked = undefined;
let userMessages = undefined;


/**
 * Connects to the MongoDB database and initializes the collections if they are not already loaded.
 * @async
 */
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
    if(!userMessages){
        client = new MongoClient('mongodb+srv://ahmed:12class34@cluster0.jj6rj.mongodb.net/')
        await client.connect()
        userMessages = client.db(database).collection(collections[4])
    }
}

/**
 * Finds a user by their username or email.
 * @async
 * @param {string} username - The username of the user.
 * @param {string} email - The email of the user.
 * @returns {Promise<Object|null>} The user document if found, otherwise null.
 */
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

/**
 * Finds a user by their reset key.
 * @async
 * @param {string} resetKey - The reset key associated with the user.
 * @returns {Promise<Object|null>} The user document if found, otherwise null.
 */
async function findUserReset(resetKey){
    await connectDatabase()
    return await userAccounts.findOne({resetKey})
      //will reutrn a document that matches either and this function can be reused
}


/**
 * Creates a new user in the database.
 * @async
 * @param {string} username - The username of the new user.
 * @param {string} email - The email of the new user.
 * @param {string} password - The password of the new user.
 * @param {string|null} resetKey - The reset key for the user, initially null.
 * @returns {Promise<Object>} The result of the insertion operation.
 */
async function createUser(username,email,password,resetKey){
    await connectDatabase()
    return await userAccounts.insertOne({username, email, password,resetKey})
    //resetKey is always set to null after a password has been reset

}

async function updateuserInfo(username,userInfo){
    await connectDatabase();
    return await userAccounts.updateOne({username}, {$set: {userInfo}})

}

/**
 * Updates the reset key for a user.
 * @async
 * @param {string} email - The email of the user.
 * @param {string|null} resetKey - The new reset key for the user.
 * @returns {Promise<Object>} The result of the update operation.
 */
async function updateUserReset(email,resetKey){
    await connectDatabase()
    return await userAccounts.updateOne({email},{ $set:{
        "resetKey": resetKey,
    }
})
    //resetKey is always set to null after a password has been reset
}


/**
 * Updates the password for a user using their reset key.
 * @async
 * @param {string} resetKey - The reset key associated with the user.
 * @param {string} newPassword - The new password to set.
 * @returns {Promise<Object>} The result of the update operation.
 */
async function updatePassword(resetKey,newPassword){
    await connectDatabase()
    return await userAccounts.updateOne({resetKey},{ $set:{
        "password": newPassword,
    }
})
    //resetKey is always set to null after a password has been reset
}


/**
 * Updates the verification status for a user.
 * @async
 * @param {string} email - The email of the user.
 * @param {boolean} verificationStatus - The verification status to set (true/false).
 * @returns {Promise<Object>} The result of the update operation.
 */
async function updateUserVerification(email,verificationStatus){
    await connectDatabase()
    return await userAccounts.updateOne({email},{ $set:{
        "isVerified": verificationStatus,
    }
})
    //resetKey is always set to null after a password has been reset
}

/**
 * Saves a new session in the database.
 * @async
 * @param {Object} sessionData - The data for the session to be saved.
 * @returns {Promise<Object>} The result of the insertion operation.
 */
async function saveSession(sessionData) {
    await connectDatabase()
    return await userSessions.insertOne(sessionData)
}

/**
 * Updates a session's data using its session key.
 * @async
 * @param {string} sessionKey - The session key to identify the session.
 * @param {Object} data - The data to update in the session.
 * @returns {Promise<Object>} The result of the update operation.
 */
async function updateSessionData(sessionKey, data){
    await connectDatabase()
    let test = await userSessions.findOne({sessionKey});
    // test.data = data
    // console.log(test.data)
    let sessionData = await userSessions.updateOne({sessionKey}, {
        $set:{data:data.data}
    })

    return sessionData
}

/**
 * Updates the language a user is learning.
 * @async
 * @param {string} username - The username of the user.
 * @param {string} languageLearn - The new language the user is learning.
 * @returns {Promise<Object>} The result of the update operation.
 */
async function updateUserAccountLanguageLearn(username, languageLearn){
    await connectDatabase()
    return await userAccounts.updateOne({username:username}, {$set:{languageLearn:languageLearn}})
}

/**
 * Updates the language a user is fluent in.
 * @async
 * @param {string} username - The username of the user.
 * @param {string} languageFluent - The new language the user is fluent in.
 * @returns {Promise<Object>} The result of the update operation.
 */
async function updateUserAccountLanguageFluent(username, languageFluent){
    await connectDatabase()
    return await userAccounts.updateOne({username:username}, {$set:{languageFluent:languageFluent}})
}


/**
 * Retrieves session data using a session key.
 * @async
 * @param {string} sessionKey - The session key to identify the session.
 * @returns {Promise<Object|null>} The session data if found, otherwise null.
 */
async function getSessionData(sessionKey) {
    await connectDatabase()
    return await userSessions.findOne({sessionKey})
}


/**
 * Deletes a session from the database using a session key.
 * @async
 * @param {string} sessionKey - The session key to identify the session.
 * @returns {Promise<Object>} The result of the deletion operation.
 */
async function deleteSession(sessionKey){
    await connectDatabase()
    return await userSessions.deleteOne({sessionKey})
}

async function getPossibleContacts(userTargetLanguage,excludedUsername){
    await connectDatabase()
    return await userAccounts.find({
        languageFluent: { $in: userTargetLanguage }, // Check if any value from the input array exists
        username: { $ne: excludedUsername } // Exclude documents with the specified username
    }).toArray()

}

async function updateUserFriends(username, data){
    await connectDatabase()
    return await userContacts.updateOne({'username':username}, {$set:{'friends':data.friends}})
}

async function getFriends(username){
    await connectDatabase()
    return await userContacts.findOne({username:username})
}

async function updateBlockedContacts(username, blockedContact){
    await connectDatabase()
    return await userContacts.updateOne({username:username}, {$set:{blockedContact:blockedContact}})
}

async function getBlockedContacts(username){
    await connectDatabase()
    return await userContacts.findOne({username:username}, {
        projection: { blockedContact: 1,_id:0} })
}

async function createUserContacts(data){
    await connectDatabase()
    return await userContacts.insertOne(data)
}

async function insertMessages(users,messages){
    await connectDatabase();
    await userMessages.insertOne({users:users, messages:messages})
}

async function getMessages(users){
    await connectDatabase();
    let possibleUserCombinationOne = [users[0], users[1]];
    let possibleUserCombinationTwo = [users[1],users[0]]

    let messages =  await userMessages.findOne({users:possibleUserCombinationOne}) || await userMessages.findOne({users:possibleUserCombinationTwo});
    

    return messages;
}
const users = ["admin","nigesh"];
const messages = [
    "Thanks, appreciate it:nigesh",
    "Let me check and get back:admin",
    "Let me know if you need anything:nigesh",
    "Thank you for your patience:nigesh",
    "Looking forward to it:admin",
    "I'll take care of it:admin",
    "Can you confirm:nigesh",
    "Please check your email:admin",
    "Take care:admin",
    "What about you:nigesh",
    "See you soon:nigesh",
    "Hello, how are you:admin",
    "I'll update you shortly:nigesh",
    "Good morning:admin",
    "It's okay:admin",
    "I'll send it over:admin",
    "What time works for you:nigesh",
    "Sounds good to me:admin",
    "I hope you're doing well:nigesh",
    "The meeting went well:admin",
    "Any updates:nigesh",
    "No problem at all:admin",
    "Can we reschedule:nigesh",
    "I appreciate it:nigesh",
    "Let's plan for the weekend:admin",
    "How was your day:nigesh",
    "I'll let you know:admin",
    "Are we good to go:admin",
    "Goodbye for now:nigesh",
    "See you soon:admin",
    "Talk to you later:nigesh",
    "Let's meet tomorrow:admin",
    "I'll call you back:admin",
    "Let me know if you need anything:nigesh",
    "Looking forward to it:admin",
    "Thanks for your help:nigesh",
    "I'll take care of it:admin",
    "I am fine, thanks:admin",
    "Can you send me the details:nigesh",
    "What are your thoughts:nigesh",
    "It was great talking to you:admin",
    "Good evening:nigesh",
    "Don't worry:admin",
    "Take care:nigesh",
    "No worries:admin",
    "Let's discuss this further:admin",
    "It was nice meeting you:admin",
    "Could you explain that again:nigesh",
    "I'm on it:admin",
    "I am looking into it:nigesh"
];

// insertMessages(users,messages);



module.exports={
    getMessages,
    createUser,
    findUser,
    findUserReset,
    updateUserReset,
    updatePassword,
    updateUserVerification,
    getSessionData,
    saveSession,
    updateSessionData,
    updateUserAccountLanguageLearn,
    updateUserAccountLanguageFluent,
    deleteSession,
    updateuserInfo,
    getPossibleContacts,
createUserContacts,
    updateUserFriends,
    updateBlockedContacts,
    getBlockedContacts,
    getFriends
   
}