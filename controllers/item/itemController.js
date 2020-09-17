var itemModel = require("../../models/Items/Items")
var itemMetaModel = require("../../models/Items/ItemMetadata")
var itemservices = require('../../openServices/items')
var mongoose = require("mongoose")


exports.getAllItems = function (req, res) {
    itemservices.getAllItems(function (itemlist) {
        if (itemlist.success == false) {
            req.flash('error', 'error in getting items')
            res.redirect('/')
        }
        else
            res.render('items', { itemlist: itemlist.foundItems, category: itemlist.category, subCategory: itemlist.subCategory, tag: itemlist.tag })
    })
}

exports.getItem = function (req, res) {
    itemservices.getItemById(req.params.iid, function (foundItem) {
        if (foundItem.success == false) {
            req.flash('error', 'error in getting item')
            res.redirect('/')
        }
        else
            res.render('itemPage', { item: foundItem.totalDetails, group: foundItem.group })
        // console.log(foundItem)
    })
}

exports.filterItems = function (req, res) {
    console.log(req.body);
    console.log("filtering");
    var s = itemservices.filler([], req.body.category, "category")
    var s1 = itemservices.filler(s, req.body.subCategory, "subCategory")
    var s2 = itemservices.filler(s1, req.body.tag, "tag")
    console.log(s2);
    itemservices.filterItems(s2, function (itemlist) {
        console.log(itemlist);
        if (itemlist.success == false) {
            req.flash('error', 'error in getting items')
            res.redirect('/')
        }
        else
            res.render('items', { itemlist: itemlist.foundItems, category: itemlist.category, subCategory: itemlist.subCategory, tag: itemlist.tag })
    })
}

exports.getItemByStatus = function (req, res) {
    itemservices.getItemByStatus(req.params.status, function (foundItem) {
        res.render('itempage', { item: foundItem.foundItems })
    })
}

exports.createItem = function (req, res) {
    itemservices.createItem({
        price: req.body.price,
        name: req.body.name,
        category: req.body.category,
        image: req.body.image,
        weight: req.body.weight,
        content: req.body.content,
    }, function (createdItem) {
        // console.log('here');
        console.log(createdItem);
        if (createdItem.success == false) req.flash('error', createdItem.err)
        else req.flash('success', 'success')
        res.redirect('/admin/items')
    })
}

exports.setDiscount = function (req, res) {
    itemservices.setDiscount(req.params.discount, req.params.iid, function (updatedItem) {
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


