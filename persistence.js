const { MongoClient } = require('mongodb')
const mongodb = require('mongodb')

const databaseName = "Language-Exchange";
const userAccountsCollectionName = "UserAccounts"
const userSessionCollectionName = "UserSessions"

let userAccounts = undefined; //This variable will contain the data defined in the collection userAccountCollectionName
let userSessions = undefined; //This variable will contain the data defined in the collection userSessionCollectionName

async function connectDatabase() {
    if (!client) {
        client = new MongoClient('mongodb+srv://ahmed:12class34@cluster0.jj6rj.mongodb.net/')
        await client.connect()
    }
}