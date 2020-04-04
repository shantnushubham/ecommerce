var itemModel=require("../../models/items")
var itemMetaModel=require("../../models/itemMetadata")
var mongoose=require("mongoose")


exports.getAllItems=function(req,res){
    itemModel.find({},function(err,foundItems,next){
        if(err)
        {console.log(err)
         res.send({err:err})
        }
        else
        res.send({foundItems,err:null});
    })
}

exports.getItem=function(req,res){
    itemModel.find({iid:req.params.iid},function(err,foundItem){
        if(err)res.send({err:err})
        itemMetaModel.find({iid:foundItem.iid},function(err,foundMeta){
            if(err)res.send({err:err})
            var totalDetails={...foundItem,...foundMeta}
            res.send({totalDetails,err:null})
            
            
        })
    })
}

exports.getItemByCategory=function(req,res){
    itemModel.find({category:req.params.category},function(err,foundItem){
        if(err)
        {console.log(err)
         res.send({err:err})
        }
        else
        res.send({foundItems,err:null});
    });
}

exports.getItemByStatus=function(req,res){
    itemModel.find({active:req.params.status},function(err,foundItem){
        if(err)
        {console.log(err)
         res.send({err:err})
        }
        else
        res.send({foundItems,err:null});
    });
}

exports.createItem=function(req,res){
    itemModel.create({price:req.body.price,name:req.body.name,category:req.body.category,image:req.body.image},function(err,newItem){
        if(err){
            console.log(err)
            res.send({err:"trouble creating item"})
        }
        else
        res.send({item:newItem,err:null})
    })
}

exports.setDiscount=function(req,res){
    var sale=parseFloat(req.body.discount)>0?true:false;
    itemModel.findOneAndUpdate({iid:req.body.iid},{$set:{sale:sale,discount:req.body.discount}},function(err,newItem){
        if(err)
        {
            console.log(err)
            res.send({err:"trouble creating new item"})
        }
        else
        {
            res.send({err:null,item:newItem})
        }
    });
}

exports.deactivateItem=function(req,res){
    itemModel.findOneAndUpdate({iid:req.body.iid},{$set:{active:false}},function(err,newItem){
        if(err)
        {
            console.log(err)
            res.send({err:"trouble creating new item"})
        }
        else
        {
            res.send({err:null,item:newItem})
        }
    });
}

exports.activateItem=function(req,res){
    itemModel.findOneAndUpdate({iid:req.body.iid},{$set:{active:true}},function(err,newItem){
        if(err)
        {
            console.log(err)
            res.send({err:"trouble creating new item"})
        }
        else
        {
            res.send({err:null,item:newItem})
        }
    });
}


