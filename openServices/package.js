var itemMetaModel = require("../models/Items/ItemMetadata")
var itemmodel = require('../models/Items/Items')
var itemServices = require('../openServices/items')
var cartmodel = require('../models/cart/cart')
var listmodel = require('../models/lists/list')
var listMetaModel = require('../models/lists/listMeta')
var packageModel = require('../models/lists/packages')
var packageMetaModel = require('../models/lists/packageMeta')

var functions = require('../Middlewares/common/functions')

var mongoose = require("mongoose")
class packs {
    constructor() {

    }
    getPackageNames(callback) {
        packageMetaModel.find({}, function (err, foundLM) {
            if (err) {
                callback({ success: false })
            }
            else callback({ success: true, foundPM: foundLM })
        })
    }
    createPackage(uuid, name, callback) {
        console.log("creating list");
        packageMetaModel.create({ uuid: uuid, name: name }, function (err, foundLM) {
            if (err) {
                console.log(err);
                callback({ success: false })
            }
            else callback({ success: true, foundPM: foundLM })
        })
    }
    addToPackage(data, callback) {
        packageModel.findOne({ iid: data.iid, lid: data.lid }, function (err, foundLm) {
            if (!functions.isEmpty(foundLm)) {
                var update = {
                    quantity: foundLm.quantity + parseInt(data.quantity)
                }
                packageModel.findOneAndUpdate({ lid: data.lid, iid: data.iid }, update, function (err, updated) {
                    if (err)
                        callback({ success: false })
                    else
                        callback({ success: true, updated: updated })
                })
            }
            else {
                packageModel.create(data, function (err, created) {
                    if (err) {
                        callback({ success: false })
                    }
                    else callback({ success: true, created: created })
                })
            }
        })

    }
    removeFromPackage( iid, lid, callback) {
        packageModel.deleteOne({ iid: iid, lid: lid }, function (err, removed) {
            if (err) callback({ success: false })
            else callback({ success: true })
        })
    }
    updatePackage(iid, lid, quantity) {
        {
            iid = iid.trim()
            // uuid = uuid.trim()
            lid = lid.trim()
            return new Promise((resolve, reject) => {
                packageModel.findOne({ iid: iid, lid: lid }).then(function (foundItem) {

                    if (functions.isEmpty(foundItem)) {
                        console.log('not in list');
                        // callback({ success: false, found: false,message:'item with iid'+iid+' does not exist in cart' })
                        reject()
                    }
                    else {
                        itemmodel.findOne({ iid: iid, active: true }).then(function (founditem) {

                            if (functions.isEmpty(founditem)) {
                                console.log('unavailable item');
                                // callback({ success: false, message: 'could not find any item by that name' })
                                reject()

                            }
                            else {

                                if (quantity == 0) {

                                    packageModel.deleteOne({ iid: founditem.iid, lid: lid }).then(function (deleted) {


                                        console.log('success deleting');
                                        // callback({ success: true, item: deleted })
                                        resolve()

                                    }).catch(function (err) {
                                        console.log(err);
                                        // callback({success:false})
                                        reject()
                                    })
                                }
                                else {
                                    packageModel.findOneAndUpdate({ iid: founditem.iid, lid: lid }, { '$set': { quantity: quantity } }).then(function (addedItem) {


                                        console.log('success');
                                        // callback({ success: true, item: addedItem })
                                        resolve()

                                    }).catch(function (err) {
                                        console.log(err);
                                        // callback({success:false})
                                        reject()
                                    })
                                }


                            }


                        }).catch(function (err) {
                            console.log(err);
                            // callback({success:false})
                            reject()
                        })

                    }

                }).catch(function (err) {
                    console.log(err);
                    // callback({success:false})
                    reject()
                })
            })


        }
    }

    getPackage(lid, callback) {
        packageMetaModel.findOne({ lid: lid }, function (err, foundMeta) {
            if (err) {
                console.log(err);
                callback({ success: false })

            }
            else {
                packageModel.aggregate([
                    { $match: { lid: lid } },
                    { $lookup: { from: 'items', localField: 'iid', foreignField: 'iid', as: 'item' } },
                    {
                        $project: {
                            "quantity": "$quantity",
                            "iid": "$iid",
                            "item": { "$arrayElemAt": ["$item", 0] }
                            , "price": "$item.price"
                        }
                    }
                ]).exec(function (err1, foundL) {
                    if (err1)
                        callback({ success: false })
                    else {
                        if (functions.isEmpty(foundL)) {
                            callback({ success: true, isEmpty: true, packageMeta: foundMeta, list: [] })
                        }
                        else
                            callback({ success: true, packageMeta: foundMeta, list: foundL })

                    }
                })
            }
        })
    }
    // deletePackage(uuid, lid, callback) {
    //     listMetaModel.deleteMany({ uuid: uuid, lid: lid }, function (err, deletedMeta) {
    //         console.log(err);
    //         listmodel.deleteMany({ uuid: uuid, lid: lid }, function (err1, deletedL) {
    //             console.log(err);

    //             if (err || err1)
    //                 callback({ success: false })
    //             else
    //                 callback({ success: true })
    //         })
    //     })
    // }
    addPackageToCart(userId, lid, callback) {
        packageModel.find({ lid: lid }, function (err, foundL) {
            if (err)
                callback({ success: false })
            else {
                var pack = []
                foundL.forEach(element => {
                    pack.push({ uuid: userId, quantity: element.quantity, iid: element.iid, })
                });
                cartmodel.insertMany(pack, function (err, createdC) {
                    if (err)
                        callback({ success: false })
                    else
                        callback({ success: true, createdC: true })
                })
            }
        })
    }

    publishPackage(data, callback) {
        var item_data = { name: data.name, price: data.price, image: data.image, }
        var item_metaData = { content: data.content }
        var item_categoryData = { name: data.category }
        itemServices.createItem(data, function (createdItem) {
            if (createdItem.success == false) {
                callback({ success: false, message: 'could not create Item' })

            }
            else {
                itemmodel.findOneAndUpdate({ iid: createdItem.item.iid }, { iid: data.lid, isPackage: true }, function (err, updatedItem) {
                    if (err)
                        callback({ success: false, message: "trouble in appointing id to item" })
                    else {
                        packageMetaModel.findByIdAndUpdate({ lid: data.lid }, { total: data.price }, function (err, createdPack) {
                            if (err)
                                callback({ success: true, message: "please check entry of package" })
                            else
                                callback({ success: true, message: "item is live" })
                        })
                    }
                })
            }
        })
    }

}

module.exports = new packs()