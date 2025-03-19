import User from "../models/user.model.js";

export const getContactList = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({_id: {$ne:loggedInUserId}}).select("-password");

        /*
        const contacts = filteredUsers.map((user) => ({
            label: `${user.firstName} ${user.lastName}`,
            value: user._id,
        }));
        */
        
        console.log(filteredUsers);
        res.status(200).json({contacts: filteredUsers})
    } catch (error) {
        console.log("Error in getUserList:", error.message);
        res.status(500).json({error: "Internal server error"});
    }
};

export const contactSearch = async (req, res) => {
    console.log("contactSearch called");
}

export const deleteMessages = async (req, res) => {
    console.log("deleteMessages called");
}