const express = require("express");
const router = express.Router();
const Trail = require("../models/trail");
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
    const newTrail = {name: name, price:price, image: image, description: desc, author:author}
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

//RESTFUL api for showing form and send data to post routes
router.get("/new", middleware.isLoggedIn, (req, res)=>{
    res.render("trails/new")
});


//show routes
router.get("/:id", (req, res)=>{
    //find the trail with provided ID
    Trail.findById(req.params.id).populate("comments").exec((err, foundTrail)=>{
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
    Trail.findByIdAndUpdate(req.params.id, req.body.trail, (err, updatedTrail)=>{
       if(err){
           res.redirect("/trails");
       } else {
           res.redirect("/trails/" + req.params.id);
       }
    });
});

// DESTROY TRAIL ROUTE
router.delete("/:id",middleware.checkTrailOwnership, (req, res)=>{
   Trail.findByIdAndRemove(req.params.id, (err)=>{
      if(err){
          res.redirect("/trails");
      } else {
          res.redirect("/trails");
      }
   });
});

module.exports = router;