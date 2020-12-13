var itemMetaModel = require("../../models/Items/ItemMetadata");
var itemmodel = require("../../models/Items/Items");
var vendorModel = require('../../models/Items/vendor')
var cartmodel = require("../../models/cart/cart");
var cartservices = require("../../openServices/cart");
var listServices = require("../../openServices/list");
var packageServices = require('../../openServices/package')
var mongoose = require("mongoose");
var middleware = require("../../Middlewares/common/functions");
var async = require("async");


exports.getPackage = (req, res) => {

}
exports.getCreatePackage = (req, res) => {
    cartmodel.aggregate([
        { $match: { uuid: req.user.uuid } },
        { $lookup: { from: 'items', localField: 'iid', foreignField: 'iid', as: 'item' } },
        {
            $project: {
                "quantity": "$quantity",
                "uuid": "$uuid",
                "iid":"$iid",
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
            req.flash('error','error')
            console.log(err);
            res.redirect('back')
        }
        else {
            req.flash('success','success')
            res.redirect('back')
        }
    })
}
exports.updatePackage = (req, res) => {

}
exports.addToCart = (req, res) => {
    packageServices.addPackageToCart(req.params.iid, req.user.uuid, 1, function (createdCart) {
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


// exports.createPackage = function (req, res) {//workd

//   console.log('creating package');
//   packageServices.createPackage(
//     req.user.uuid,
//     req.body.listName, function (
//       createdList
//     ) {
//     if (createdList.success == false)
//       req.flash("error", "could not create list");
//     else req.flash("success", "successfully created List");
//     res.redirect("/user/list/names");
//   });
// };

// exports.showPackageByLid = function (req, res) {
//   packageServices.getPackage(req.params.lid, function (foundList) {
//     if (foundList.success == false) {
//       console.log(("error", "error in getting list "));
//       req.flash("error", "error in getting list ");
//       res.redirect("/user/list/names");
//     } else {
//       // res.send(foundList)
//       // console.log(foundList);
//       res.render("userListItems", { list: foundList.list, lid: req.params.lid });
//     }
//   });
// };

// exports.addToPackage = function (req, res) {
//   var data = {
//     iid: req.params.iid,
//     quantity: req.body.quantity,
//     lid: req.body.lid,
//     uuid: req.user.uuid
//     // uuid:'5iIinrQCH'
//   };
//   packageServices.addToPackage(data, function (addedL) {
//     if (addedL.success == false) req.flash("error", "error in adding to Package");
//     else req.flash("success", "added to Package");
//     res.redirect("/items/" + req.params.iid);
//   });
// };

// exports.removeFromPackage = function (req, res) {
//   packageServices.removeFromPackage(

//     req.params.iid,
//     req.params.lid,
//     function (deleted) {
//       if (deleted.success == false)
//         req.flash("error", "error in deleting item");
//       res.redirect('/admin/get/package/' + req.params.lid);
//     }
//   );
// };

// exports.deleteList = function (req, res) {
//   listServices.deleteUserList(req.user.uuid, req.params.iid, function (
//     deleted
//   ) {
//     if (deleted.success == false) req.flash("error", "error in deleting item");
//     res.redirect("user/list/names");
//   });
// };

// exports.getUpdatePackage = function (req, res) {
//   packageServices.getPackage(req.params.lid, function (foundList) {
//     if (foundList.success == false) {
//       req.flash("error", "error in getting list ");
//       res.redirect("/items");
//     } else {
//       res.render("updatePackage", { list: foundList.list, lid: req.params.lid });
//     }
//   });
// };

// exports.postUpdatePackage = function (req, res) {
//   var errolist = [];
//   // console.log(req.body);
//   var errorFlag = false;
//   var cart = req.body;
//   var ids = Object.keys(cart);
//   console.log(ids);

//   var promiseArr = [];
//   ids.forEach((obj) =>
//     promiseArr.push(
//       packageServices.updatePackage(obj, req.params.lid, cart[obj])
//     )
//   );

//   Promise.all(promiseArr)
//     .then((respo) => {
//       console.log("updated");
//       //  console.log(respo);
//       res.redirect("/admin/get/package/" + req.params.lid);
//     })
//     .catch((err) => {
//       console.log(err);
//       res.redirect("/admin/get/package/" + req.params.lid);
//     });
// };

// exports.addPackageToCart = function (req, res) {
//   // console.log("working here");
//   packageServices.getPackage(req.params.lid, function (foundPackage) {
//     if (foundPackage.success == false) {
//       req.flash('error', 'error in getting package')
//       res.redirect('/items/' + req.params.lid)
//     }
//     else {
//       var promiseArr = []
//       for (var i = 0; i < foundPackage.list.length; i++) {
//         promiseArr.push(cartservices.addManyToCart(req.user.uuid, foundPackage.list[i].iid, foundPackage.list[i].quantity))

//       }
//       Promise.all(promiseArr).then(result => {
//         req.flash('success', 'added all to cart')
//         res.redirect('/items')

//       }).catch(errors => {
//         req.flash('error', 'error in one or more items in cart.Please check')
//         res.redirect('/items')


//       })
//     }
//   })
// };
// exports.getPublishPackage = function (req, res) {
//   packageServices.getPackage(req.params.lid, function (foundPackage) {
//     if (foundPackage.success == false) {
//       req.flash('error', 'error in getting package')
//       res.redirect('/user/list/names')
//     }
//     else
//       res.render('publishPackage', { list: foundPackage.list, packageMeta: foundPackage.packageMeta, lid: req.params.lid })
//   })
// }
// exports.publishPackage = function (req, res) {
//   var data = req.body
//   var itemdata = {
//     name: data.name,
//     price: data.price,
//     image: data.image,
//     category: data.category,
//     subCategory: data.subCategory,
//     tag: data.tag,
//     groupingTag: data.groupingTag,
//     vendorId: data.vendorId,

//     weight: data.weight,
//     content: data.content,
//     color: data.color,


//     lid: req.params.lid
//   }



//   packageServices.publishPackage(itemdata, function (createdPackage) {
//     if (createdPackage.success == false) req.flash('error', createdPackage.message)
//     else
//       req.flash('success', createdPackage.message)
//     res.redirect('/items')
//   })
// }

///////////////////////////