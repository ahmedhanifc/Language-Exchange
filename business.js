//this file will be populated as project progresses
const persistence = require("./persistence.js")
const crypto = require("crypto")
const BadgeManagement = require("./class/BadgeManagement.js")


/**
 * Creates a new user in the system.
 * @param {string} username - The username of the user.
 * @param {string} email - The email of the user.
 * @param {string} password - The user's password.
 * @returns {Promise<Object>} The created user's data.
 */
async function createUser(username, email, password) {
    //hashPassword is done when we check for validation ,not adding salt no need to make complex rn
    return await persistence.createUser(username, email, password)
}

/**
 * Finds a user using a reset key.
 * @param {string} resetKey - The key used to identify the user's reset request.
 * @returns {Promise<Object|null>} The user data if found, otherwise null.
 */
async function findUserReset(resetKey) {
    return await persistence.findUserReset(resetKey)
}

/**
 * Updates the reset key for a user.
 * @param {string} email - The user's email.
 * @param {string} resetKey - The reset key to associate with the user.
 * @returns {Promise<void>}
 */
async function updateUserReset(email, resetKey) {
    return await persistence.updateUserReset(email, resetKey)
}

/**
 * Updates the password of a user identified by a reset key.
 * @param {string} resetKey - The reset key used to locate the user.
 * @param {string} newPassword - The new password to set.
 * @returns {Promise<void>}
 */
async function updatePassword(resetKey, newPassword) {
    return await persistence.updatePassword(resetKey, newPassword)
}


/**
 * Updates the verification status of a user.
 * @param {string} email - The user's email.
 * @param {boolean} verificationStatus - The new verification status.
 * @returns {Promise<void>}
 */
async function updateUserVerification(email, verificationStatus) {
    return await persistence.updateUserVerification(email, verificationStatus)
}


/**
 * Checks if a reset link is valid by verifying the reset key.
 * @param {string} formResetKey - The reset key from the form.
 * @returns {Promise<Object|null>} User data if the reset key is valid, otherwise null.
 */
async function checkValidResetLink(formResetKey) {
    let user = await persistence.findUserReset(formResetKey)
    if (user) {
        return user
    }
    return
}

/**
 * Validates user credentials by matching username and hashed password.
 * @param {string} username - The username of the user.
 * @param {string} password - The plain text password to validate.
 * @returns {Promise<Object|null|number>} User data if valid, null if user not found, or -1 if password is invalid.
 */
async function validateCredentials(username, password) {
    let userCredentials = await persistence.findUser(username);
    if (userCredentials && userCredentials.username === username && userCredentials.password === crypto.createHash('sha256').update(password).digest('hex'))
    // directly check the hash of user entered password against hash stored in db
    {
        console.log("isVerified:", userCredentials.isVerified);
        // first checking to see if userCredentials exist. If we don't do this, app will crash
        return {
            username: userCredentials.username,
            languageFluent: userCredentials.languageFluent,
            languageLearn: userCredentials.languageLearn,
            isVerified: userCredentials.isVerified,
            userInfo: userCredentials.userInfo
        } // no need to return password. We can add more fields as needed
    }
    else if (!userCredentials) { return null }
    else if (userCredentials.password !== crypto.createHash('sha256').update(password).digest('hex')) {
        return -1;
    }
}

/**
 * Starts a new session for a user.
 * @param {Object} data - The data to store in the session.
 * @returns {Promise<Object>} The session data including session key and expiry.
 */
async function startSession(data) {
    let sessionKey = crypto.randomUUID()
    let expiryTime = Date.now() + 1000 * 60 * 1; //5 minutes
    let sessionData = {
        sessionKey,
        expiry: new Date(expiryTime),
        data
    }
    await persistence.saveSession(sessionData)
    return sessionData
}

/**
 * Updates an existing session with new data.
 * @param {string} sessionKey - The session key to identify the session.
 * @param {Object} data - The data to update in the session.
 * @returns {Promise<void>}
 */
async function updateSessionData(sessionKey, data) {
    return await persistence.updateSessionData(sessionKey, data)
}

async function updateuserInfo(username, userInfo) {
    return await persistence.updateuserInfo(username, userInfo);

}

