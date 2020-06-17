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
middlewareObj.checkReviewOwnership = (req, res, next)=>{
    if(req.isAuthenticated()){
        Review.findById(req.params.review_id, (err, foundReview)=>{
            if(err || !foundReview){
                res.redirect("back");
            }  else {
                // does user own the comment?
                if(foundReview.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};

middlewareObj.checkReviewExistence = (req, res, next)=>{
    if (req.isAuthenticated()) {
        Trail.findById(req.params.id).populate("reviews").exec((err, foundTrail)=>{
            if (err || !foundTrail) {
                req.flash("error", "Trail not found.");
                res.redirect("back");
            } else {
                // check if req.user._id exists in foundTrail.reviews
                var foundUserReview = foundTrail.reviews.some((review)=>{
                    return review.author.id.equals(req.user._id);
                });
                if (foundUserReview) {
                    req.flash("error", "You already wrote a review.");
                    return res.redirect("/trails/" + foundTrail._id);
                }
                // if the review was not found, go to the next middleware
                next();
            }
        });
    } else {
        req.flash("error", "You need to login first.");
        res.redirect("back");
    }
};

middlewareObj.isLoggedIn = (req, res, next)=>{
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in to do that!");
    res.redirect("/login");
}

module.exports = middlewareObj;