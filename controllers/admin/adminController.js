var itemModel=require("../../models/items")
var itemMetaModel=require("../../models/itemMetadata")
var itemservices=require('../../openServices/items')
var mongoose=require("mongoose")


exports.getAllItems=function(req,res){
    itemservices.getAllItems(function(itemlist){
        res.render('itemsAdmin',{itemlist:itemlist})
    })
}

exports.getItem=function(req,res){
   itemservices.getItemById(req.params.iid,function(foundItem){
       res.render('itemPageAdmin',{item:foundItem})
   })
}

exports.getItemByCategory=function(req,res){
   itemservices.getItemByCategory(req.params.category,function(foundItem){
       res.render('itempageAdmin',{item:foundItem})
   })
}

exports.getItemByStatus=function(req,res){
    itemservices.getItemByStatus(req.params.status,function(foundItem){
        res.render('itempageAdmin',{item:foundItem})
    })
}

exports.createItem=function(req,res){
   itemservices.createItem({price:req.body.price,name:req.body.name,category:req.body.category,image:req.body.image},function(createdItem){
       res.redirect('/admin/items')
   })
}

exports.setDiscount=function(req,res){
    itemservices.setDiscount(req.body.discount,req.body.iid,function(updatedItem){
        res.redirect('/admin/items')
    })
}

exports.deactivateItem=function(req,res){
    itemservices.deactivateItem(req.params.iid,function(updatedItem){
        res.redirect('/admin/items')
    })
}

exports.activateItem=function(req,res){
    itemservices.activateItem(req.params.iid,function(updatedItem){
        res.redirect('/admin/items')
    })
}


