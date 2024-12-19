import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userschema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowecase: true,
    trim: true,
  },
  fullname: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  refreshtoken: {
    type: String,
  },
}, {timestamps : true});

//For Password Hashing
userschema.pre("save", async function (next){
     if (!this.isModified("password")) return next();

     this.password = await bcrypt.hash(this.password, 10);
     next();
})

//for Login user
userschema.methods.ispasswordcorrect = async function (password) {
  console.log("Password provided:", password); // Debug
  console.log("Hashed password from DB:", this.password); // Debug
  return await bcrypt.compare(password, this.password);
};


//jwt Accestoken
userschema.methods.generateaccestoken = function(){
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
}

//Jwt refresh token
userschema.methods.generaterefreshtoken = function(){
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  )
}

export const User = mongoose.model("User", userschema)
