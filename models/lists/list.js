const mongoose = require("mongoose");
const shortid = require("shortid");

var listSchema = new mongoose.Schema({
  uuid: {
    type: String,
  },
  iid: {
    type: String,
    required: true,
  },

  quantity: {
    type: Number,
    required: true,
  },

  lid: {
    type: String,
    required: true,
  },
});
module.exports = mongoose.model("list", listSchema, "list");
