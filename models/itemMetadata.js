const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var itemsMetaSchema  = new mongoose.Schema({
    
    iid:{
        type: String,
        required: true,
        default:mongoose.Types.ObjectId
    },
    content:{
        type:String,
        required:true
    },
    weight:{
        type:String,
        required:true
    },
    color:{
        type:String,
        
    },
    

});

module.exports = mongoose.model("itemsMeta", itemsSchema,"itemsMeta");