const mongoose = require("mongoose");
var shortid = require("shortid");

var codAllow = new mongoose.Schema({
    from:{
        type:Number,
        required:true,
        default:0
    },
    name:{
        type:String,
        default:"codallow"
    }
    

})
module.exports=mongoose.model("codAllow", codAllow, 'codAllow');