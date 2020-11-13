const mongoose = require("mongoose");
var shortid = require("shortid");

var ship = new mongoose.Schema({
    data:{
        type:String,
        required:true,
        default:""
    },
    from:{
        type:Date,
        default:Date.now
    },
    name:{
        type:String
    }

})
module.exports=mongoose.model("shiprocket", ship, 'shiprocket');