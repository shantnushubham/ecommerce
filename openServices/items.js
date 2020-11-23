var itemMetaModel = require("../models/Items/ItemMetadata")
var itemModel = require('../models/Items/Items')
var vendorModel = require('../models/Items/vendor')
var categoryModel = require('../models/Items/Category')
var mongoose = require("mongoose")
var functions = require('../Middlewares/common/functions')
class items {
    constructor() {

    }
    getAllItems(callback) {

        itemModel.find({ active: true }, function (err, foundItems) {
            if (err) {
                console.log(err)
                callback({ success: false, err: err })
            } else {
                var category = new Set()
                var subCategory = new Set()
                var tag = new Set()
                foundItems.forEach(el => {
                    category.add(el.category)
                    subCategory.add(el.subCategory)
                    tag.add(el.tag)

                })
                // console.log({ success: true, foundItems, err: null, category: Array.from(category), subCategory: Array.from(subCategory), tag: Array.from(tag) });
                callback({ success: true, foundItems, err: null, category: Array.from(category), subCategory: Array.from(subCategory), tag: Array.from(tag) })
            }
        })
    }

    searchBar(st, callback) {

        if (typeof (st) != "string") callback({ success: false })
        else {
            itemModel.find({ $text: { $search: st } }, function (err, foundItems) {
                if (err) {
                    console.log(err)
                    callback({ success: false, err: err })
                }
                else {
                    var category = new Set()
                    var subCategory = new Set()
                    var tag = new Set()
                    foundItems.forEach(el => {
                        category.add(el.category)
                        subCategory.add(el.subCategory)
                        tag.add(el.tag)

                    })
                    // console.log({ success: true, foundItems, err: null, category: Array.from(category), subCategory: Array.from(subCategory), tag: Array.from(tag) });
                    callback({ success: true, foundItems, err: null, category: Array.from(category), subCategory: Array.from(subCategory), tag: Array.from(tag) })
                }

            })

        }

    }



