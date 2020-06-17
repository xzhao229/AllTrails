const express = require("express");
const router = express.Router({mergeParams: true});
const Trail = require("../models/trail");
const Review = require("../models/review");
const middleware = require("../middleware");

// Reviews Index
router.get("/", function (req, res) {
    Trail.findById(req.params.id).populate({
        path: "reviews",
        options: {sort: {createdAt: -1}} // sorting the populated reviews array to show the latest first
    }).exec((err, trail)=>{
        if (err || !trail) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        res.render("reviews/index", {trail: trail});
    });
});

// Reviews New
router.get("/new", middleware.isLoggedIn, middleware.checkReviewExistence, (req, res)=>{
    // middleware.checkReviewExistence checks if a user already reviewed the trail, only one review per user is allowed
    Trail.findById(req.params.id, function (err, trail) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        res.render("reviews/new", {trail: trail});

    });
});

// Reviews Create
router.post("/", middleware.isLoggedIn, middleware.checkReviewExistence, (req, res)=> {
    //lookup trail using ID
    Trail.findById(req.params.id).populate("reviews").exec((err, trail)=>{
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        Review.create(req.body.review, (err, review)=>{
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            //add author username/id and associated trail to the review
            review.author.id = req.user._id;
            review.author.username = req.user.username;
            review.trail = trail;
            //save review
            review.save();
            trail.reviews.push(review);
            // calculate the new average review for the trail
            trail.rating = calculateAverage(trail.reviews);
            //save trail
            trail.save();
            req.flash("success", "Your review has been successfully added.");
            res.redirect('/trails/' + trail._id);
        });
    });
});

// Reviews Edit
router.get("/:review_id/edit", middleware.checkReviewOwnership, (req, res)=>{
    Review.findById(req.params.review_id, (err, foundReview)=>{
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        res.render("reviews/edit", {trail_id: req.params.id, review: foundReview});
    });
});

// Reviews Update
router.put("/:review_id", middleware.checkReviewOwnership, (req, res)=>{
    Review.findByIdAndUpdate(req.params.review_id, req.body.review, {new: true}, (err, updatedReview)=>{
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        Trail.findById(req.params.id).populate("reviews").exec((err, trail)=>{
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            // recalculate trail average
            trail.rating = calculateAverage(trail.reviews);
            //save changes
            trail.save();
            req.flash("success", "Your review was successfully edited.");
            res.redirect('/trails/' + trail._id);
        });
    });
});

// Reviews Delete
router.delete("/:review_id", middleware.checkReviewOwnership, (req, res)=>{
    Review.findByIdAndRemove(req.params.review_id, (err)=>{
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        Trail.findByIdAndUpdate(req.params.id, {$pull: {reviews: req.params.review_id}}, {new: true}).populate("reviews").exec((err, trail)=>{
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            // recalculate campground average
            trail.rating = calculateAverage(trail.reviews);
            //save changes
            trail.save();
            req.flash("success", "Your review was deleted successfully.");
            res.redirect("/trails/" + req.params.id);
        });
    });
});

let calculateAverage =(reviews)=>{
    if (reviews.length === 0) {
        return 0;
    }
    let sum = 0;
    reviews.forEach((element)=>{
        sum += element.rating;
    });
    return sum / reviews.length;
}
module.exports = router;