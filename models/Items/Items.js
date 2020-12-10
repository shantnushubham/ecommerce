const mongoose = require("mongoose");
const shortid = require("shortid");
var mongooseHistory = require('mongoose-history');

// var textSearch = require('mongoose-text-search');

var itemsSchema = new mongoose.Schema({
    iid: {
        type: String,
        required: true,
        default: shortid.generate
    },
    name: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        required: true,
        default: true
    },
    price: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        default: "others"
    },
    subCategory: {
        type: String,
        default: "others"
    },
    tag: {
        type: String,
        default: "others"
    },
    groupingTag: {
        type: String,

    },
    image: [String],

    metadata: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'items_metadata'
    },
    discount: {
        type: Number,
        required: true,
        default: 0
    },
    sale: {
        type: Boolean,
        default: false
    },
    isPackage: {
        type: Boolean,
        default: false
    },
    packageData:{
        type:String,
        default:''
    },
    dateCreated: {
        type: Date,
        required: true,
        default: Date.now
    },

    vendorId: {
        type: String
    },
    vendorName: {
        type: String
    },
    sku: {
        type: String,
        default: shortid.generate
    },
    cod: {
        type: Boolean,
        default: true
    },
    shortDesc: {
        type: String
    },
    isService: {
        type: Boolean,
        default: false
    },
    stock: {
        type: Number,
        default: 0,
        // validate:{
        //     validator: function(num) {
        //         return arr >= 0;
        //       },
        //       message: "stock must be greater than equal to 0"
        // }
    },
    measurementUnit: {
        type: String,
        default: "Units"
    },
    isBusiness: {
        type: Boolean,
        default: false
    },
    tax: {
        type: Number,
        default: 18
    },
    slashedPrice:{
        type:Number,
        default:0
    }
});

itemsSchema.plugin(mongooseHistory)
// itemsSchema.plugin(textSearch)
itemsSchema.index({ name: 'text' })

module.exports = mongoose.model("items", itemsSchema);