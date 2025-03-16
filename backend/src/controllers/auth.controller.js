import { generateToken } from "../lib/utils.js"
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
    const{email, password} = req.body
    try {
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password must be given"});
        }

        if (password.length < 8) {
            return res.status(400).json({ message: "Minimum password length is 8 characters" });
        }

        const user = await User.findOne({email});

        if (user) {
            return res.status(400).json({ message: "An account already exists with this email" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            email: email,
            password: hashedPassword
        })

        if (newUser) {
            generateToken(newUser._id, res);
            await newUser.save();

            res.status(201).json({
                _id:newUser._id,
                email: newUser.email,
            })
        }
        else {
            res.status(400).json({ message: "Invalid user data"});
        }
    } catch (error) {
        console.log("Error in signup controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const login = (req, res) => {
    res.send("login route");
};

export const logout = (req, res) => {
    res.send("logout route");
};