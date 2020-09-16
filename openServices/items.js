var itemMetaModel = require("../models/Items/ItemMetadata")
var itemModel = require('../models/Items/Items')
var categoryModel = require('../models/Items/Category')
var mongoose = require("mongoose")
var functions = require('../Middlewares/common/functions')
class items {
    constructor() {

    }
    getAllItems(callback) {
        itemModel.find({}, function (err, foundItems) {
            if (err) {
                console.log(err)
                callback({ success: false, err: err })
            }
            else{
                var category=new Set()
                var subCategory=new Set()
                var tag=new Set()
                foundItems.forEach(el=>{
                    category.add(el.category)
                    subCategory.add(el.subCategory)
                    tag.add(el.tag)

                })

                callback({ success: true, foundItems, err: null,category:Array.from(category),subCategory:Array.from(subCategory),tag:Array.from(tag) });

            }
        })
    }

    getItemById(iid, callback) {
        itemModel.findOne({ iid: iid }, function (err, foundItem) {
            if (err) callback({ success: false, err: err })
            else {
                itemMetaModel.findOne({ iid: foundItem.iid }, function (err, foundMeta) {
                    if (err) callback({ success: false, err: err })
                    else {
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
                            category: foundItem.category,
                            subCategory: foundItem.subCategory,
                            tag: foundItem.tag,
                            groupingTag: foundItem.groupingTag,


                        }
                        
                        itemModel.find({groupingTag:foundItem.groupingTag},function(err1,foundGroup){
                            if(err1)
                            callback({success:true,group:[],totalDetails:totalDetails})
                            else
                            callback({success:true,group:foundGroup,totalDetails:totalDetails})


                        })
                       
                    }
                })
            }
        })
    }

    filterItems(filterList,callback)
    {
        itemModel.find({$or:filterList},function(err,foundItems){
            if (err) {
                console.log(err)
                callback({ success: false, err: err })
            }
            else{
                var category=new Set()
                var subCategory=new Set()
                var tag=new Set()
                foundItems.forEach(el=>{
                    category.add(el.category)
                    subCategory.add(el.subCategory)
                    tag.add(el.tag)

                })

                callback({ success: true, foundItems, err: null,category:Array.from(category),subCategory:Array.from(subCategory),tag:Array.from(tag) });

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
        var item_data = {
            name: data.name,
            price: data.price,
            image: data.image,
            category: data.category,
            subCategory: data.subCategory,
            tag: data.tag,
            groupingTag: data.groupingTag
        }
        var item_metaData = { weight: data.weight, content: data.content, color: data.color }


        itemModel.create(item_data, function (err, newItem) {
            if (err) {
                console.log(err)
                callback({ success: false, err: "trouble creating item" })
            }
            else {
                item_metaData.iid = newItem.iid
                itemMetaModel.create(item_metaData, function (err, newMeta) {
                    if (err) {
                        console.log(err)
                        callback({ success: false, err: "trouble creating item" })
                    }
                    else {
                        callback({ success: true, item: newItem, err: null })
                    }
                })
                // callback({ success: true, item: newItem, err: null })
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

    filler(previous, current, key) {
        var r = []
        if (previous.length === 0) {
            for (var i = 0; i < current.length; i++) {
                var ob = {}
                ob[key] = current[i]
                r.push(ob)
            }
        }
        else {
            for (var i = 0; i < previous.length; i++) {
                for (var j = 0; j < current.length; j++) {
                    var ob = { ...previous[i] }
                    ob[key] = current[j]
                    r.push(ob)
                }
            }
        }
        if (r.length >= previous.length)
            return r;
        else
            return previous
    }

}
module.exports = new items()