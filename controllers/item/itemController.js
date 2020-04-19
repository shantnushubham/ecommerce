var itemModel=require("../../models/Items/Items")
var itemMetaModel=require("../../models/Items/ItemMetadata")
var itemservices=require('../../openServices/items')
var mongoose=require("mongoose")


exports.getAllItems=function(req,res){
    itemservices.getAllItems(function(itemlist){
        console.log(itemlist.foundItems);
        res.render('items',{itemlist:itemlist.foundItems})
    })
}

exports.getItem=function(req,res){
   itemservices.getItemById(req.params.iid,function(foundItem){
       res.render('itemPage',{item:foundItem.totalDetails})
    // console.log(foundItem)
   })
}

exports.getItemByCategory=function(req,res){
   itemservices.getItemByCategory(req.params.category,function(foundItem){
       res.render('itempage',{item:foundItem.foundItems})
   })
}

exports.getItemByStatus=function(req,res){
    itemservices.getItemByStatus(req.params.status,function(foundItem){
        res.render('itempage',{item:foundItem.foundItems})
    })
}

exports.createItem=function(req,res){
   itemservices.createItem({price:req.body.price,name:req.body.name,category:req.body.category,image:req.body.image},function(createdItem){
       if(createdItem.success==false)req.flash('error',createdItem.err)
       else req.flash('success','success')
       res.redirect('/admin/items')
   })
}

exports.setDiscount=function(req,res){
    itemservices.setDiscount(req.params.discount,req.params.iid,function(updatedItem){
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


