import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import user from '../models/user.js';
import { generateToken } from '../middleware/authMiddleware.js';

const __filename= fileURLToPath(import.meta.url);
const __dirname=dirname(__filename);

const JWT_SECRET = 'diuhbcubckjbcudkjadshc hkzdcbjhcbkhdc';

export const signup = async (req, res) => {
  const data = req.body;

  try {
    if (data.username === "" || data.email === "" || data.password === "") {
      return res.status(400).json({
        success: false,
        message: "Please fill all the fields"
      });
    }

    const userExists = await user.findOne({ email: data.email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    const newUser = new user({
      username: data.username,
      email: data.email,
      password: hashedPassword
    });

    await newUser.save();

    return res.status(201).json({
      success: true,
      message: "User created successfully"
    });

  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};



export const login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the fields"
      });
    }

    const userExists = await user.findOne({ email: email });

    if (!userExists) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const isPasswordValid = await bcrypt.compare(password, userExists.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }
    
    // Generate token 
    const token = generateToken(userExists);
    
    res.status(200).json({
      success: true,
      message: "Login successful",
      token: token,
      user: {
        username: userExists.username,
        email: userExists.email
      }
    });
    
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Check if user is authenticated
export const checkAuth = async (req, res) => {
  try {
   
    res.status(200).json({
      success: true,
      user: req.user,
      message: "User is authenticated"
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Not authenticated"
    });
  }
}