var itemMetaModel = require("../../models/Items/ItemMetadata");
var itemmodel = require("../../models/Items/Items");
var cartmodel = require("../../models/cart/cart");
var cartservices = require("../../openServices/cart");
var listServices = require("../../openServices/list");
var packageServices=require('../../openServices/package')
var mongoose = require("mongoose");
var middleware = require("../../Middlewares/common/functions");
var async = require("async");





exports.createPackage = function (req, res) {
  console.log('here');
  packageServices.createPackage(
    req.user.uuid,
     req.body.listName, function (
    createdList
  ) {
    if (createdList.success == false)
      req.flash("error", "could not create list");
    else req.flash("success", "successfully created List");
    res.redirect("/user/list/names");
  });
};

exports.showPackageByLid = function (req, res) {
  packageServices.getPackage( req.params.lid, function (foundList) {
    if (foundList.success == false) {
      console.log(("error", "error in getting list "));
      req.flash("error", "error in getting list ");
      res.redirect("/user/list/names");
    } else {
      res.render("userListItems", { list: foundList.list,lid:req.params.lid});
    }
  });
};

exports.addToPackage = function (req, res) {
  var data = {
    iid: req.params.iid,
    quantity: req.body.quantity,
    lid: req.body.lid,
    uuid:req.user.uid
    // uuid:'5iIinrQCH'
  };
  packageServices.addToPackage(data, function (addedL) {
    if (addedL.success == false) req.flash("error", "error in adding to Package");
    else req.flash("success", "added to Package");
    res.redirect("/items/" + req.params.iid);
  });
};

exports.removeFromPackage = function (req, res) {
  packageServices.removeFromPackage(
    
    req.params.iid,
    req.params.lid,
    function (deleted) {
      if (deleted.success == false)
        req.flash("error", "error in deleting item");
      res.redirect("/user/list-items/" + req.params.lid);
    }
  );
};

exports.deleteList = function (req, res) {
  listServices.deleteUserList(req.user.uuid, req.params.iid, function (
    deleted
  ) {
    if (deleted.success == false) req.flash("error", "error in deleting item");
    res.redirect("user/list/names");
  });
};

exports.getUpdatePackage = function (req, res) {
  packageServices.getPackage(req.params.lid, function (foundList) {
    if (foundList.success == false) {
      req.flash("error", "error in getting list ");
      res.redirect("/items");
    } else {
      res.render("updatePackage", { list: foundList.list,lid:req.params.lid });
    }
  });
};

exports.postUpdatePackage = function (req, res) {
  var errolist = [];
  // console.log(req.body);
  var errorFlag = false;
  var cart = req.body;
  var ids = Object.keys(cart);
  console.log(ids);

  var promiseArr = [];
  ids.forEach((obj) =>
    promiseArr.push(
      packageServices.updatePackage(obj, req.params.lid, cart[obj])
    )
  );

  Promise.all(promiseArr)
    .then((respo) => {
      console.log("updated");
      //  console.log(respo);
      res.redirect("/user/list-items/" + req.params.lid);
    })
    .catch((err) => {
      console.log(err);
      res.redirect("/user/list-items/" + req.params.lid);
    });
};

exports.addPackageToCart = function (req, res) {
  packageServices.addPackageToCart(req.user.uuid, req.params.lid, function (addedC) {
    if (addedC.success == false) req.flash("error", "error in adding to cart");
    res.redirect("/cartpage");
  });
};
exports.getPublishPackage=function(req,res){
  packageServices.getPackage(req.params.lid,function(foundPackage){
    if(foundPackage.success==false)
    {
      req.flash('error','error in getting package')
      res.redirect('/user/list/names')
    }
    else
    res.render('publishPackage',{list:foundPackage.list, packageMeta:foundPackage.packageMeta})
  })
}
exports.publishPackage=function(req,res)
{
  var data={
    name:req.body.name,
    price:req.body.price,
    image:req.body.image,

    content:req.bopdy.content,

    category:req.body.category,

    lid:req.params.lid
  }
  packageServices.publishPackage(data,function(createdPackage){
    if(createdPackage.success==false)req.flash('error',createdPackage.message)
    else
    req.flash('success',createdPackage.message)
    res.redirect('/items')
  })
}
