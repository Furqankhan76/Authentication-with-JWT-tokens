import { User } from "../models/User_model.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { ApiError } from "../middlewares/Apierror.js";
import { ApiResponse } from "../middlewares/apiresponse.js";
import cookieParser from "cookie-parser";

//
const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateaccestoken();
    const refreshToken = user.generaterefreshtoken();

    user.refreshtoken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const registeruser = async (req, res) => {
  try {
    const { fullname, email, password, username } = req.body;

    if (
      [fullname, email, password, username].some(
        (field) => field?.trim() === ""
      )
    ) {
      return res.status(404).json({ message: "All Fields are required" });
    }

    const existedUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existedUser) {
      return res
        .status(404)
        .json({ message: "User with email or username already exists" });
    }

    const user = await User.create({
      fullname,
      password,
      email,
      username,
    });

    const createduser = await User.findById(user._id).select(
      "-password -refreshtoken"
    );

    if (!createduser) {
      return res
        .status(404)
        .json({ message: "Something went wrong while regestering the user" });
    }

    return res.status(201).json(createduser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const loginuser = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    if (!(username || email)) {
      return res.status(404).json({ message: "Username or email is required" });
    }

    const user = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (!user) {
      res.status(404).json("User does not exist");
    }

    const ispasswordvalid = await user.ispasswordcorrect(password);

    if (!ispasswordvalid) {
      res.status(404).json("Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
      user._id
    );

    const loggedinuser = await User.findById(user._id).select(
      "-password -refreshtoken"
    );

    const options = {
      httponly: true,
      secure: true,
    };

    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(loggedinuser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const Userbyemail = async (req, res) => {
  try {
    const { email } = req.query;
    const user = await User.findOne({
      email: { $regex: email, $options: "i" },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


const deleteuser = async (req, res) => {
  try {
    const { email } = req.query;

    const user = await User.findOne({
      email: { $regex: email, $options: "i" },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const deleteuser = await User.findOneAndDelete(user);

    res.status(200).json({
      message: `Account with email ${user.email} deleted successfully`,
    });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

const deletebyrefreshtoken = async (req, res) => {
  try {
    // Check if the refresh token is provided in cookies
    const clientRefreshToken = req.cookies.refreshToken;

    if (!clientRefreshToken) {
      return res
        .status(400)
        .json({ message: "Refresh token is required to delete the account" });
    }
    
    
    // Verify the refresh token
    let decodedToken;
    try {
      decodedToken = jwt.verify(
        clientRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
    } catch (err) {
      return res
      .status(403)
      .json({ message: "Invalid or expired refresh token" });
    }
    // console.log(decodedToken);
    const user = await User.findById(decodedToken?._id)
       if (!user) {
         return res.status(404).json({ message: "User not found" });
       }
    
    // Ensure the refresh token matches the user's stored refresh token
    if (clientRefreshToken !== user?.refreshtoken) {
      return res
        .status(403)
        .json({
          message:
            "You cannot delete the account without a valid refresh token",
        });
    }

    // Delete the user account
    await user.deleteOne()
    // await User.deleteOne(user);

    res.status(200).json({
      message: `Account with email ${user.email} deleted successfully`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const newrefandacctokens = async (req, res) => {
  try {
    const incomingrefreshtoken = req.cookies.refreshToken;

    if (!incomingrefreshtoken) {
      return res.status(401).json({ message: "Unauthorized request" });
    }

    
const decodedtoken = jwt.verify(incomingrefreshtoken, process.env.REFRESH_TOKEN_SECRET);

const user = await User.findById(decodedtoken?._id)
if(!user){
  return res.status(401).json({message : "Invalid refresh token"})
}
 
 if (incomingrefreshtoken !== user?.refreshtoken){
  return res.status(401).json({ message: "refresh token expired" });
 }

const options = {
    httponly: true,
      secure: true,
};

 const { accessToken, refreshToken : newrefreshtoken } = await generateAccessAndRefereshTokens(
   user._id
 );

 //update the users refreshtoken in the database

 user.refreshtoken = newrefreshtoken;
 await user.save();

   res
     .status(200)
     .cookie("accessToken", accessToken, options)
     .cookie("refreshToken",  newrefreshtoken, options)
     .json(user);


  
   
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export {
  registeruser,
  loginuser,
  Userbyemail,
  deleteuser,
  deletebyrefreshtoken,
  newrefandacctokens,
};
