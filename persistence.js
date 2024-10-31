const { MongoClient } = require('mongodb')
const mongodb = require('mongodb')

const database = "Language-Exchange";

 //These are the four collections we have in our database. We can access them via indexing as needed, reducing variable names
const collections = ["UserAccounts","UserSessions","UserContacts","UserBlocked"]

let userAccounts = undefined; //This variable will contain the data defined in the collection userAccountCollectionName
let userSessions = undefined; //This variable will contain the data defined in the collection userSessionCollectionName

async function connectDatabase() {
    if (!client) {
        client = new MongoClient('mongodb+srv://ahmed:12class34@cluster0.jj6rj.mongodb.net/')
        await client.connect()
    }
}




module.exports={
    
}