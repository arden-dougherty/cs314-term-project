import { generateToken } from "../lib/utils.js"
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
    const{email, password} = req.body
    try {
        if (!email || !password) {
            console.log("Bad request:", req.body);
            return res.status(400).json({message: "All fields are required"});
        }
        /*
        if (password.length < 8) {
            return res.status(400).json({message: "Minimum password length is 8 characters"});
        }
        */
        const user = await User.findOne({email});

        if (user) {
            console.log("Account already exists:", req.body);
            return res.status(409).json({message: "An account already exists with this email"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            email: email,
            password: hashedPassword
        })

        if (newUser) {
            //generateToken(newUser._id, res);
            const token = jwt.sign({email, userId: newUser.id}, process.env.JWT_SECRET, {expiresIn: "1h"});
            res.cookie("jwt", token, {
                secure: true,
                sameSite: "None",
                maxAge: 60 * 60 * 1000
            });

            await newUser.save();

            console.log("User created:", req.body);

            res.status(201).json({
                _id:newUser._id,
                email: newUser.email,
            })
        }
        else {
            res.status(400).json({message: "Invalid user data"});
        }
    } catch (error) {
        console.log("Error in signup controller:", error.message);
        res.status(500).json({message: "Internal server error"});
    }
};

export const login = async (req, res) => {
    const {email, password} = req.body
    
    try {
        const user = await User.findOne({email});

        if (!user) {
            console.log("Invalid email:", req.body);
            return res.status(404).json({message: "Invalid credentials"});
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            console.log("Invalid password:", req.body);
            return res.status(400).json({message: "Invalid credentials"});
        }

        //generateToken(user._id, res);
        const token = jwt.sign({email, userId:user._id}, process.env.JWT_SECRET, {expiresIn: "1h"});
        res.cookie("jwt", token, {
            secure: true,
            sameSite: "None",
            maxAge: 60 * 60 * 1000
        });

        console.log("User signed in successfully:", req.body);
        
        res.status(200).json({
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                color: user.color,
            }
        });
    } catch (error) {
        console.log("Error in login controller:", error.message);
        res.status(500).json({message: "Internal server error"});
    }
};

export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", {maxAge:0})
        res.status(200).json({message: "Logged out successfully"});
    } catch (error) {
        console.log("Error in logout controller:", error.message);
        res.status(500).json({message: "Internal server error"})
    }
};

export const updateName = async(req, res) => {
    try {
        const {firstName, lastName, color} = req.body;
        const userId = req.user._id;

        /*
        if (!firstName || !lastName) {
            return res.status(400).json({message: "All fields are required"});
        }
        */

        const updatedUser = await User.findByIdAndUpdate(userId, {firstName:firstName, lastName:lastName, color:color}, {new:true});

        console.log("User profile updated:", req.body);
        res.status(200).json({
            user: {
                id: updatedUser._id,
                email: updatedUser.email,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                color: updatedUser.color,
            }
        });
    } catch (error) {
        console.log("Error in updated profile:", error.message);
        res.status(500).json({message: "Internal server error"});
    }
};

export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in checkAuth controller:", error.message);
        res.status(500).json({message: "Internal server error"});
    }
}