function getLangaugesInSystem() {


    const LANGUAGES_IN_OUR_SYSTEM = [
        { name: 'urdu', flag: '../static/flags/pakistan.png' },
        { name: 'punjabi', flag: '../static/flags/punjab.png' },
        { name: 'english', flag: '../static/flags/united-kingdom.png' },
        { name: 'arabic', flag: '../static/flags/arabic.png' },
        { name: 'german', flag: '../static/flags/germany.png' },
        { name: 'italian', flag: '../static/flags/italy.png' },
        { name: 'japanese', flag: '../static/flags/japan.png' },
        { name: 'turkish', flag: '../static/flags/turkey.png' },
        { name: 'spanish', flag: '../static/flags/spain.png' }
    ];

    return LANGUAGES_IN_OUR_SYSTEM;
}

/**
 * Generates a CSRF token for a session.
 * @param {string} sessionKey - The session key of the session.
 * @returns {Promise<string>} The generated CSRF token.
 */
async function generateFormToken(sessionKey) {
    let token = crypto.randomUUID()
    let sessionData = await persistence.getSessionData(sessionKey)
    sessionData.data.csrfToken = token
    await persistence.updateSessionData(sessionKey, sessionData)
    return token
}



async function cancelToken(sessionKey) {
    let sessionData = await persistence.getSessionData(sessionKey)
    sessionData.data.csrfToken = null
    await persistence.updateSessionData(sessionKey, sessionData)
}

/**
 * Updates the language a user wants to learn in their account.
 * @param {string} username - The user's username.
 * @param {string} languageLearn - The language the user wants to learn.
 * @returns {Promise<void>}
 */
async function updateUserAccountLanguageLearn(username, languageLearn) {
    return persistence.updateUserAccountLanguageLearn(username, languageLearn)
}

/**
 * Updates the language a user is fluent in.
 * @param {string} username - The user's username.
 * @param {string} languageFluent - The language the user is fluent in.
 * @returns {Promise<void>}
 */
async function updateUserAccountLanguageFluent(username, languageFluent) {
    return persistence.updateUserAccountLanguageFluent(username, languageFluent)
}

/**
 * Retrieves data for a session.
 * @param {string} sessionKey - The session key of the session.
 * @returns {Promise<Object|null>} The session data if found, otherwise null.
 */
async function getSessionData(sessionKey) {
    let sessionData = await persistence.getSessionData(sessionKey)
    return sessionData
}

/**
 * Checks if a username or email is already in use.
 * @param {string} signupUsername - The username to check.
 * @param {string} signupEmail - The email to check.
 * @returns {Promise<Array>} An array with null values if the username exists or the username and email if unique.
 */async function checkUsernameExistence(signupUsername, signupEmail) {
    let existingUser = await persistence.findUser(signupUsername, signupEmail)
    if (existingUser) {
        return [null, null]
        //if username exists it returns null and in presentation it'll show a coresponding error
        //in js we can return it as array or object,i chose array
    }
    return [signupUsername, signupEmail]
    //on the presentation if we get a valid unique username then we do password validation
    //use of flash msg in presentation to showcase success or failure

}


/**
 * Validates the email and password during registration.
 *
 * @function validateRegistrationCredentials
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @returns {[string|number, string|number]} An array containing the validated email and hashed password, or error codes (-1) for invalid email/password.
 * /
 */
function validateRegistrationCredentials(email, password) {
    // Regular expressions for email and password validations
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    let returnEmail = null
    let returnPassword = null

    const isEmailValid = emailRegex.test(email);
    const isPasswordValid = passwordRegex.test(password);

    if (isEmailValid && isPasswordValid) {
        //hashing password if it is valid
        let hashedPassword = crypto.createHash('sha256').update(password).digest('hex')
        return [email, hashedPassword];
    }
    if (!isEmailValid) {
        returnEmail = -1
        //to catch for flash
    } if (!isPasswordValid) {
        returnPassword = -1
        //password is not 8 char long and alphanumeric
    }

    return [returnEmail, returnPassword];
    //if both values are wrong
}


/**
 * Validates a new password.
 *
 * @function validatePassword
 * @param {string} newPassword - The new password to validate.
 * @param {string} confirm - The confirmation password.
 * @returns {string|null} The validated password or null if invalid.
 */
function validatePassword(newPassword, confirm) {
    // Minimum 8 characters, at least one letter and one number
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (regex.test(newPassword)) {
        return newPassword
    }
    return null
}

/**
 * Validates an email address.
 *
 * @function validateEmail
 * @param {string} email - The email address to validate.
 * @returns {string|null} The validated email or null if invalid.
 */
