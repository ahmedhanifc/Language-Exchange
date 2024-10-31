const express=require('express')
const business = require('./business.js')
const path = require("path")
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const handlebars = require('express-handlebars')
let app = express()

app.set('views', __dirname+"/templates")
app.set('view engine', 'handlebars')
app.engine('handlebars', handlebars.engine())

app.use('/static', express.static(__dirname+"/static"))
app.use(bodyParser.urlencoded())
app.use(cookieParser())


// "/" path will render the home page.
app.get("/", (req, res) => {
    res.render("login", {
        layout:undefined
    })
});

app.post("/", (req,res) => {
    res.send("Hello")
})


app.listen(8001, () => {
    console.log("App is running on port:", 8001)
})
