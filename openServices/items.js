var itemMetaModel = require("../models/Items/ItemMetadata")
var itemModel = require('../models/Items/Items')
var categoryModel=require('../models/Items/Category')
var mongoose = require("mongoose")
var functions=require('../Middlewares/common/functions')
class items {
    constructor() {

    }
    getAllItems(callback) {
        itemModel.find({}, function (err, foundItems, next) {
            if (err) {
                console.log(err)
                callback({ success: false, err: err })
            }
            else
                callback({ success: true, foundItems, err: null });
        })
    }

    getItemById(iid, callback) {
        itemModel.findOne({ iid: iid }, function (err, foundItem) {
            if (err) callback({ success: false, err: err })
            else{
            itemMetaModel.findOne({ iid: foundItem.iid }, function (err, foundMeta) {
                if (err) callback({ success: false, err: err })
                else
                {
                categoryModel.findOne({_id:foundItem.category},function(err,foundCategory){
                    if(err)callback({ success: false, err: err })
                    var totalDetails = {
                        active: foundItem.active,
                        iid: foundItem.iid,
                        name: foundItem.name,
                        price: foundItem.price,
                        image: foundItem.image,
                        discount: foundItem.discount,
                        content: foundMeta.content,
                        weight: foundMeta.weight,
                        color: foundMeta.color,
                        category:foundCategory.name
                    }
                    // console.log(totalDetails);
                    callback({ success: true, totalDetails, err: null })
                })
               
                }
            })
        }
        })
    }

    getItemByCategory(category, callback) {
        console.log(category);
        itemModel.aggregate([
        { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'category' } },
        
        { $project: { 
            iid:'$iid',
            name:'$name',
            active:'$active',
            price:'$price',

            "category": { "$arrayElemAt": [ "$category", 0 ] },


        }} ,
        {'$match':{'category.name':category}}
        ]).exec(function(err,found){
            if(err){
                console.log(err);
                req.flash('error','error in fetching cart')
                res.redirect('/items')
            }
            else{
            // console.log(found);
            callback({foundItems:found})
        }
        })
        
    }

    getItemByStatus(status, callback) {
        itemModel.find({ active: status }, function (err, foundItem) {
            if (err) {
                console.log(err)
                callback({ success: false, err: err })
            }
            else
                callback({ success: true, foundItems, err: null });
        });
    }

    createItem(data, callback) {
        var item_data={name:data.name,price:data.price,image:data.image,}
        var item_metaData={weight:data.weight,content:data.content,color:data.color}
        var item_categoryData={name:data.category}
        
        categoryModel.findOne({name:item_categoryData.name},function(err,foundCategory){
            if(err)
            {
                console.log(err);
                callback({success:false,message:'error in getting categories'})
            }
            else
            {
                if(functions.isEmpty(foundCategory)){
                    categoryModel.create(item_categoryData,function(err,newCat){
                        if(err)
                        {
                            console.log(err);
                            callback({success:false,message:'error in getting categories'})
                        }
                        else
                        {
                            item_data.category=newCat._id
                            itemModel.create(item_data, function (err, newItem) {
                                if (err) {
                                    console.log(err)
                                    callback({ success: false, err: "trouble creating item" })
                                }
                                else{
                                    item_metaData.iid=newItem.iid
                                    itemMetaModel.create(item_metaData,function(err,newMeta){
                                        if(err)
                                        {
                                            console.log(err)
                                            callback({ success: false, err: "trouble creating item" })
                                        }
                                        else
                                        {
                                            callback({ success: true, item: newItem, err: null })   
                                        }
                                    })
                                    // callback({ success: true, item: newItem, err: null })
                                }
                                })
                        }
                    })
                }
                else
                {
                    item_data.category=foundCategory._id
                    itemModel.create(item_data, function (err, newItem) {
                        if (err) {
                            console.log(err)
                            callback({ success: false, err: "trouble creating item" })
                        }
                        else{
                            item_metaData.iid=newItem.iid
                            itemMetaModel.create(item_metaData,function(err,newMeta){
                                if(err)
                                {
                                    console.log(err)
                                    callback({ success: false, err: "trouble creating item" })
                                }
                                else
                                {
                                    callback({ success: true, item: newItem, err: null })   
                                }
                            })
                            // callback({ success: true, item: newItem, err: null })
                        }
                        })
                }
            }
        })
        
    }

    setDiscount(discount, iid, callback) {
        var sale = parseFloat(discount) > 0 ? true : false;
        itemModel.findOneAndUpdate({ iid: iid }, { $set: { sale: sale, discount: discount } }, function (err, newItem) {
            if (err) {
                console.log(err)
                callback({ success: false, err: "trouble creating new item" })
            }
            else {
                callback({ success: true, err: null, item: newItem })
            }
        });
    }

    deactivateItem(iid, callback) {
        itemModel.findOneAndUpdate({ iid: iid }, { $set: { active: false } }, function (err, newItem) {
            if (err) {
                console.log(err)
                callback({ success: false, err: "trouble creating new item" })
            }
            else {
                callback({ success: true, err: null, item: newItem })
            }
        });
    }

    activateItem(iid, callback) {
        itemModel.findOneAndUpdate({ iid: iid }, { $set: { active: true } }, function (err, newItem) {
            if (err) {
                console.log(err)
                callback({ success: false, err: "trouble creating new item" })
            }
            else {
                callback({ success: true, err: null, item: newItem })
            }
        });
    }

}
module.exports = new items()