function validateEmail(email) {
    // Simple email regex pattern
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (regex.test(email)) {
        return email
    }
    return null
}

/**
 * Validates a username.
 *
 * @function validateUsername
 * @param {string} username - The username to validate.
 * @returns {string|null} The validated username or null if invalid.
 */
function validateUsername(username) {
    // Regular expression to allow only alphanumeric characters, hyphens, and underscores, with a max length of 8
    const regex = /^[a-zA-Z0-9_-]{1,8}$/;
    if (regex.test(username)) {
        return username
    }
    return null
}

/**
 * Deletes a user session.
 *
 * @async
 * @function deleteSession
 * @param {string} sessionKey - The session key to delete.
 * @returns {Promise<void>} A promise that resolves when the session is deleted.
 */
async function deleteSession(sessionKey) {
    return await persistence.deleteSession(sessionKey);
}

async function displayingBlockedContacts(username) {
    let data = await persistence.getBlockedContacts(username)
    if (data.blockedUsers.length !== 0) {
        let blockedUsers = await persistence.getBlockedUsersAsObjects(data.blockedUsers)
        return blockedUsers
    }
    return null
}

/**
 * Displays possible contacts for a user based on target languages and exclusions.
 *
 * @async
 * @function displayingContacts
 * @param {Array<string>} userTargetLanguage - The languages the user is interested in.
 * @param {string} username - The username of the current user.
 * @returns {Promise<Array<Object>|null>} A promise that resolves to an array of contacts or null if no contacts are available.
 */
async function displayingContacts(userTargetLanguage, username) {
    let allContacts = await persistence.getPossibleContacts(userTargetLanguage, username)
    let blockedContacts = await persistence.getBlockedContacts(username)

    if (allContacts.length === 0) {
        return null
    }
    for (const c of allContacts) {
        const contactData = await persistence.getFriends(c.username);
        if (contactData.blockedUsers.includes(username)) {
            allContacts = allContacts.filter(contact => contact !== c);
        }
    }

    let data = await persistence.getFriends(username)


    if (blockedContacts.blockedUsers.length !== 0 && data.friends.length !== 0) {
        return allContacts.filter(contact =>
            !blockedContacts.blockedUsers.includes(contact.username) && !data.friends.includes(contact.username))
        //herei exclude freinds as well because it doesnt make sense to have friends shows in yourpossible contacts
    }

    if (blockedContacts.blockedUsers.length !== 0) {
        return allContacts.filter(
            contact =>
                !blockedContacts.blockedUsers.includes(contact.username))
        //herei exclude freinds as well because it doesnt make sense to have friends shows in yourpossible contacts
    }

    if (data.friends.length !== 0) {
        return allContacts.filter(
            contact =>
                !data.friends.includes(contact.username))
        //herei exclude freinds as well because it doesnt make sense to have friends shows in yourpossible contacts
    }
    return allContacts
}


/**
 * Blocks a contact for the user and updates friends and blocked lists.
 *
 * @async
 * @function blockContact
 * @param {string} username - The username of the current user.
 * @param {string} blockedAccount - The username of the contact to block.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 */
async function blockContact(username, blockedAccount) {
    let data = await persistence.getFriends(username)
    let blockedData = await persistence.getFriends(blockedAccount)
    if (data.friends.length !== 0) {
        data.friends = data.friends.filter(friend => friend !== blockedAccount);
        await persistence.updateUserFriends(username, data)
    }
    if (blockedData.friends.length !== 0) {
        blockedData.friends = blockedData.friends.filter(friend => friend !== username)
        await persistence.updateUserFriends(blockedAccount, blockedData)
    }
    data.blockedUsers.push(blockedAccount)
    await persistence.updateBlockedContacts(username, data)

}

/**
 * Unblocks a contact for a user by removing them from the blocked list.
 *
 * @async
 * @param {string} username - The username of the user performing the unblock.
 * @param {string} blockedAccount - The username of the account to unblock.
 * @returns {Promise<null>} Resolves to `null` after unblocking the contact.
 * @throws {Error} If the database operation fails.
 */
async function unblockContact(username, blockedAccount) {
    let data = await persistence.getBlockedContacts(username)
    if (data.blockedUsers.length !== 0) {
        data.blockedUsers = data.blockedUsers.filter(blocked => blocked !== blockedAccount);
        await persistence.updateBlockedContacts(username, data)
    }
    return null
}

