var itemMetaModel=require("../models/Items/ItemMetadata")
var itemmodel=require('../models/Items/Items')
var mongoose=require("mongoose")
class items{
    constructor()
    {

    }
    getAllItems(callback){
        itemModel.find({},function(err,foundItems,next){
            if(err)
            {console.log(err)
             callback({err:err})
            }
            else
            callback({foundItems,err:null});
        })
    }

    getItemById(iid,callback){
        itemModel.findOne({iid:iid},function(err,foundItem){
            if(err)res.send({err:err})
            itemMetaModel.findOne({iid:foundItem.iid},function(err,foundMeta){
                if(err)res.send({err:err})
                var totalDetails={...foundItem,...foundMeta}
                res.send({totalDetails,err:null})
                
                
            })
        })
    }

    getItemByCategory(category,callback){
        itemModel.find({category:category},function(err,foundItem){
            if(err)
            {console.log(err)
             res.send({err:err})
            }
            else
            res.send({foundItems,err:null});
        });
    }

    getItemByStatus(status,callback){
        itemModel.find({active:status},function(err,foundItem){
            if(err)
            {console.log(err)
             res.send({err:err})
            }
            else
            res.send({foundItems,err:null});
        });
    }

    createItem(data,callback){
        itemModel.create(data,function(err,newItem){
            if(err){
                console.log(err)
                res.send({err:"trouble creating item"})
            }
            else
            res.send({item:newItem,err:null})
        })
    }

    setDiscount(discount,iid,callback){
        var sale=parseFloat(discount)>0?true:false;
    itemModel.findOneAndUpdate({iid:iid},{$set:{sale:sale,discount:discount}},function(err,newItem){
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

    deactivateItem(iid,callback){
        itemModel.findOneAndUpdate({iid:iid},{$set:{active:false}},function(err,newItem){
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

    activateItem(iid,callback){
        itemModel.findOneAndUpdate({iid:iid},{$set:{active:true}},function(err,newItem){
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

}
module.exports=new items()