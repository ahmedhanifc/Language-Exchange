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

async function findUser(username){
    await connectDatabase()
    return await userAccounts.findOne({username})
}

//function to get users to check for existing users
async function getUsers(){
    await connectDatabase()
    return await userAccounts.find().toArray()

}



async function createUser(username,email,password,resetKey){
    await connectDatabase()
    return await userAccounts.insertOne({username, email, password,resetKey})
    //resetKey is always set to null after a password has been reset

}

async function saveSession(sessionData) {
    await connectDatabase()
    return await userSessions.insertOne(sessionData)
}

async function getSessionData(sessionKey) {
    await connectDatabase()
    return await userSessions.findOne({sessionKey})
}

async function storeHashedPassword(userPassword){
    //need to store the salt alongwith the hashed password
    //the salt will be concantenated to the hash to check for validity wihtin the business layer
    //prolly will integrate this function into the createUSer but for now it gets coded separately to test
}

module.exports={
    createUser,
    findUser,
    getSessionData,
    saveSession,
    storeHashedPassword,
    getUsers
    
}