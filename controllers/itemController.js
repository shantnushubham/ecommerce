var itemModel=require("../models/items")
var mongoose=require("mongoose")
exports.getAllItems=function(req,res){

}

exports.getItem=function(req,res){

}

exports.getItemByCategory=function(req,res){

}

exports.getItemByStatus=function(req,res){

}
mongoose.connect("mongodb://localhost:27017/spice", { useUnifiedTopology: true, useNewUrlParser: true });
itemModel.create({name:"test item",price:100,category_id:"123"})