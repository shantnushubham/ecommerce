var itemModel = require("../../models/Items/Items")
var itemMetaModel = require("../../models/Items/ItemMetadata")
var userModel = require('../../models/User/User')
var bizModel = require('../../models/User/businessAcc')
var itemservices = require('../../openServices/items')
var orderServices = require('../../openServices/order')
var mongoose = require("mongoose")
// var csv = require('csv-express')
var csv = require('jsonexport')
var Parser = require('json2csv').Parser

exports.showAdminPage = (req, res) => {
    res.render("adminPage");
}

exports.showItemsSection = (req, res) => {
    res.render("adminItemSection");
}

exports.getAllItems = function (req, res) {
    itemservices.getAllItems( function (itemlist) {
        // console.log({ itemlist: itemlist.foundItems });
        res.render('itemsAdmin', { itemlist: itemlist.foundItems, category: itemlist.category, subCategory: itemlist.subCategory, tag: itemlist.tag })
    })
}

exports.getItem = function (req, res) {
    itemservices.getItemById(req.params.iid, function (foundItem) {
        console.log({ item: foundItem.totalDetails });
        res.render('itemPageAdmin', { item: foundItem.totalDetails })
    })
}

exports.getItemByCategory = function (req, res) {
    var s = itemservices.filler([], req.body.category, "category")
    var s1 = itemservices.filler(s, req.body.subCategory, "subCategory")
    var s2 = itemservices.filler(s1, req.body.tag, "tag")
    itemservices.filterItems(s2, function (itemlist) {
        if (itemlist.success == false) {
            req.flash('error', 'error in getting items')
            res.redirect('/')
        }
        else
            res.render('itemsAdmin', { itemlist: itemlist.foundItems, category: itemlist.category, subCategory: itemlist.subCategory, tag: itemlist.tag })
    })
}

exports.getItemByStatus = function (req, res) {
    itemservices.getItemByStatus(req.params.status, function (foundItem) {
        console.log({ item: foundItem.foundItems });
        res.render('itempageAdmin', { item: foundItem.foundItems })
    })
}

exports.createItem = function (req, res) {
    var data = req.body;
    itemservices.createItem({
        name: data.name,
        price: data.price,
        image: data.image.split("||"),
        category: data.category,
        subCategory: data.subCategory,
        tag: data.tag,
        groupingTag: data.groupingTag,
        vendorId: data.vendorId,
        shortDesc: data.shortDesc,
        weight: data.weight,
        content: data.content,
        color: data.color,
        stock: data.stock,
        isService: data.isService === "true" ? true : false,
        cod: data.cod == true ? true : false,
        measurementUnit: data.measurementUnit,
        isBusiness: data.isBusiness,
        tax: data.gstPercent



    }, function (createdItem) {
        res.redirect('/admin/items')
    })
}

exports.getUpdateItem = function (req, res) {
    itemservices.getItemById(req.params.iid, function (foundItem) {
        // console.log({ item: foundItem.totalDetails });
        if (!foundItem.success) res.redirect('/admin/items')
        res.render('updateItem', { item: foundItem.totalDetails, iid: req.params.iid })
    })
}

exports.updateItem = function (req, res) {
    var data = req.body;
    itemservices.updateItem(req.params.iid, {
        name: data.name,
        price: data.price,
        image: data.image.split("||"),
        category: data.category,
        subCategory: data.subCategory,
        tag: data.tag,
        groupingTag: data.groupingTag,
        vendorId: data.vendorId,
        shortDesc: data.shortDesc,
        weight: data.weight,
        content: data.content,
        color: data.color,
        stock: data.stock,
        isService: data.isService === "true" ? true : false,
        isBusiness: data.isBusiness === "true" ? true : false,
        cod: data.cod == true ? true : false,
        tax: data.gstPercent,
        sku: data.sku,
        measurementUnit: data.measurementUnit

    }, function (createdItem) {
        if (createdItem.success == false) req.flash('error', 'error in update')
        else req.flash('success', 'success in update')
        res.redirect('/admin/items')
    })
}
exports.setDiscount = function (req, res) {
    itemservices.setDiscount(req.body.discount, req.body.iid, function (updatedItem) {
        res.redirect('/admin/items')
    })
}

exports.deactivateItem = function (req, res) {
    itemservices.deactivateItem(req.params.iid, function (updatedItem) {
        res.redirect('/admin/items')
    })
}

