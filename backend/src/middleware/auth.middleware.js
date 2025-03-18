import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            console.log("No token provided")
            return res.status(401).json({message: "Unauthorized: No token provided"});
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (!decoded) {
            console.log("Invalid token")
            return res.status(401).json({message: "Unauthorized: Token is invalid"});
        }

        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            console.log("User not found:", req.body)
            return res.status(404).json({message: "User not found"});
        }

        req.user = user

        next()
    } catch (error) {
        console.log("Error in protectRoute middleware:", error.message);
        res.status(500).json({message: "Internal server error"});
    }
}