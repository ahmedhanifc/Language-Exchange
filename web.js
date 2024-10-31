const express=require('express')
const business = require('./business.js')
const path = require("path")
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const handlebars = require('express-handlebars')
const urlencodedParser = bodyParser.urlencoded({extended: false})
let app = express()

//All the Routers of Our Application
const loginRouter = require("./routes/login.js")



app.set('views', __dirname + '/templates');
app.set('view engine', 'handlebars');
app.engine('handlebars', handlebars.engine());

app.use('/static', express.static(__dirname + '/static'));
app.use(express.urlencoded({ extended: true })); // Use Express's built-in parser for form data
app.use(express.json()); // Allows parsing of JSON
app.use(cookieParser());

app.use("/", loginRouter);



app.listen(8000, () => {
    console.log("App is running on port:", 8000)
})
