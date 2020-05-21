const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");

// root routes
router.get("/", (req, res)=>{
    res.render("landing")
})

// show register form
router.get("/register", function(req, res){
   res.render("register", {page:"register"});
});

//handle sign up logic
router.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash("error", err.message);
            return res.redirect("register");
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to AllTrails "+ user.username);
            res.redirect("/trails");
        });
    });
});

// show login form
router.get("/login", function(req, res){
   res.render("login",{page:"login"});
});

// handling login logic
router.post("/login", passport.authenticate("local",
    {
        successRedirect: "/trails",
        failureRedirect: "/login"
    }), function(req, res){
});

// logout route
router.get("/logout", function(req, res){
   req.logout();
   req.flash("success","Successfully logged out!");
   res.redirect("/trails");
});


module.exports = router;