const mongoose = require("mongoose");
const shortid = require("shortid");
var mongooseHistory = require('mongoose-history')

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
    dateCreated: {
        type: Date,
        required: true,
        default: Date.now
    },
    
    vendorId:{
        type:String
    },
    vendorName:{
        type:String
    },
    cod:{
        type:Boolean,
        default:true
    },
    shortDesc:{
        type:String
    }
});

itemsSchema.plugin(mongooseHistory)

module.exports = mongoose.model("items", itemsSchema);