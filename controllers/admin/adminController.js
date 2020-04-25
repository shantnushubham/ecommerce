var itemModel=require("../../models/Items/Items")
var itemMetaModel=require("../../models/Items/ItemMetadata")
var itemservices=require('../../openServices/items')
var mongoose=require("mongoose")


exports.getAllItems=function(req,res){
    itemservices.getAllItems(function(itemlist){
        console.log({itemlist:itemlist.foundItems});
        res.render('itemsAdmin',{itemlist:itemlist.foundItems})
    })
}

exports.getItem=function(req,res){
   itemservices.getItemById(req.params.iid,function(foundItem){
       console.log({item:foundItem.totalDetails});
       res.render('itemPageAdmin',{item:foundItem.totalDetails})
   })
}

exports.getItemByCategory=function(req,res){
   itemservices.getItemByCategory(req.params.category,function(foundItem){
       console.log({item:foundItem.foundItems});
       res.render('itempageAdmin',{item:foundItem.foundItems})
   })
}

exports.getItemByStatus=function(req,res){
    itemservices.getItemByStatus(req.params.status,function(foundItem){
        console.log({item:foundItem.foundItems});
        res.render('itempageAdmin',{item:foundItem.foundItems})
    })
}

exports.createItem=function(req,res){
   itemservices.createItem({
    price:req.body.price,
    name:req.body.name,
    category:req.body.category,
    image:req.body.image,
    content:req.body.content,
    weight:req.body.weight,
    color:req.body.color    },function(createdItem){
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

exports.populate=function(req,res){
    itemservices.populate(req.params.iid,function(foundItem){
        console.log(foundItem);
    })
}


