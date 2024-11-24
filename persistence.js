const { MongoClient } = require('mongodb')
const mongodb = require('mongodb')

const database = "Language-Exchange";

//These are the four collections we have in our database. We can access them via indexing as needed, reducing variable names
const collections = ["UserAccounts", "UserSessions", "UserContacts", "UserBlocked", "UserMessages", "UserStatistics"]

let userAccounts = undefined; //This variable will contain the data defined in the collection userAccountCollectionName
let userSessions = undefined; //This variable will contain the data defined in the collection userSessionCollectionName
let userContacts = undefined;
let userBlocked = undefined;
let userMessages = undefined;
let userStatistics = undefined;
let client= undefined;


/**
 * Connects to the MongoDB database and initializes the collections if they are not already loaded.
 * @async
 */
async function connectDatabase() {
    if (!client) {
        client = new MongoClient('mongodb+srv://ahmed:12class34@cluster0.jj6rj.mongodb.net/')
        await client.connect()
        userAccounts = client.db(database).collection(collections[0]) // loads userAccounts collection data into the variable userAccounts
        userSessions = client.db(database).collection(collections[1]) // loads userSessions collection data into the variable userAccounts
        userContacts = client.db(database).collection(collections[2])
        userBlocked = client.db(database).collection(collections[3])
        userMessages = client.db(database).collection(collections[4])
        userBadges = client.db(database).collection(collections[5])
    }
}

/**
 * Finds a user by their username or email.
 * @async
 * @param {string} username - The username of the user.
 * @param {string} email - The email of the user.
 * @returns {Promise<Object|null>} The user document if found, otherwise null.
 */