exports.activateItem = function (req, res) {
    itemservices.activateItem(req.params.iid, function (updatedItem) {
        res.redirect('/admin/items')
    })
}

exports.downloadSingleInvoice = function (req, res) {
    orderServices.findOrderById(req.params.orderId, req.params.uuid, function (foundOrder) {
        if (foundOrder.success == false || foundOrder.found == false) {
            req.flash('error', 'empty file or error downloading')
            res.redirect('/admin/orders-filter')
        }
        else {
            var promiseArr = []
            foundOrder.order.orderedItems.forEach(element => {
                promiseArr.push(orderServices.getItemForOrderList(element.iid, element.quantity))
            });
            Promise.all(promiseArr).then(result => {
                res.render('invoice', { success: true, found: true, order: foundOrder.order, Olist: result })
            }).catch(errors => {
                req.flash('error', 'error in loading full data')
                res.redirect('/admin/orders-filter')

            })
        }
    })
}

exports.getCSVDownloadPagePayment = (req, res) => {
    res.render("csvDownload", {filterType: "payment"});
}

exports.getCSVDownloadPageShipment = (req, res) => {
    res.render("csvDownloadShip", { filterType: "shipment"});
}

exports.downloadInvoiceByRangePayment = function (req, res) {
    if(req.body){
        orderServices.getOrdersByDateRangePayment(req.body.from, req.body.to,req.body.payment, function (foundOrder) {
            console.log(foundOrder);
            if (foundOrder.success == false)
                {return res.redirect('/admin/orders-filter')}
            if(foundOrder.success) {
                const fields = [
                    {
                        label: 'Order ID',
                        value: 'orderId'
                    },
                    {
                        label: 'uuid',
                        value: 'uuid'
                    },
                    {
                        label: 'total',
                        value: 'total'
                    },
                    {
                        label: 'tax',
                        value: 'tax'
                    },
                    {
                        label: 'address',
                        value: 'fullAddress'
                    },
                    {
                        label: 'city',
                        value: 'city'
    
                    },
                    {
                        label: 'state',
                        value: 'state'
                    },
                    {
                        label: 'pincode',
                        value: 'pincode'
                    },
    
                    {
                        label: 'date',
                        value: 'purchaseTime'
                    },
                    {
                        label: 'country',
                        value: 'country'
                    },
                    {
                        label: 'status',
                        value: 'status'
                    },
                    {
                        label: 'payment Type',
                        value: 'paymentType'
                    },
                    {
                        label: 'transaction_id',
                        value: 'transaction_id'
                    },
                    {
                        label: 'vendorId',
                        value: 'vendorId'
                    },
                    {
                        label: 'vendorName',
                        value: 'vendorName'
                    },
                    {
                        label: 'vendorId',
                        value: 'vendorId'
                    },
                    {
                        label: 'shippingConfirmed',
                        value: 'shippingConfirmed'
                    },
                    {
                        label: 'shipmentStatus',
                        value: 'shipmentStatus'
                    },
                    {
                        label: 'offerUsed',
                        value: 'offerUsed'
                    },
    
    
                ];
                const json2csv = new Parser({ fields });
                const csv = json2csv.parse(foundOrder.data);
                // console.log(csv);
                res.header('Content-Type', 'text/csv');
                res.attachment("orders.csv");
                return res.send(csv)
            }
        })
    
    }
    else
    res.redirect('/downloads/invoice')

}
exports.getCSVDownloadPageShipment = (req, res) => {
    res.render("csvDownloadShip");
}
exports.downloadInvoiceByRangeShipment = function (req, res) {
    if(req.body){
        orderServices.getOrdersByDateRangeShipment(req.body.from, req.body.to,req.body.shipment, function (foundOrder) {
            console.log(foundOrder);
            if (foundOrder.success == false)
                {return res.redirect('/admin/orders-filter')}
            if(foundOrder.success) {
                const fields = [
                    {
                        label: 'Order ID',
                        value: 'orderId'
                    },
                    {
                        label: 'uuid',
                        value: 'uuid'
                    },
                    {
                        label: 'total',
                        value: 'total'
                    },
                    {
                        label: 'tax',
                        value: 'tax'
                    },
                    {
                        label: 'address',
                        value: 'fullAddress'
                    },
                    {
                        label: 'city',
                        value: 'city'
    
                    },
                    {
                        label: 'state',
                        value: 'state'
                    },
                    {
                        label: 'pincode',
                        value: 'pincode'
                    },
    
                    {
                        label: 'date',
                        value: 'purchaseTime'
                    },
                    {
                        label: 'country',
                        value: 'country'
                    },
                    {
                        label: 'status',
                        value: 'status'
                    },
                    {
                        label: 'payment Type',
                        value: 'paymentType'
                    },
                    {
                        label: 'transaction_id',
                        value: 'transaction_id'
                    },
                    {
                        label: 'vendorId',
                        value: 'vendorId'
                    },
                    {
                        label: 'vendorName',
                        value: 'vendorName'
                    },
                    {
                        label: 'vendorId',
                        value: 'vendorId'
                    },
                    {
                        label: 'shippingConfirmed',
                        value: 'shippingConfirmed'
                    },
                    {
                        label: 'shipmentStatus',
                        value: 'shipmentStatus'
                    },
                    {
                        label: 'offerUsed',
                        value: 'offerUsed'
                    },
    
    
                ];
                const json2csv = new Parser({ fields });
                const csv = json2csv.parse(foundOrder.data);
                // console.log(csv);
                res.header('Content-Type', 'text/csv');
                res.attachment("orders.csv");
                return res.send(csv)
            }
        })
    
    }
    else
    res.redirect('/downloads/invoice')

}

