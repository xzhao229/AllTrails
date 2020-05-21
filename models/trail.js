const mongoose = require("mongoose");

const trailSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String,
    price: String,
    location:String,
    lat:Number,
    lng:Number,
    createdAt:{
        type:Date,
        default:Date.now
    },
    author:{
        id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        username:String
    },
    comments:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Comment"
        }

    ]
});

module.exports = mongoose.model("Trail", trailSchema);