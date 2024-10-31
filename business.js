//this file will be populated as project progresses
const persistence = require("./persistence.js")
const crypto = require("crypto")


async function createUser(username,email,password){
    return await persistence.createUser(username,email,password)
}




















module.exports={
    createUser,
}