const mongoose = require("mongoose");
const shortid = require("shortid");

var listMetaSchema  = new mongoose.Schema({
    uuid:{
        type:String
    },
  
    name:{
        type:String,
         required:true
    },
    lid:{
        type:String,
        required:true,
        default:shortid.generate
    }
})
    module.exports=mongoose.model("listMeta", listMetaSchema,"listMeta");
    