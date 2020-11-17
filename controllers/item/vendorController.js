var vendorModel = require('../../models/Items/vendor')
var vendorServices = require('../../openServices/vendor')
var itemservices = require('../../openServices/items')
var mongoose = require("mongoose")

exports.getCreateVendor = function (req, res) {
    res.render('createVendor')
}
exports.postCreateVendor = function (req, res) {
    var data = {
        vendorName: req.body.vendorName,
        city: req.body.city,
        state: req.body.state,
        phone: req.body.phone,
        address: req.body.address,
        email: req.body.email,
        pickup_location:req.body.pickup_location

    }
    vendorServices.createVendor(data, function (createdVendor) {
        if (createdVendor.success == false) {
            req.flash('error', 'error in creating vendor')
            res.redirect('/admin/createVendor')
        }
        else {
            req.flash('success', 'success')
            res.redirect('/admin/vendors')
        }
    })
}

exports.getVendors = function (req, res) {
    vendorServices.getVendors(function (foundVendors) {
        if (foundVendors.success == false) {
            req.flash('error', 'error in creating vendor')
            res.redirect('/admin/vendors')
        }
        else {
            req.flash('success', 'success')
            res.render('vendorList', { vendors: foundVendors.vendor })
        }
    })
}
exports.fetchVendorById = function (req, res) {
    vendorServices.getVendorById(req.params.vendorId, function (foundVendors) {
        if (createdVendor.success == false) {
            req.flash('error', 'error in getting vendor')
            res.redirect('/admin/vendors')
        }
        else {
            req.flash('success', 'success')
            res.render('vendorDetails', { vendors: foundVendors.vendor })
        }
    })
}
