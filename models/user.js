const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

//create user schema
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    confirmation: {
      type: Object
      //confirm: false
			//code: null
    },
    locked:{
      status:{type:Boolean, default:false},
      lockType:{type:String, default:null},
      lockUntil:{type:String, default:null},
      //status: "true/false"
      //locktype : "maxLoginAttempts, banned"
      //lockUntil : "date"
    },
    failedLogin:{
      attempt:{type:Number, default:0},
      incorrect:{type:Number, default:0},
      //attempt: 0
      //incorrect: 0
    },
    loggedOn:{
      type:Object
      //deviceType
      //deviceToken
    },
    contacts: [{ type: Schema.Types.ObjectId, ref: 'requests'}],
    exDetails:{
      firstName:{
        type: String,
      },
      lastName:{
        type: String,
      },
      bio:{
        type: String,
      },
      picture:{
        type: String,
      }
    },
  },
  {
    timestamps: true
  }
);

userSchema.pre("save", async function (next) {
  try {
    //generate salt
    const salt = await bcrypt.genSalt(10);
    //password hash
    const passwordhash = await bcrypt.hash(this.password, salt);
    //reset pass with hashed one
    this.password = passwordhash;
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.isValidPassword = async function (newPassword) {
  try {
    return await bcrypt.compare(newPassword, this.password);
  } catch (error) {
    throw new Error(error);
  }
};

//create a model
const User = mongoose.model("user", userSchema);

module.exports = User;