exports.downloadUserList = function (req, res) {
   var filter={

   }
   if(req.params.type=="individual")
   {
       filter.isBusiness=false
       filter.premium=false
   }
   if(req.params.type==="business")
   filter.isBusiness=true
   if(req.params.type==="premium")
   {filter.isBusiness=true
    filter.premium=true
}
    userModel.find(filter, function (err, foundUsers) {
        console.log(foundUsers);
        if (err) {
            req.flash('error', 'error in downloading')
            res.redirect('/admin')
        }
        else {
            const fields = [
                {
                    label: 'Name',
                    value: 'name'
                },
                {
                    label: 'uuid',
                    value: 'uuid'
                },
                {
                    label: 'Admin',
                    value: 'isAdmin'
                },
                {
                    label: 'active',
                    value: 'active'
                },
                {
                    label: 'phone',
                    value: 'phone'
                },
                {
                    label: 'email',
                    value: 'email'

                },
                {
                    label: 'businessAccount',
                    value: 'isBusiness'
                },
                {
                    label: 'premium',
                    value: 'premium'
                },

                {
                    label: 'credit Percent',
                    value: 'credPerc'
                },
                {
                    label: 'balance',
                    value: 'credBalance'
                },
                {
                    label: 'state',
                    value: 'state'
                }

            ];
            const json2csv = new Parser({ fields });
            const csv = json2csv.parse(foundUsers);
            res.header('Content-Type', 'text/csv');
            res.attachment("users.csv");
            return res.send(csv);

        }
    })
}

exports.showAccountAndInvoice = (req, res) => {
    res.render("adminAccountInvoice")
}

exports.downloadBizAccList = function (req, res) {
    userModel.find({ isBusiness: true }, function (err, foundUsers) {
        if (err) {
            req.flash('error', 'error in downloading')
            res.redirect('/admn')
        }
        else {
            const fields = [
                {
                    label: 'Name',
                    value: 'name'
                },
                {
                    label: 'uuid',
                    value: 'uuid'
                },
                {
                    label: 'Admin',
                    value: 'isAdmin'
                },
                {
                    label: 'active',
                    value: 'active'
                },
                {
                    label: 'phone',
                    value: 'phone'
                },
                {
                    label: 'email',
                    value: 'email'

                },
                {
                    label: 'businessAccount',
                    value: 'isBusiness'
                },
                {
                    label: 'premium',
                    value: 'premium'
                },

                {
                    label: 'credit Percent',
                    value: 'credPerc'
                },
                {
                    label: 'balance',
                    value: 'credBalance'
                },
                {
                    label: 'state',
                    value: 'state'
                }

            ];
            const json2csv = new Parser({ fields });
            const csv = json2csv.parse(foundUsers);
            res.header('Content-Type', 'text/csv');
            res.attachment("businessAccount.csv");
            return res.send(csv);
        }
    })
}


/**
 * downloads
 * order invoice
 * order invoice between date
 * orders invoice download by shipment status
 * users list download
 * business account download
 */
