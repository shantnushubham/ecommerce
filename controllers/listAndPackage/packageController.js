var itemMetaModel = require("../../models/Items/ItemMetadata");
var itemmodel = require("../../models/Items/Items");
var vendorModel = require('../../models/Items/vendor')
var cartmodel = require("../../models/cart/cart");
var cartservices = require("../../openServices/cart");
var listServices = require("../../openServices/list");
var packageServices = require('../../openServices/package')

var functions = require('../../Middlewares/common/functions')

exports.getAllPackages = (req, res) => {
    packageServices.getAllPackages(function (packageListing) {
        if (packageListing.success == false) {
            req.flash('error', 'error in getting packages')
            res.redirect('/')
        }
        else {
            // console.log('items', { itemlist: itemlist.foundItems, category: itemlist.category, subCategory: itemlist.subCategory, tag: itemlist.tag, s_cat: [], s_sub: [], s_tag: [] })

            res.render('allPackages', { packageListing: packageListing.foundItems, category: packageListing.category, subCategory: packageListing.subCategory, tag: packageListing.tag, s_cat: [], s_sub: [], s_tag: [] })
        }
    })
}


exports.getCreatePackage = (req, res) => {
    cartmodel.aggregate([
        { $match: { uuid: req.user.uuid } },
        { $lookup: { from: 'items', localField: 'iid', foreignField: 'iid', as: 'item' } },
        {
            $project: {
                "quantity": "$quantity",
                "uuid": "$uuid",
                "iid": "$iid",
                "item": { "$arrayElemAt": ["$item", 0] }
            }
        }]).exec(function (err, found) {
            if (err) {
                console.log(err);
                req.flash('error', 'error in fetching cart')
                res.redirect('/items')
            }
            else {
                var codAllowed = true
                var total = 0
                var pData = {}
                for (var i = 0; i < found.length; i++) {
                    if (found[i].item.cod == false) {
                        codAllowed = false
                    }
                    total += found[i].item.price * found[i].quantity
                    var temp = { iid: found[i].iid, quantity: found[i].quantity }
                    pData[found[i].iid] = temp

                }
                res.render('createPackageItem', { cartlisting: found, total: total, packageData: JSON.stringify(pData), codAllowed: codAllowed, })
            }
        })

}
exports.postCreatePackage = (req, res) => {
    var data = req.body;
    console.log(data);
    packageServices.createPackageItem({
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
        cod: data.cod == "true" ? true : false,
        measurementUnit: data.measurementUnit,
        isBusiness: data.isBusiness,
        tax: data.gstPercent,
        slashedPrice: data.slashedPrice,
        discount: data.discount,
        sale: data.sale == "true" ? true : false,
        packageData: data.packageData
    }, function (createdPackage) {
        if (createdPackage.success == false) {
            req.flash('error', 'error')
            console.log(err);
            res.redirect('back')
        }
        else {
            req.flash('success', 'success')
            res.redirect('back')
        }
    })
}
exports.getUpdatePackage = (req, res) => {
    cartmodel.aggregate([
        { $match: { uuid: req.user.uuid } },
        { $lookup: { from: 'items', localField: 'iid', foreignField: 'iid', as: 'item' } },
        {
            $project: {
                "quantity": "$quantity",
                "uuid": "$uuid",
                "iid": "$iid",
                "item": { "$arrayElemAt": ["$item", 0] }
            }
        }]).exec(function (err, found) {
            if (err) {
                console.log(err);
                req.flash('error', 'error in fetching cart')
                res.redirect('/items')
            }
            else {
                var codAllowed = true
                var total = 0
                var pData = {}
                for (var i = 0; i < found.length; i++) {
                    if (found[i].item.cod == false) {
                        codAllowed = false
                    }
                    total += found[i].item.price * found[i].quantity
                    var temp = { iid: found[i].iid, quantity: found[i].quantity }
                    pData[found[i].iid] = temp

                }
                res.render('adminUpdatePackage', { cartlisting: found, total: total, packageData: JSON.stringify(pData), codAllowed: codAllowed, })
            }
        })

}
exports.postUpdatePackage = (req, res) => {
    itemmodel.findOne({ iid: req.body.iid }, (err, foundItem) => {
        if (err || functions.isEmpty(foundItem)) {
            console.log('db -error/empty');
            req.flash('error', 'item does not exist')
            res.redirect('back')
        }
        else {
            var data = {
                iid: req.body.iid,
                total: req.body.total,
                packageData: req.body.packageData,

            }
            if (data.total <= 0 || data.packageData.length < 2 || Object.keys(JSON.parse(data.packageData)).length == 0) {
                req.flash('error', 'invalid data')
                console.log('invalid data');
                res.redirect('back')
            }
            else {
                packageServices.updatePackageItemsData(data, (updated) => {
                    if (updated.success == false) {
                        console.log('error in updating');
                        req.flash('error', 'error in updating')
                        res.redirect('back')
                    }
                    else {
                        req.flash('success', 'success')
                        res.redirect('back')
                    }
                })
            }
        }
    })

}

exports.addToCart = (req, res) => {
    packageServices.addPackageToCart(req.params.iid, req.user.uuid, req.body.quantity, function (createdCart) {
        if (createdCart.success == false) {
            req.flash('error', 'error:' + createdCart.message)
            res.redirect('/items')
        }
        else {
            req.flash('success', 'added to cart')
            res.redirect('/items')
        }
    })
}
exports.getPackageItems = (req, res) => {
    packageServices.getPackageItems(req.params.iid, (foundItem) => {
        if (foundItem.success == false) {
            req.flash('error', 'error ' + foundItem.message)
            res.redirect('back')
        }
        else {
            res.render('adminPeekPackage', { itemlist: foundItem.itemlist })
        }
    })
}

