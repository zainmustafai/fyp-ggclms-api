import express from "express";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import uploadImageToCloudinary from "./utils/uploadImageToCloudinary.js";

export const userLogin = async (req, res) => {
  console.log("user Login Route Reached");
  try {
    const { email, password } = req.body;
    // Find the user by username
    const user = await User.findUserByCredentials(email, password);
    // If the user does not exist or the password is incorrect, return an error
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    // Generate a JWT
    const token = await user.generateAuthToken(); // Method defined on/in Model class.
    res.status(200).json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
/************************************************************************************************************************* */
// User Log out
export const userLogout = async (req, res) => {
  console.log("user Logout Route Reached");
  try {
    const user = await User.findById(req.user._id); // req.user is coming from the middleware.
    console.log(user);
    const tokenToRemove = req.token;
    user.tokens = user.tokens.filter((token) => {
      console.log(token.token);
      return token.token !== tokenToRemove;
    });
    await user.save();
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error cannot logout." });
  }
};
/************************************************************************************************************************* */
// Create a new user
export const createNewUser = async (req, res) => {
  try {
    const { firstName, lastName, gender, email, username, password, role } =
      req.body;
    const user = await User.create({
      firstName,
      lastName,
      gender,
      email,
      username,
      password,
      role,
    });
    const token = await user.generateAuthToken();
    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
/************************************************************************************************************************* */

// Get all users
export const getAllUsers = async (req, res) => {
  console.log(
    "GET ALL USERS ROUTE REACHED! THIS MEANS ADMIN IS AUTHENTICATED "
  );
  try {
    const users = await User.find().populate("profile");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
/************************************************************************************************************************* */

// Get a specific user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new Error("User not found");
    res.json(user);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};
/************************************************************************************************************************* */

// Update a user by ID
export const updateUserById = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!user) throw new Error("User not found");
    res.json(user);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};
/************************************************************************************************************************* */
// Delete a user by ID
export const deleteUserById = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) throw new Error("User not found");
    res.sendStatus(204);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};
/************************************************************************************************************************* */
//logoutALLDevices
export const logoutAllDevices = async (req, res) => {
  const requester = req.user;
  const user = await User.findByIdAndUpdate(
    { _id: requester._id },
    { tokens: [] }
  );
  console.log(user);
  res.status(200).json({ message: "Logged out from all devices" });
};
/************************************************************************************************************************* */

// Update a user's profile picture
export const updateProfilePictureById = async (req, res) => {
  const userId = req.params.id;
  const profileImage = req.file;
  const fileName = `${userId}-profile-image`;
  try {
    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const result = await uploadImageToCloudinary(profileImage.path, fileName);
    // Update the user's profile image
    user.profileImage = {
      filename: result.original_filename,
      url: result.url,
      asset_id: result.asset_id,
      publicId: result.public_id,
    };
    // Save the updated user document
    await user.save();
    res.status(200).json({ message: "Profile picture updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
/************************************************************************************************************************* */
