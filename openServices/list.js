var itemMetaModel = require("../models/Items/ItemMetadata")
var itemmodel = require('../models/Items/Items')
var cartmodel = require('../models/cart/cart')
var listmodel = require('../models/lists/list')
var listMetaModel = require('../models/lists/listMeta')
var functions = require('../Middlewares/common/functions')

var mongoose = require("mongoose")
class list {
    constructor() {

    }
    getUserListNames(uuid, callback) {
        listMetaModel.find({ uuid: uuid }, function (err, foundLM) {
            if (err) {
                callback({ success: false })
            }
            else callback({ success: true, foundLM: foundLM })
        })
    }
    createUserList(uuid, name, callback) {
        listMetaModel.create({ uuid: uuid, name: name }, function (err, foundLM) {
            if (err) {
                callback({ success: false })
            }
            else callback({ success: true, foundLM: foundLM })
        })
    }
    addToList(data, callback) {
        listmodel.findOne({ uuid: data.uuid, iid: data.iid, lid: data.lid }, function (err, foundLm) {
            if (!functions.isEmpty(foundLm)) {
                var update = {
                    quantity: foundLm.quantity + parseInt(data.quantity)
                }
                listmodel.findOneAndUpdate({ lid: data.lid, iid: data.iid }, update, function (err, updated) {
                    if (err)
                        callback({ success: false })
                    else
                        callback({ success: true, updated: updated })
                })
            }
            else {
                listmodel.create(data, function (err, created) {
                    if (err) {
                        callback({ success: false })
                    }
                    else callback({ success: true, created: created })
                })
            }
        })

    }
    removeFromList(uuid, iid,lid, callback) {
        listmodel.deleteOne({ uuid: uuid, iid: iid,lid:lid }, function (err, removed) {
            if (err) callback({ success: false })
            else callback({ success: true })
        })
    }
    updateList(iid, uuid, lid, quantity) {
        {
            iid = iid.trim()
            uuid = uuid.trim()
            lid = lid.trim()
            return new Promise((resolve, reject) => {
                listmodel.findOne({ iid: iid, uuid: uuid, lid: lid }).then(function (foundItem) {

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

                                    listmodel.deleteOne({ iid: founditem.iid, uuid: uuid, lid: lid }).then(function (deleted) {


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
                                    listmodel.findOneAndUpdate({ iid: founditem.iid, uuid: uuid, lid: lid }, { '$set': { quantity: quantity } }).then(function (addedItem) {


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
    getUserList(uuid,lid,callback)
    {
        listMetaModel.findOne({uuid:uuid,lid:lid},function(err,foundMeta){
            if(err)
            {
                callback({success:false})
                
            }
            else
            {
                listmodel.aggregate([
                    { $match : { uuid:uuid,lid:lid } },
                    { $lookup: { from: 'items', localField: 'iid', foreignField: 'iid', as: 'item' } },
                    { $project: { 
                        "quantity": "$quantity", 
                        "iid": "$iid", 
                        "item": { "$arrayElemAt": [ "$item", 0 ] } 
                        ,"price":"$item.price"
                    }}
                   ]).exec(function(err1,foundL){
                       if(err1||functions.isEmpty(foundL))
                       callback({success:false})
                       else
                       callback({success:true,listmeta:foundMeta,list:foundL})
                   })
            }
        })
    }
    deleteUserList(uuid,lid,callback)
    {
        listMetaModel.deleteMany({uuid:uuid,lid:lid},function(err,deletedMeta){
            console.log(err);
            listmodel.deleteMany({uuid:uuid,lid:lid},function(err1,deletedL){
                console.log(err);

                if(err||err1)
                callback({success:false})
                else
                callback({success:true})
            })
        })
    }
    addListToCart(uuid,lid,callback)
    {
        listmodel.find({uuid:uuid,lid:lid},function(err,foundL){
            if(err)
            callback({success:false})
            else
            {
                cartmodel.insertMany(foundL,function(err,createdC){
                    if(err)
                    callback({success:false})
                    else
                    callback({success:true,cre})
                })
            }
        })
    }

}

module.exports=new list()