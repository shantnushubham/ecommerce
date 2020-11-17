const mongoose = require("mongoose");
const shortid = require("shortid");

var packageSchema  = new mongoose.Schema({
    
    iid:{
        type: String,
        required: true,
        
    },
    
    quantity:{
        type:Number,
        required:true
    },
   
    lid:{
        type:String,
        required:true
    }
})
module.exports=mongoose.model("package", packageSchema,"package");