const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { ObjectId } = require("../helpers/functions");
const Schema = mongoose.Schema;

//create query history schema
const query = new Schema(
  {
    from: {
      type: ObjectId,
      required: true,
    },
    lat: {
      type: String,
      required: true
      //pending,accepted,rejected
    },
    lon: {
      type: String,
      required: true
      //pending,accepted,rejected
    },
  },
  {
    timestamps: true
  }
);

//create a model
const historyq= mongoose.model("query", query);

module.exports = historyq;
