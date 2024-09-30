import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import mongoose from 'mongoose';
import { validationResult } from 'express-validator';
import {config} from '../config.js';  
import UserModel from '../model/users.js'; 

// Signup function
const signup = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ msg: errors.array() });
    }

    const { username, password } = req.body;
    const existingUser = await UserModel.findOne({ username });

    if (existingUser) {
      return res.status(401).json({
        success: false,
        message: "User Already Exists",
      });
    } else {
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);

      const newUser = new UserModel({
        userID: randomUUID(),
        username,
        password: hashedPassword,
      });

      await newUser.save();
      return res.status(200).json({
        success: true,
        message: "Registration Done Successfully",
      });
    }
  } catch (error) {
    console.error("Signup issue:", error);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Server Error",
      });
    }
  }
};

// Login function
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUser = await UserModel.findOne({ username });

    if (existingUser) {
      const passwordMatch = await bcrypt.compare(password, existingUser.password);
      if (!passwordMatch) {
        return res.status(401).json({ msg: "Password is wrong" });
      }

      const token = jwt.sign({ _id: existingUser.userID }, config.secret, { expiresIn: '1h' });
      return res.status(200).json({
        msg: "Login Successfully",
        token,
      });
    } else {
      return res.status(404).json({ msg: "Your Account is not Registered" });
    }
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

// Export the functions
export { signup, login };