/**
 * Displays the friends of a user as detailed objects.
 *
 * @async
 * @function displayingFriends
 * @param {Array<string>} userTargetLanguage - The languages the user is interested in.
 * @param {string} username - The username of the current user.
 * @returns {Promise<Array<Object>|null>} A promise that resolves to an array of friend objects or null if no friends exist.
 */
async function displayingFriends(userTargetLanguage, username) {
    let allContacts = await persistence.getPossibleContacts(userTargetLanguage, username)
    let data = await persistence.getFriends(username)
    if (data.friends.length === 0) {
        return null
    }
    //the filter function dircetly just filters and we have to pass in a normal function to this as this will be used just once so i am using an anonymous function
    let friends = await persistence.getFriendsAsObjects(data.friends)
    return friends
}

/**
 * Adds a friend to the user's friend list.
 *
 * @async
 * @function addFriend
 * @param {string} username - The username of the current user.
 * @param {string} friendAccount - The username of the friend to add.
 * @returns {Promise<void>} A promise that resolves when the friend is added.
 */
async function addFriend(username, friendAccount) {
    let data = await persistence.getFriends(username)
    data.friends.push(friendAccount)
    await persistence.updateUserFriends(username, data)
}

/**
 * Removes a friend from the user's friend list.
 *
 * @async
 * @function removeFriend
 * @param {string} username - The username of the current user.
 * @param {string} unfriendAccount - The username of the friend to remove.
 * @returns {Promise<void>} A promise that resolves when the friend is removed.
 */
async function removeFriend(username, unfriendAccount) {
    let data = await persistence.getFriends(username)
    if (!data) {
        return null
    }
    if (data.friends.length === 0) {
        return null
    }
    //filter returns a new array does not modify the original one
    data.friends = data.friends.filter(friend => friend !== unfriendAccount);
    //each element in the array is referred to as a friend
    console.log(data)
    await persistence.updateUserFriends(username, data)
}

/**
 * Creates a new contact entry for a user.
 *
 * @async
 * @function createUserContacts
 * @param {Object} contactData - The contact data to create.
 * @returns {Promise<Object>} A promise that resolves to the created contact object.
 */
async function createUserContacts(contactData) {
    return await persistence.createUserContacts(contactData)
}

/**
 * Finds a user by username or email.
 *
 * @async
 * @function findUser
 * @param {string} username - The username of the user.
 * @param {string} email - The email of the user.
 * @returns {Promise<Object|null>} A promise that resolves to the user object or null if not found.
 */
async function findUser(username, email) {
    return await persistence.findUser(username, email)
}

/**
 * Retrieves the messages exchanged between the specified users.
 *
 * @async
 * @function getMessages
 * @param {Array<string>} users - An array of usernames representing the two users involved in the message exchange.
 * @returns {Promise<Object|null>} A promise that resolves to the messages object or null if no messages exist.
 */
async function getMessages(users) {
    let messages = await persistence.getMessages(users);
    return messages
}

/**
 * Updates the messages between the specified users.
 *
 * @async
 * @function updateMessage
 * @param {Array<string>} users - An array of usernames representing the two users.
 * @param {Object} message - The message object to add.
 * @returns {Promise<boolean>} A promise that resolves to true if the update is successful, otherwise false.
 */
async function updateMessage(users, message) {
    return await persistence.updateMessage(users, message)
}

/**
 * Creates a new message exchange between two users.
 *
 * @async
 * @function createMessage
 * @param {Array<string>} users - An array of usernames representing the two users involved in the conversation.
 * @returns {Promise<Object>} A promise that resolves to the created message object.
 */
async function createMessage(users) {
    return await persistence.createMessage(users)
}

/**
 * Sets the currently visited user in the session data.
 *
 * @async
 * @function setVisitedUser
 * @param {string} sessionKey - The session key for the user's session.
 * @param {string} visitedUser - The username of the visited user to set.
 * @returns {Promise<Object>} A promise that resolves to the updated session data object.
 */
async function setVisitedUser(sessionKey, visitedUser) {
    let sessionData = await persistence.getSessionData(sessionKey)
    sessionData.data.visitedUser = visitedUser
    return await persistence.updateSessionData(sessionKey, sessionData)
}

