var mongoose = require("mongoose");

// dataFormat 0 = csv, 1 = json, 2 = form-data
// actionType 0 = get, 1 = post, 2 = put, 3 = delete

var logSchema  = new mongoose.Schema({
        responseId: {
            type: String
        },
        httpMethod: {
            type: String
        },
        path: {
            type: String
        },
        fullRequestPath: {
            type: String
        },
        timestamp: {
            type: String
        },
        actionType: {
            type: Number
        },
        status: {
            type: String
        },
        requestBody: {
            type: String
        },
        responseBody: {
            type: String
        },
        responseSize:{
            type: Number
        },
        dataFormat:{
            type: Number
        },
        metaData: {
            type: Object
        }
    },
    {
        capped: true,
        autoCreate: true,
        autoIndex: true,
        max: 2000000,
        size: 5242880
    }
);

module.exports = mongoose.model("Log", logSchema);
