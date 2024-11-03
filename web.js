const express=require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const handlebars = require('express-handlebars')
let app = express()

//will add for testing through the main web.js if we can implement flash messages and its category wise template functions,which approach works?
const session = require('express-session');
const flash = require('connect-flash');

// Set up session middleware
app.use(
    session({
      secret: 'your_secret_key',
      resave: false,
      saveUninitialized: true,
    })
    
  );
  
  // Set up connect-flash middleware
  app.use(flash());
  
  // Middleware to pass flash messages to views
  app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success');
    res.locals.error_msg = req.flash('error');
    next();
  });
  
  // Use your router
//this will be tested in the router layers and seen if it works or not ,again this is for developing an initial understanding


//All the Routers of Our Application
const loginRouter = require("./routes/login.js")
const homeRouter = require("./routes/home.js")



app.set('views', __dirname + '/templates');
app.set('view engine', 'handlebars');
app.engine('handlebars', handlebars.engine());

app.use('/static', express.static(__dirname + '/static'));
app.use(express.urlencoded({ extended: true })); // Use Express's built-in parser for form data
app.use(express.json()); // Allows parsing of JSON
app.use(cookieParser());

app.use("/", loginRouter);
app.use("/", homeRouter) //the home.js Router will take all routers that begin from /home
//only a / here not /home


app.listen(8000, () => {
    console.log("App is running on port:", 8000)
})
