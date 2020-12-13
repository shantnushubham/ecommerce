var itemMetaModel = require("../models/Items/ItemMetadata")
var itemmodel = require('../models/Items/Items')
var vendorModel=require('../models/Items/vendor')
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

    createPackageItem(data, callback) {

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
            slashedPrice: data.slashedPrice == '' || data.slashedPrice == undefined ? 0 : data.slashedPrice,
            discount:data.discount,
            sale:data.sale,
            isPackage:true,
            packageData:data.packageData

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
                itemmodel.create(item_data, function (err, newItem) {
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

    addPackageToCart(iid, uuid, quantity=1, callback) {
        itemmodel.findOne({ iid: iid, active: true,isPackage:true }, function (err, founditem) {
            if (err) {
                console.log(err);
                callback({ success: false, message: 'could not find any item by that name' })

            }
            else {
                if (functions.isEmpty(founditem)) {
                    console.log({ success: false, message: 'could not find any item by that name' });
                    callback({ success: false, message: 'could not find any item by that name' })

                }
                else {//item is not a service
                    cartmodel.aggregate([
                        { $match: { uuid: uuid } },
                        { $lookup: { from: 'items', localField: 'iid', foreignField: 'iid', as: 'item' } },
                        {
                            $project: {
                                "quantity": "$quantity",
                                "iid": "$iid",
                                "item": { "$arrayElemAt": ["$item", 0] },

                            }

                        },
                        {
                            $project: {
                                "isService": "$item.isService",
                                "quantity": "$quantity",
                                "iid": "$iid",
                                "item": "$item"
                            }
                        }
                    ]).exec(function (err, foundS) {
                        if (err) {
                            console.log(err);
                            callback({ success: false, message: 'db error' })
                        }
                        else {
                            var containsService = false, containsProduct = false
                            if (foundS.length > 0 && foundS[0].isService) {
                                containsService = true

                            }
                            if (foundS.length > 0 && !foundS[0].isService) {
                                containsProduct = true

                            }
                            // console.log("containsService",containsService);
                            // console.log("containsProduct",containsProduct);

                            // console.log("should be added?",(founditem.isService == false && containsService == true) || (founditem.isService == true && containsProduct == true));
                            if ((founditem.isService == false && containsService == true) || (founditem.isService == true && containsProduct == true)) {
                                callback({ success: false, message: 'cannot add a product with a service to cart' })
                            }
                            else {
                              var packageMapper=JSON.parse(founditem.packageData)
                              Object.keys(packageMapper).forEach((i)=>{
                                packageMapper[i].quantity=packageMapper[i].quantity*quantity
                              })
                              for(var i=0;i<foundS.length;i++)
                              {
                                  if(packageMapper.hasOwnProperty(foundS[i].iid))//if item is already in cart then update
                                  {
                                    packageMapper[foundS[i].iid].quantity=foundS[i].quantity+packageMapper[foundS[i].iid].quantity*quantity

                                  }
                                  else//add old item as it is
                                  {
                                      packageMapper[foundS[i].iid]={iid:foundS[i].iid,quantity:foundS[i].quantity}
                                  }
                                    
                                  
                              }
                              console.log(packageMapper);
                              var cartArray=[]
                              Object.values(packageMapper).forEach((i)=>{
                                var t={
                                    iid:i.iid,
                                    quantity:i.quantity,
                                    uuid:uuid
                                }
                                cartArray.push(t)
                              })
                              
                              console.log(cartArray);
                              cartmodel.deleteMany({uuid:uuid},function(err,deletedCart){
                                  if(err)
                                  {
                                      console.log(err);
                                    callback({success:false,message:'database error'})
                                  }
                                  else
                                  {
                                      cartmodel.insertMany(cartArray,function(err,createdCart){
                                        console.log(err);  
                                        if(err)
                                          callback({success:false,message:'database error'})
                                          else
                                          callback({success:true})
                                      })
                                  }

                              })
                              

                            }

                        }
                    })


                }
            }

        })
    }
    getPackageItems(iid,callback)
    {
        itemmodel.findOne({iid:iid}).then((founditem)=>{
            if(functions.isEmpty(founditem))
            throw({message:'item not found'})
            else
            {
                var packageMapper=JSON.parse(founditem.packageData)
                var iidarr=[]
                Object.keys(packageMapper).forEach((i)=>iidarr.push(i))
                console.log(iidarr);
                itemmodel.find({iid:{$in:iidarr}}).then(itemlist=>{
                  console.log(itemlist);
                    callback({success:true,itemlist:itemlist})
                }).catch(error=>{
                    callback({success:false,message:'database error'})
                })
            }
        }).catch(err=>{
            callback({success:false,message:err.message})
        })
    }
        
    updatePackageItemsData(data,callback)
    {
        itemmodel.findOneAndUpdate({iid:data.iid,isPackage:true},{packageData:data.packageData,price:data.total,codAllowed:data.codAllowed},(err,updatedItem)=>{
            console.log(updatedItem);
            if(err||functions.isEmpty(updatedItem))
            callback({success:false})
            else
            callback({success:true})
        })
    }

}

module.exports = new packs()