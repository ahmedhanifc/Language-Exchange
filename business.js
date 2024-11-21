//this file will be populated as project progresses
const persistence = require("./persistence.js")
const crypto = require("crypto")


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


//format validation functions for email and password
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


//will make these functions perfect later and integrate into one,for now im trying to do the functionality
function validatePassword(newPassword, confirm) {
    // Minimum 8 characters, at least one letter and one number
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (regex.test(newPassword)) {
        return newPassword
    }
    return null
}

function validateEmail(email) {
    // Simple email regex pattern
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (regex.test(email)) {
        return email
    }
    return null
}

function validateUsername(username) {
    // Regular expression to allow only alphanumeric characters, hyphens, and underscores, with a max length of 8
    const regex = /^[a-zA-Z0-9_-]{1,8}$/;
    if (regex.test(username)) {
        return username
    }
    return null
}


async function deleteSession(sessionKey) {
    return await persistence.deleteSession(sessionKey);
}


async function displayingContacts(userTargetLanguage,username) {
    let allContacts= await persistence.getPossibleContacts(userTargetLanguage,username)
    let blockedContacts=await persistence.getBlockedContacts(username)
    let friends=await persistence.getFriends(username)
   
    if(!allContacts){
        return null
    }
    if(friends){
        return allContacts.filter(
            contact => 
              !friends.includes(contact.username))
            //herei exclude freinds as well because it doesnt make sense to have friends shows in yourpossible contacts
            }
    
    if(friends && blockedContacts){
    return allContacts.filter(
        contact => 
          !blockedContacts.includes(contact.username) && !friends.includes(contact.username))
        //herei exclude freinds as well because it doesnt make sense to have friends shows in yourpossible contacts
        }

        return allContacts
    }


async function blockContact(username,blockedAccount) {
    let friends=await persistence.getFriends(username)
    let updatedFriends = friends.filter(friend => friend !== blockedAccounts);
    await persistence.updateUserFriends(username,updatedFriends)
    await persistence.updateBlockedContacts(username,blockedAccount)
    
}

async function displayingFriends(userTargetLanguage,username) {
    let allContacts= await persistence.getPossibleContacts(userTargetLanguage,username)
    let friends=await persistence.getFriends(username)
    if(!friends){
        return null
    }
    //the filter function dircetly just filters and we have to pass in a normal function to this as this will be used just once so i am using an anonymous function
    return allContacts.filter(contact => friends.includes(contact.username));

}

async function addFriend(username,friendAccount) {
    let friends=await persistence.getFriends(username)
    friends.push(friendAccount)
    await persistence.updateUserFriends(username,friends)    
}

async function removeFriend(username,unfriendAccount) {
    let friends=await persistence.getFriends(username)
    friends.filter(friend => friend !== unfriendAccount)
    await persistence.updateUserFriends(username,friends)    
}

async function createUserContacts(contactData) {
    return await persistence.createUserContacts(contactData)   
}




module.exports = {
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
    displayingFriends
}