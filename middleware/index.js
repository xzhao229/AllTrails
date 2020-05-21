const Trail = require("../models/trail");
const Comment = require("../models/comment");

// all the middleare goes here
const middlewareObj = {};

middlewareObj.checkTrailOwnership = (req, res, next)=> {
    if(req.isAuthenticated()){
        Trail.findById(req.params.id, (err, foundTrail)=>{
           if(err){
               req.flash("error", "Trail not found");
               res.redirect("back");
           } else {
                if(!foundTrail){
                    req.flash("error", "Item not found.");
                    return res.redirect("back");
                }
               // does user own the Hiking trail?
                if(foundTrail.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
           }
        });
    } else {
        req.flash("error", "You need to be logged in to do that!")
        res.redirect("back");
    }
}

middlewareObj.checkCommentOwnership = (req, res, next)=>{
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, (err, foundComment)=>{
           if(err){
               res.redirect("back");
           }  else {
               // does user own the comment?
           if(foundComment.author.id.equals(req.user._id)) {
                next();
           } else {
                req.flash("error", "You don't have permission to do that!");
                res.redirect("back");
           }
           }
        });
    } else {
        req.flash("error", "You need to be logged in to do that!")
        res.redirect("back");
    }
}

middlewareObj.isLoggedIn = (req, res, next)=>{
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in to do that!");
    res.redirect("/login");
}

module.exports = middlewareObj;