const mongoose = require("mongoose");
const JWT = require("jsonwebtoken");
const { JWT_SECRET_KEY, Tokens } = require("../configuration");
const fs = require("fs");
const path = require("path");

let pathResolver = e => { return path.resolve(e).split(path.sep).filter(function (e) { return e !== "dist"; }).join("/"); }

const _privatekey = fs.readFileSync(pathResolver("private.pem"), "utf8");
const _publickey = fs.readFileSync(pathResolver("public.pem"), "utf8");

module.exports = {
  ObjectId: mongoose.Types.ObjectId,
  signToken : (payload, sess, type)=>{
    payload.sess = sess;
    return new Promise((r, e) => JWT.sign(
      payload,
      _privatekey,
      Tokens[type].signOptions,
      (err, data) => { if(err) return e(err); else r(data)}
     ))
  },
  verifyToken : (token)=>{
    return new Promise((r, e) => JWT.verify(
      token,
      _publickey,
      (err, data) => { if(err) return e(err); else r(data)}
     ))
  },
  tokenDetails: token => {
    let jwtToken = token.split(/\s+/);
    return new Promise((r, e) => JWT.verify(
      jwtToken[1],
      _publickey,
      (err, data) => { if(err) return e(err); else r(data)}
     ))
  },
  equalObj: (from, to) => {
    var data = {};
    Object.keys(from).forEach((val) => { if (from[val] === to[val]) { data[val] = from[val] } })
    return data;
  },
  sendEmail: (email) => {
    const mailjet = require ('node-mailjet').connect(process.env.MAILJETKEY, process.env.MAILJETSECRET)
    return new Promise((r, e) => 
      mailjet.post("send", {'version': 'v3.1'}).request({"Messages":[email]},
      ((err,res)=> { if(err) return e(err); else r(res.body)}
      ))
    );    
  },
};
