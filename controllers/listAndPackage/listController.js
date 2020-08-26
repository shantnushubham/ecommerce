var itemMetaModel = require("../../models/Items/ItemMetadata");
var itemmodel = require("../../models/Items/Items");
var cartmodel = require("../../models/cart/cart");
var cartservices = require("../../openServices/cart");
var listServices = require("../../openServices/list");
var mongoose = require("mongoose");
var middleware = require("../../Middlewares/common/functions");
var async = require("async");

exports.getListPage = function (req, res) {
  listServices.getUserListNames(req.user.uuid, function (foundNames) {
    if (foundNames.success == false) {
      req.flash("error", "error in getting list names");
      res.render("listNames", { list: [] });
    } else {
      res.render("listNames", { list: foundNames.foundLM });
    }
  });
};

exports.showListByLid = function (req, res) {
  listServices.getUserList(req.user.uuid, req.params.lid, function (foundList) {
    if (foundList.success == false) {
      console.log(("error", "error in getting list "));
      req.flash("error", "error in getting list ");
      res.redirect("/user/list/names");
    } else {
      res.render("userListItems", { list: foundList.list,lid:req.params.lid});
    }
  });
};
exports.getCreateListPage = function (req, res) {
  res.render("createList");
};
exports.createList = function (req, res) {
  console.log('here');
  listServices.createUserList(req.user.uuid, req.body.listName, function (
    createdList
  ) {
    if (createdList.success == false)
      req.flash("error", "could not create list");
    else req.flash("success", "successfully created List");
    res.redirect("/user/list/names");
  });
};

exports.getChooseList = function (req, res) {
  listServices.getUserListNames(req.user.uuid, function (foundNames) {
    if (foundNames.success == false) {
      req.flash("error", "error in getting list names");
      res.render("chooseList", { list: [] });
    } else {
      itemmodel.findOne({ iid: req.params.iid }, function (err, foundItem) {
        if (err || middleware.isEmpty(foundItem))
          res.redirect("/items/" + req.params.iid);
        else res.render("chooseList", { list: foundNames, item: foundItem });
      });
    }
  });
};

exports.addToList = function (req, res) {
  var data = {
    // uuid: req.user.uuid,
    iid: req.params.iid,
    quantity: req.body.quantity,
    lid: req.body.lid,
    uuid:'5iIinrQCH'
  };
  listServices.addToList(data, function (addedL) {
    if (addedL.success == false) req.flash("error", "error in adding to list");
    else req.flash("success", "added to list");
    res.redirect("/items/" + req.params.iid);
  });
};

exports.removeFromList = function (req, res) {
  listServices.removeFromList(
    req.user.uuid,
    // '5iIinrQCH',
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

exports.getUpdateList = function (req, res) {
  listServices.getUserList(req.user.uuid, req.params.lid, function (foundList) {
    if (foundList.success == false) {
      req.flash("error", "error in getting list ");
      res.redirect("/user/list/names");
    } else {
      res.render("updateList", { list: foundList.list,lid:req.params.lid });
    }
  });
};

exports.postUpdateList = function (req, res) {
  var errolist = [];
  console.log(req.body);
  var errorFlag = false;
  var cart = req.body;
  var ids = Object.keys(cart);
  console.log(ids);

  var promiseArr = [];
  ids.forEach((obj) =>
    promiseArr.push(
      listServices.updateList(obj, req.user.uuid, req.params.lid, cart[obj])
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

exports.addListToCart = function (req, res) {
  listServices.addListToCart(req.user.uuid, req.params.lid, function (addedC) {
    if (addedC.success == false) req.flash("error", "error in adding to cart");
    res.redirect("/cartpage");
  });
};