/**
 * Retrieves and clears the currently visited user from the session data.
 *
 * @async
 * @function getVisitedUser
 * @param {string} sessionKey - The session key for the user's session.
 * @returns {Promise<string|null>} A promise that resolves to the visited user's username or null if not found.
 */

async function getVisitedUser(sessionKey) {
    let sessionData = await persistence.getSessionData(sessionKey)
    if (!sessionData) {
        return null
    }
    let visitedUser = sessionData.data.visitedUser
    delete sessionData.data.visitedUser
    await persistence.updateSessionData(sessionKey, sessionData)
    return visitedUser
}

/**
 * Increments the user's statistics for a specific badge.
 *
 * @async
 * @function incrementUserStatistics
 * @param {string} user - The username of the user.
 * @param {string} badgeName - The name of the badge to increment.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 */
async function incrementUserStatistics(user, badgeName) {
    return await persistence.incrementUserStatistics(user, badgeName)
}

/**
 * Decrements the user's statistics for a specific badge.
 *
 * @async
 * @function decrementUserStatistics
 * @param {string} user - The username of the user.
 * @param {string} badgeName - The name of the badge to decrement.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 */
async function decrementUserStatistics(user, badgeName) {
    return await persistence.decrementUserStatistics(user, badgeName)
}

/**
 * Retrieves the user's statistics for a specific badge.
 *
 * @async
 * @function getUserStatistics
 * @param {string} user - The username of the user.
 * @param {string} badgeName - The name of the badge to retrieve statistics for.
 * @returns {Promise<Object|null>} A promise that resolves to the badge statistics object or null if not found.
 */
async function getUserStatistics(user, badgeName) {
    return await persistence.getUserStatistics(user, badgeName)
}

/**
 * Manages the user's badges based on their current statistics.
 *
 * @async
 * @function manageUserBadges
 * @param {string} username - The username of the user.
 * @returns {Promise<void>} A promise that resolves when badge management is complete.
 */
async function manageUserBadges(username) {
    BadgeManagement.createBadge(
        name = "Bilingual", description = "Learn Two Langauges", target = 2, completedImageName = "trophy.png", incompletedImageName = "trophy_blackAndWhite.png"
    )
    BadgeManagement.createBadge("100 Messages Sent", "Total messages sent reaches 100", 100, "adventure.png", "adventure_blackAndWhite.png");
    BadgeManagement.createBadge("First Conversation", "Message sent and a reply received", 1, "grapeSoda.png", "grapeSoda_blackAndWhite.png");

    let userStatistics = await getUserStatistics(username)
    BadgeManagement.getBadges()["Bilingual"].updateFeature(userStatistics["languageLearn"]);
    BadgeManagement.getBadges()["100 Messages Sent"].updateFeature(userStatistics["messagesSent"])

    let firstConversationCondition = (userStatistics["messagesSent"] >= 1 && userStatistics["messagesReceived"] >= 1);
    BadgeManagement.getBadges()["First Conversation"].conditionMet(firstConversationCondition)
}

/*async function getNationalities(){
    return await persistence.getNationalities();
}*/

/**
 * Retrieves all completed badges for a user.
 *
 * @async
 * @param {string} username - The username of the user.
 * @returns {Promise<Object>} An object containing the user's completed badges.
 * @throws {Error} If badge management or retrieval fails.
 */
async function getCompletedBadges(username) {
    await manageUserBadges(username);

    const allBadges = BadgeManagement.getBadges()
    const completedBadges = {}
    for (badgeName of Object.keys(allBadges)) {
        if (allBadges[badgeName].completed) {
            completedBadges[badgeName] = allBadges[badgeName]
        }
    }
    return completedBadges
}



module.exports = {
    getCompletedBadges,
    decrementUserStatistics,
    getUserStatistics,
    incrementUserStatistics,
    getVisitedUser,
    setVisitedUser,
    createMessage,
    updateMessage,
    getMessages,
    findUser,
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
    updateSessionData,
    validateEmail,
    validatePassword,
    validateUsername,
    updateUserAccountLanguageLearn,
    updateUserAccountLanguageFluent,
    deleteSession,
    generateFormToken,
    updateuserInfo,
    getLangaugesInSystem,
    displayingContacts,
    blockContact,
    addFriend,
    removeFriend,
    createUserContacts,
    displayingFriends,
    manageUserBadges,
    cancelToken,
    generateFormToken,
    displayingBlockedContacts,
    unblockContact
}