const express=require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const handlebars = require('express-handlebars')
let app = express()


  // Use your router
//this will be tested in the router layers and seen if it works or not ,again this is for developing an initial understanding


//All the Routers of Our Application
const loginRouter = require("./routes/login.js")
const homeRouter = require("./routes/home.js")
const profileRouter = require("./routes/profile.js")
const contactRouter=require("./routes/contacts.js")

const testRouter = require("./routes/test.js");



app.set('views', __dirname + '/templates');
app.set('view engine', 'handlebars');
app.engine('handlebars', handlebars.engine());

app.use('/static', express.static(__dirname + '/static'));
app.use(express.urlencoded({ extended: true })); // Use Express's built-in parser for form data
app.use(express.json()); // Allows parsing of JSON
app.use(cookieParser());

app.use("/", loginRouter);
app.use("/home", homeRouter) //the home.js Router will take all routers that begin from /home
app.use("/profile", profileRouter) //the profile.js Router will take all routers that begin from /profile
app.use("/contacts", contactRouter) //the profile.js Router will take all routers that begin from /profile


app.use("/test", testRouter);


app.listen(8000, () => {
    console.log("App is running on port:", 8000)
})
