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
        else {
            // console.log('items', { itemlist: itemlist.foundItems, category: itemlist.category, subCategory: itemlist.subCategory, tag: itemlist.tag, s_cat: [], s_sub: [], s_tag: [] })

            res.render('items', { itemlist: itemlist.foundItems, category: itemlist.category, subCategory: itemlist.subCategory, tag: itemlist.tag, s_cat: [], s_sub: [], s_tag: [] })
        }
    })
}

exports.getItem = function (req, res) {
    itemservices.getItemById(req.params.iid, function (foundItem) {
        if (foundItem.success == false) {
            req.flash('error', 'error in getting item')
            res.redirect('/')
        }
        else
            res.render('itempage', { item: foundItem.totalDetails, group: foundItem.group, similar: foundItem.similar })
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
        else {
            // console.log({ itemlist: itemlist.foundItems, category: itemlist.category, subCategory: itemlist.subCategory, tag: itemlist.tag });
            res.render('items', { itemlist: itemlist.foundItems, category: itemlist.category, subCategory: itemlist.subCategory, tag: itemlist.tag, s_cat: ca, s_sub: su, s_tag: ta })

        }
    })
}

exports.search = function (req, res) {
    itemservices.searchBar(req.body.test, function (itemlist) {
        if (itemlist.success == false) {
            req.flash('error', 'error in getting items')
            res.redirect('/items')
        }
        else {
            // console.log('items', { itemlist: itemlist.foundItems, category: itemlist.category, subCategory: itemlist.subCategory, tag: itemlist.tag, s_cat: [], s_sub: [], s_tag: [] })
            if (itemlist.foundItems.length > 0)
                res.render('items', { itemlist: itemlist.foundItems, category: itemlist.category, subCategory: itemlist.subCategory, tag: itemlist.tag, s_cat: [], s_sub: [], s_tag: [] })
            else
                res.redirect('/items')
        }
    })
}
exports.categoryPages = function (req, res) {
    console.log(req.body);
    var ca = [], su = [], ta = [];
    ca.push(req.params.category)

    var s = itemservices.filler([], ca, "category")
    var s1 = itemservices.filler(s, su, "subCategory")
    var s2 = itemservices.filler(s1, ta, "tag")
    console.log(s2);
    itemservices.filterItems(s2, function (itemlist) {
        // console.log(itemlist);
        if (itemlist.success == false) {
            req.flash('error', 'error in getting items')
            res.redirect('/')
        } else {
            res.render('items', { itemlist: itemlist.foundItems, category: itemlist.category, subCategory: itemlist.subCategory, tag: itemlist.tag, s_cat: ca, s_sub: su, s_tag: ta })

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
        vendorId: req.body.vendorId,
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

exports.getItemsByCategoryAndSubCategory = (req, res) => {
    let category = req.params.category;
    let subCategory = req.query['sub-category'];
    console.log(category, subCategory)
    itemModel.find({ $and: [{ category: category }, { subCategory: subCategory }] }).then((foundItems) => {
        var cat = new Set()
        var subCat = new Set()
        var tag = new Set()
        foundItems.forEach(el => {
            cat.add(el.category)
            subCat.add(el.subCategory)
            tag.add(el.tag)
        })
        res.render('items', { itemlist: foundItems, category: Array.from(cat), subCategory: Array.from(subCat), tag: Array.from(tag), s_cat: [category], s_sub: [subCategory], s_tag: [] })

    }).catch((err) => {
        res.redirect('/items')
    })
}


exports.inc=function(req,res){
    itemModel.updateMany({category:req.body.category,subCategory:req.body.subCategory},{$mul:{price:(1-(10/100))}},function(err,founditems){
        if(err)
        req.flash('error','error')
        else
        req.flash('success','success')
        res.redirect('back')
    })
}