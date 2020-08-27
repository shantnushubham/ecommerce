const mongoose = require("mongoose");
const shortid = require("shortid");

var packageMetaSchema = new mongoose.Schema({
    uuid: {
        type: String
    },
    active: {
        type: Boolean,
        default: false
    },
    total: {
        type: Number,
    },
    name: {
        type: String,
        required: true
    },
    lid: {
        type: String,
        required: true,
        default: shortid.generate
    }
})
module.exports = mongoose.model("packageMeta", packageMetaSchema, "packageMeta");
