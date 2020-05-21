const express = require("express");
const router = express.Router({mergeParams:true});
const Trail = require("../models/trail");
const Comment = require("../models/comment");
const middleware = require("../middleware");
// ====================
// COMMENTS ROUTES
// ====================
//comments new
router.get("/new", middleware.isLoggedIn, function(req, res){
    // find trail by id
    Trail.findById(req.params.id, function(err, trail){
        if(err){
            console.log(err);
        } else {
             res.render("comments/new", {trail: trail});
        }
    })
});

//comments create
router.post("/", middleware.isLoggedIn, function(req, res){
   //lookup trail using ID
   Trail.findById(req.params.id, function(err, trail){
       if(err){
           console.log(err);
           res.redirect("/trails");
       } else {
        Comment.create(req.body.comment, function(err, comment){
            if(err){
                req.flash("error", "Something went wrong");
                console.log(err);
            } else {
                comment.author.id = req.user._id;
                comment.author.username = req.user.username;
                comment.save();
                req.user.username
                trail.comments.push(comment);
                trail.save();
                req.flash("success","Successfully added comment");
                res.redirect('/trails/' + trail._id);
           }
        });
       }
   });
});

// COMMENT EDIT ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, (req, res)=>{
   Comment.findById(req.params.comment_id, function(err, foundComment){
      if(err){
          res.redirect("back");
      } else {
        res.render("comments/edit", {trail_id: req.params.id, comment: foundComment});
      }
   });
});

// COMMENT UPDATE
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
   Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
      if(err){
          res.redirect("back");
      } else {
          res.redirect("/trails/" + req.params.id );
      }
   });
});

// COMMENT DESTROY ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    //findByIdAndRemove
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
       if(err){
           res.redirect("back");
       } else {
           req.flash("success", "Comment deleted");
           res.redirect("/trails/" + req.params.id);
       }
    });
});

module.exports = router;