async function findUser(username, email) {
    await connectDatabase()
    return await userAccounts.findOne(({
        $or: [
            { username },
            { email },
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
async function findUserReset(resetKey) {
    await connectDatabase()
    return await userAccounts.findOne({ resetKey })
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
async function createUser(username, email, password, resetKey) {
    await connectDatabase()
    return await userAccounts.insertOne({ username, email, password, resetKey })
    //resetKey is always set to null after a password has been reset

}

/**
 * Updates the user information for a given username in the database.
 *
 * @async
 * @function updateuserInfo
 * @param {string} username - The username of the user whose information is to be updated.
 * @param {Object} userInfo - An object containing the new user information to update.
 * @returns {Promise<Object>} A promise that resolves to the result of the update operation.
 *                             This typically includes information about the matched and modified documents.
 * @throws {Error} If there is an issue with the database connection or the update operation.
 */
async function updateuserInfo(username, userInfo) {
    await connectDatabase();
    return await userAccounts.updateOne({ username }, { $set: { userInfo } })

}

/**
 * Updates the reset key for a user.
 * @async
 * @param {string} email - The email of the user.
 * @param {string|null} resetKey - The new reset key for the user.
 * @returns {Promise<Object>} The result of the update operation.
 */
async function updateUserReset(email, resetKey) {
    await connectDatabase()
    return await userAccounts.updateOne({ email }, {
        $set: {
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
async function updatePassword(resetKey, newPassword) {
    await connectDatabase()
    return await userAccounts.updateOne({ resetKey }, {
        $set: {
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
async function updateUserVerification(email, verificationStatus) {
    await connectDatabase()
    return await userAccounts.updateOne({ email }, {
        $set: {
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
async function updateSessionData(sessionKey, data) {
    await connectDatabase()
    let test = await userSessions.findOne({ sessionKey });
    let sessionData = await userSessions.updateOne({ sessionKey }, {
        $set: { data: data.data }
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
async function updateUserAccountLanguageLearn(username, languageLearn) {
    await connectDatabase()
    return await userAccounts.updateOne({ username: username }, { $set: { languageLearn: languageLearn } })
}

/**
 * Updates the language a user is fluent in.
 * @async
 * @param {string} username - The username of the user.
 * @param {string} languageFluent - The new language the user is fluent in.
 * @returns {Promise<Object>} The result of the update operation.
 */
async function updateUserAccountLanguageFluent(username, languageFluent) {
    await connectDatabase()
    return await userAccounts.updateOne({ username: username }, { $set: { languageFluent: languageFluent } })
}


/**
 * Retrieves session data using a session key.
 * @async
 * @param {string} sessionKey - The session key to identify the session.
 * @returns {Promise<Object|null>} The session data if found, otherwise null.
 */
async function getSessionData(sessionKey) {
    await connectDatabase()
    return await userSessions.findOne({ sessionKey })
}


/**
 * Deletes a session from the database using a session key.
 * @async
 * @param {string} sessionKey - The session key to identify the session.
 * @returns {Promise<Object>} The result of the deletion operation.
 */
async function deleteSession(sessionKey) {
    await connectDatabase()
    return await userSessions.deleteOne({ sessionKey })
}

/**
 * Retrieves possible contacts for a user based on target language and excluding a specific username.
 *
 * @async
 * @function getPossibleContacts
 * @param {Array<string>} userTargetLanguage - Array of target languages the user is interested in.
 * @param {string} excludedUsername - The username to exclude from the results.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of possible contact objects.
 * @throws {Error} If there is an issue with the database connection or query execution.
 */
async function getPossibleContacts(userTargetLanguage, excludedUsername) {
    await connectDatabase()
    return await userAccounts.find({
        languageFluent: { $in: userTargetLanguage }, // Check if any value from the input array exists
        username: { $ne: excludedUsername } // Exclude documents with the specified username
    }).toArray()

}

/**
 * Updates the friends list for a given user.
 *
 * @async
 * @function updateUserFriends
 * @param {string} username - The username of the user whose friends list is to be updated.
 * @param {Object} data - An object containing the updated friends list.
 * @returns {Promise<Object>} A promise that resolves to the result of the update operation.
 * @throws {Error} If there is an issue with the database connection or update operation.
 */
async function updateUserFriends(username, data) {
    await connectDatabase()
    return await userContacts.updateOne({ 'username': username }, { $set: { 'friends': data.friends } })
}

/**
 * Retrieves the friends list for a given username.
 *
 * @async
 * @function getFriends
 * @param {string} username - The username of the user.
 * @returns {Promise<Object|null>} A promise that resolves to the user's contact object or null if not found.
 * @throws {Error} If there is an issue with the database connection or query execution.
 */
async function getFriends(username) {
    await connectDatabase()
    return await userContacts.findOne({ username: username })
}

/**
 * Retrieves detailed friend objects for a list of usernames.
 *
 * @async
 * @function getFriendsAsObjects
 * @param {Array<string>} friendList - List of usernames.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of user objects.
 * @throws {Error} If there is an issue with the database connection or query execution.
 */
async function getFriendsAsObjects(friendList) {
    await connectDatabase()
    return await userAccounts.find({ username: { $in: friendList } }).toArray()
}

/**
 * Fetches blocked user accounts from the database.
 *
 * @async
 * @param {string[]} blocklist - Array of usernames to fetch.
 * @returns {Promise<Object[]>} Array of user objects matching the blocklist.
 * @throws {Error} If the database connection or query fails.
 */
async function getBlockedUsersAsObjects(blocklist) {
    await connectDatabase()
    return await userAccounts.find({ username: { $in: blocklist } }).toArray()
}

/**
 * Updates the blocked contacts for a given username.
 *
 * @async
 * @function updateBlockedContacts
 * @param {string} username - The username of the user.
 * @param {Object} data - An object containing the updated blocked contacts.
 * @returns {Promise<Object>} A promise that resolves to the result of the update operation.
 * @throws {Error} If there is an issue with the database connection or update operation.
 */
async function updateBlockedContacts(username, data) {
    await connectDatabase()
    return await userContacts.updateOne({ username: username }, { $set: { 'blockedUsers': data.blockedUsers } })
}

/**
 * Retrieves the blocked contacts for a given username.
 *
 * @async
 * @function getBlockedContacts
 * @param {string} username - The username of the user.
 * @returns {Promise<Object|null>} A promise that resolves to the user's blocked contacts or null if not found.
 * @throws {Error} If there is an issue with the database connection or query execution.
 */
async function getBlockedContacts(username) {
    await connectDatabase()
    return await userContacts.findOne({ username: username })
}

/**
 * Creates a new user contacts record.
 *
 * @async
 * @function createUserContacts
 * @param {Object} data - The contact data to be inserted.
 * @returns {Promise<Object>} A promise that resolves to the result of the insertion.
 * @throws {Error} If there is an issue with the database connection or insertion.
 */
async function createUserContacts(data) {
    await connectDatabase()
    return await userContacts.insertOne(data)
}

/**
 * Retrieves messages exchanged between two users.
 *
 * @async
 * @function getMessages
 * @param {Array<string>} users - An array of two usernames.
 * @returns {Promise<Object|null>} A promise that resolves to the messages or null if no messages are found.
 * @throws {Error} If there is an issue with the database connection or query execution.
 */
async function getMessages(users) {
    await connectDatabase();
    let possibleUserCombinationOne = [users[0], users[1]];
    let possibleUserCombinationTwo = [users[1], users[0]]

    let messages = await userMessages.findOne({ users: possibleUserCombinationOne }) || await userMessages.findOne({ users: possibleUserCombinationTwo });

    return messages;
}

/**
 * Updates the message history between two users.
 *
 * @async
 * @function updateMessage
 * @param {Array<string>} users - An array of two usernames.
 * @param {Object} message - The message object to add.
 * @returns {Promise<boolean>} A promise that resolves to `true` if the update was successful, or `false` otherwise.
 * @throws {Error} If there is an issue with the database connection or update operation.
 */
async function updateMessage(users, message) {
    await connectDatabase();
    let possibleUserCombinationOne = [users[0], users[1]];
    let possibleUserCombinationTwo = [users[1], users[0]]
    let tryRetrivalFirst = await userMessages.findOne({ users: possibleUserCombinationOne })
    if (!tryRetrivalFirst) {
        let tryRetrivalSecond = await userMessages.findOne({ users: possibleUserCombinationTwo })
        if (!tryRetrivalSecond) {
            return false;
        }
        await userMessages.updateOne({ users: possibleUserCombinationTwo }, { $push: { messages: message } });
        return true
    }
    await userMessages.updateOne({ users: possibleUserCombinationOne }, { $push: { messages: message } });
    return true;

}

/**
 * Creates a new message history between users.
 *
 * @async
 * @function createMessage
 * @param {Array<string>} users - An array of two usernames.
 * @returns {Promise<Object>} A promise that resolves to the result of the insertion.
 * @throws {Error} If there is an issue with the database connection or insertion.
 */
async function createMessage(users) {
    await connectDatabase();
    return await userMessages.insertOne({ users: users });
}

/**
 * Increments a user's statistics for a specific badge.
 *
 * @async
 * @function incrementUserStatistics
 * @param {string} username - The username of the user.
 * @param {string} badgeName - The badge to increment.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 * @throws {Error} If there is an issue with the database connection or update operation.
 */
async function incrementUserStatistics(username, badgeName) {
    await connectDatabase()
    await userBadges.updateOne(
        { username: username },
        { $inc: { [badgeName]: 1 } },
        { upsert: true }
    )
}

/**
 * Decrements a user's statistics for a specific badge.
 *
 * @async
 * @function decrementUserStatistics
 * @param {string} username - The username of the user.
 * @param {string} badgeName - The badge to decrement.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 * @throws {Error} If there is an issue with the database connection or update operation.
 */
async function decrementUserStatistics(username, badgeName) {
    await connectDatabase()
    await userBadges.updateOne(
        { username: username },
        { $inc: { [badgeName]: -1 } },
        { upsert: true }
    )
}

/**
 * Retrieves a user's statistics for a specific badge.
 *
 * @async
 * @function getUserStatistics
 * @param {string} username - The username of the user.
 * @param {string} badgeName - The badge to retrieve statistics for.
 * @returns {Promise<Object|null>} A promise that resolves to the badge statistics or null if not found.
 * @throws {Error} If there is an issue with the database connection or query execution.
 */
async function getUserStatistics(username, badgeName) {
    await connectDatabase()
    return await userBadges.findOne({ username: username }, { badgeName: badgeName });
}

module.exports = {
    decrementUserStatistics,
    getUserStatistics,
    incrementUserStatistics,
    createMessage,
    updateMessage,
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
    getFriends,
    getFriendsAsObjects,
    getBlockedUsersAsObjects

}