    getItemById(iid, callback) {
        console.log("called", iid);
        itemModel.findOne({ iid: iid, active: true }, function (err, foundItem) {
            if (err) callback({ success: false, err: err })
            else {
                if (functions.isEmpty(foundItem)) callback({ success: false, })
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
                                sale:foundItem.sale,
                                content: foundMeta.content,
                                weight: foundMeta.weight,
                                color: foundMeta.color,
                                category: foundItem.category,
                                subCategory: foundItem.subCategory,
                                tag: foundItem.tag,
                                groupingTag: foundItem.groupingTag,
                                vendorId: foundItem.vendorId,
                                vendorName: foundItem.vendorName,
                                shortDesc: foundItem.shortDesc,
                                measurementUnit: foundItem.measurementUnit,
                                isService: foundItem.isService,
                                tax: foundItem.tax,
                                sku: foundItem.sku,
                                stock: foundItem.stock,
                                cod: foundItem.cod,
                                isBusiness: foundItem.isBusiness

                            }

                            itemModel.find({ groupingTag: foundItem.groupingTag }, function (err1, foundGroup) {
                                if (err1)
                                    callback({ success: true, group: [], totalDetails: totalDetails, similar: [] })
                                else {
                                    itemModel.find({ category: foundItem.category }).limit(10).exec(function (err, similarItems) {
                                        if (err)
                                            callback({ success: true, group: [], totalDetails: totalDetails, similar: [] })
                                        else
                                            callback({ success: true, group: foundGroup, totalDetails: totalDetails, similar: similarItems })

                                    })

                                }


                            })

                        }
                    })
                }
            }

        })
    }

    filterItems(filterList, callback) {
        itemModel.find({ $or: filterList, active: true }, function (err, foundItems) {
            if (err) {
                console.log(err)
                callback({ success: false, err: err })
            }
            else {
                var category = new Set()
                var subCategory = new Set()
                var tag = new Set()
                foundItems.forEach(el => {
                    category.add(el.category)
                    subCategory.add(el.subCategory)
                    tag.add(el.tag)

                })

                callback({ success: true, foundItems, err: null, category: Array.from(category), subCategory: Array.from(subCategory), tag: Array.from(tag) });

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

    getItemByGroupingTag(gt, callback) {
        itemModel.find({ groupingTag: gt }, function (err, foundItems) {
            if (err) {
                callback({ success: false, group: [] })
            }
            else
                callback({ success: true, group: foundItems })
        })
    }

    createItem(data, callback) {

        var item_data = {
            name: data.name,
            price: data.price,
            image: data.image,
            category: data.category,
            shortDesc: data.shortDesc,
            subCategory: data.subCategory,
            tag: data.tag,
            groupingTag: data.groupingTag,
            stock: data.stock,
            isService: data.isService == "true" ? true : false,
            cod: data.cod == true ? true : false,
            measurementUnit: data.measurementUnit,
            tax: data.tax == '' ? 18 : data.tax,
            sku: data.sku,
            isBusiness: data.isBusiness == '' ? false : true,
            slashedPrice: data.slashedPrice == '' || data.slashedPrice == undefined ? 0 : data.slashedPrice

        }
        console.log('itemdata=', item_data);
        var item_metaData = { weight: data.weight, content: data.content, color: data.color }

        vendorModel.findOne({ vendorId: data.vendorId }, function (err, foundV) {
            if (err || functions.isEmpty(foundV)) {
                callback({ success: false, message: "vendor not found" })
            }
            else {
                item_data["vendorId"] = foundV.vendorId
                item_data["vendorName"] = foundV.vendorName
                itemModel.create(item_data, function (err, newItem) {
                    if (err) {
                        console.log(err)
                        callback({ success: false, err: "trouble creating item" })
                    }
                    else {
                        console.log("created", newItem);
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

        })


    }

    updateItem(iid, data, callback) {

        var item_data = {
            name: data.name,
            price: data.price,
            image: data.image,
            category: data.category,
            subCategory: data.subCategory,
            tag: data.tag,
            shortDesc: data.shortDesc,
            groupingTag: data.groupingTag,
            tax: data.tax == '' ? 18 : data.tax,
            sku: data.sku,
            stock: data.stock,
            measurementUnit: data.measurementUnit,
            isBusiness: data.isBusiness,
            cod: data.cod == true ? true : false,
            slashedPrice: data.slashedPrice == '' || data.slashedPrice == undefined ? 0 : data.slashedPrice


        }
        console.log(item_data);
        var item_metaData = { weight: data.weight, content: data.content, color: data.color }
        vendorModel.findOne({ vendorId: data.vendorId }, function (err, foundV) {
            if (err || functions.isEmpty(foundV)) {
                callback({ success: false, message: "vendor not found" })
            }
            else {
                item_data["vendorId"] = foundV.vendorId
                item_data["vendorName"] = foundV.vendorName

                itemModel.findOneAndUpdate({ iid: iid }, item_data, function (err, updatedItem) {
                    console.log(updatedItem);
                    if (err) callback({ success: false, err: err })
                    else {
                        itemMetaModel.findOneAndUpdate({ iid: iid }, item_metaData, function (err, updatedMeta) {
                            if (err) callback({ success: false, err: err })
                            else
                                callback({ success: true, })
                        })
                    }
                })

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

    clean_Data(val) {
        var res = []
        if (typeof (val) === "string") {
            res.push(val)
            return res
        }
        if (typeof (val) === "undefined")
            return res
        if (Array.isArray(val))
            return val
    }

    updateStock(iid, subtract) {
        return new Promise((resolve, reject) => {
            itemModel.findOne({ iid: iid }, function (err, foundItem) {
                if (err || functions.isEmpty(foundItem))
                    reject({ success: false, iid: iid })
                else {
                    if (foundItem.isService) { resolve({ success: true }) }
                    else {
                        var st = parseInt(foundItem.stock) - parseInt(subtract);
                        itemModel.findOneAndUpdate({ iid: iid }, { stock: st }, function (err, updated) {
                            if (err || functions.isEmpty(updated))
                                reject({ success: false, iid: iid })
                            else
                                resolve({ success: true, iid: iid })
                        })
                    }
                }
            })
        })
    }


}
module.exports = new items()