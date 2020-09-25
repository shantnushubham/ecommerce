var itemModel = require("../../models/Items/Items")
var itemMetaModel = require("../../models/Items/ItemMetadata")
var itemservices = require('../../openServices/items')
var mongoose = require("mongoose")


exports.getAllItems = function (req, res) {
    itemservices.getAllItems(function (itemlist) {
        // console.log({ itemlist: itemlist.foundItems });
        res.render('itemsAdmin', { itemlist: itemlist.foundItems, category: itemlist.category, subCategory: itemlist.subCategory, tag: itemlist.tag  })
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
        image: data.image,
        category: data.category,
        subCategory: data.subCategory,
        tag: data.tag,
        groupingTag: data.groupingTag,
        vendorId:data.vendorId,

        weight: data.weight,
        content: data.content,
        color: data.color

    }, function (createdItem) {
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

// exports.populate = function (req, res) {
//     itemservices.populate(req.params.iid, function (foundItem) {
//         console.log(foundItem);
//     })
// }


