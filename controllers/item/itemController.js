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
            res.render('itempage', { item: foundItem.totalDetails, group: foundItem.group, similar: foundItem.similar  })
        // console.log(foundItem)
    })
}

exports.filterItems = function (req, res) {
    console.log(req.body);
    var ca = [], su = [], ta = [];
    ca = itemservices.clean_Data(req.body.category)
    su = itemservices.clean_Data(req.body.subCategory)
    ta = itemservices.clean_Data(req.body.tag)



    var s = itemservices.filler([], ca, "category")
    var s1 = itemservices.filler(s, su, "subCategory")
    var s2 = itemservices.filler(s1, ta, "tag")
    console.log(s2);
    itemservices.filterItems(s2, function (itemlist) {
        // console.log(itemlist);
        if (itemlist.success == false) {
            req.flash('error', 'error in getting items')
            res.redirect('/')
        }
        else{
            console.log({ itemlist: itemlist.foundItems, category: itemlist.category, subCategory: itemlist.subCategory, tag: itemlist.tag });
            res.render('items', { itemlist: itemlist.foundItems, category: itemlist.category, subCategory: itemlist.subCategory, tag: itemlist.tag ,s_cat:ca,s_sub:su,s_tag:ta})
        
        }
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
        vendorId:req.body.vendorId,
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


