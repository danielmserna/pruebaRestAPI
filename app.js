require("dotenv").config();
const express = require("express");
const fileUpload = require('express-fileupload');
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
app.use(cors());

mongoose.Promise = global.Promise;

mongoose.connect(`${process.env.DB_HOST}${process.env.DB}`, { useUnifiedTopology: true, useCreateIndex: true,useNewUrlParser: true, useFindAndModify: false });

mongoose.connection.on('connected', ()=>{
  console.log("connected")
});
mongoose.connection.on('error', (e)=>{
  console.log(e)
});

//Middleware
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('uploads'));
app.use(fileUpload({
    createParentPath: true
}));

app.use("/user", require("./routes/user"));

module.exports = app;
