require("dotenv").config()
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const passport = require("passport");
const LocalStrategy = require("passport-local");
const methodOverride = require("method-override");
const User = require("./models/user");
const flash = require("connect-flash");

//requiring routes
const reviewRoutes  = require("./routes/reviews");
const commentRoutes = require("./routes/comments");
const trailRoutes = require("./routes/trails");
const indexRoutes = require("./routes/index");

//db connectionm
const port = 3000;
const MONGO_URI = process.env.MONGO_URI;
app.use(bodyParser.urlencoded({extend:true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
mongoose.connect(
    MONGO_URI,{
    useNewUrlParser: true,
    useUnifiedTopology: true
    })
.then(() => console.log('DB Connected'));

mongoose.connection.on('error', err => {
  console.log(`DB connection error: ${err.message}`)
});


app.locals.moment = require("moment");
//Passport Configuration

app.use(require("express-session")({
    secret: "WebApplication",
    resave: false,
    saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// middleware
app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});

app.use("/", indexRoutes);
app.use("/trails", trailRoutes);
app.use("/trails/:id/comments", commentRoutes);
app.use("/trails/:id/reviews", reviewRoutes);

app.listen(port, ()=>{
    console.log ("AllTrails server has started")
});