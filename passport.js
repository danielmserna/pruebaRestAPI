const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const fs = require("fs");
const path = require("path");
const User = require('./models/user');

let pathResolver = e => { return path.resolve(e).split(path.sep).filter(function (e) { return e !== "dist"; }).join("/"); }
const _publickey = fs.readFileSync(pathResolver("public.pem"), "utf8");

var opt = {};
opt.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opt.secretOrKey = _publickey;
//JSON web tokens strategy
passport.use(new JwtStrategy(opt, async (payload, done) => {
    try {
        //find the user specified in token
        const user = await User.findById(payload.sub);
        // if user dosen't exists
        if (!user) {
            return done(null, false);
        }
        //otherwise, return user
        done(null, user);
    } catch (error) {
        done(error, false);
    }
}));

