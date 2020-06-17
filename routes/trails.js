const express = require("express");
const router = express.Router();
const Trail = require("../models/trail");
const Review = require("../models/review");
const middleware = require("../middleware");
const NodeGeocoder = require('node-geocoder');




const options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};

var geocoder = NodeGeocoder(options);
//trail shows all
router.get("/", (req, res)=>{
    // Get all trails from DB
    Trail.find({}, (err, alltrails)=>{
       if(err){
           console.log(err);
       } else {
          res.render("trails/trails",{trails: alltrails, page: "trails"});
       }
    });
});

//create routes
router.post("/", middleware.isLoggedIn, (req, res)=>{
    // get data from form and add to trails array
    const name = req.body.name;
    const image = req.body.image;
    const desc = req.body.description;
    const price = req.body.price;
    const author = {
        id: req.user._id,
        username: req.user.username
    }

    geocoder.geocode(req.body.location, function (err, data) {
        if (err || !data.length) {
            req.flash('error', 'Invalid address');
            return res.redirect('back');
        }
        const lat = data[0].latitude;
        const lng = data[0].longitude;
        const location = data[0].formattedAddress;
        const newTrail = {
            name: name, price:price,
            image: image, description: desc,
            author:author,
            location: location,
            lat: lat,
            lng: lng};
        // Create a new trails and save to DB
        Trail.create(newTrail, (err, newlyCreated)=>{
            if(err){
                console.log(err);
            } else {
                //redirect back to trails page
                res.redirect("/trails");
            }
        });
    });
});

//RESTFUL api for showing form and send data to post routes
router.get("/new", middleware.isLoggedIn, (req, res)=>{
    res.render("trails/new")
});


//show routes
router.get("/:id", (req, res)=>{
    //find the trail with provided ID
    Trail.findById(req.params.id).populate("comments").populate({
        path:"review",
        options:{sort: {
            createdAt: -1}}
        }).exec((err, foundTrail)=>{
        if(err){
            console.log(err);
        } else {
            //render show template with that Trail
            res.render("trails/show", {trail: foundTrail});
        }
    });
});

// edit trails
router.get("/:id/edit", middleware.checkTrailOwnership, (req, res)=>{
    Trail.findById(req.params.id, (err, foundTrail)=>{
        res.render("trails/edit", {trail: foundTrail});
    });
});
// update trail route
router.put("/:id",middleware.checkTrailOwnership, (req, res)=>{
    // find and update the correct trail
    geocoder.geocode(req.body.location, (err, data)=>{
        if (err || !data.length) {
          req.flash('error', 'Invalid address');
          return res.redirect('back');
        }
        req.body.trail.lat = data[0].latitude;
        req.body.trail.lng = data[0].longitude;
        req.body.trail.location = data[0].formattedAddress;
        Trail.findByIdAndUpdate(req.params.id, req.body.trail, (err, updatedTrail)=>{
            if(err){
                req.flash("error", err.message);
                res.redirect("back");
            } else {
                req.flash("success","Successfully Updated!");
                res.redirect("/trails/" + req.params.id);
            }
        });
    });
});

// DESTROY TRAIL ROUTE
router.delete("/:id",middleware.checkTrailOwnership, (req, res)=>{
   Trail.findByIdAndRemove(req.params.id, (err, trail)=>{
      if(err){
          res.redirect("/trails");
      } else {
          Comment.remove({"_id": {$in: trail.comments}}, function (err) {
              if (err) {
                  console.log(err);
                  return res.redirect("/campgrounds");
              }
              // deletes all reviews associated with the campground
              Review.remove({"_id": {$in: trail.reviews}}, function (err) {
                  if (err) {
                      console.log(err);
                      return res.redirect("/trails");
                  }
                  //  delete the campground
                  trail.remove();
                  req.flash("success", "Trail deleted successfully!");
                  res.redirect("/trails");
              });
            });
      }
   });
});

module.exports = router;