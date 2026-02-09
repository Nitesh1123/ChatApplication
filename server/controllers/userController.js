const router = require("express").Router();
const User = require("./../models/user");
const authMiddleware = require("./../middlewares/authMiddleware");
// get current logged-in user details

router.get('/get-logged-user', authMiddleware, async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.userId });

        res.send({
            message: "User fetched successfully.",
            success: true,
            data: user
        });
    } catch (err) {
        res.status(400).send({
            message: err.message,
            success: false
        });
    }
});

router.get('/get-all-user', authMiddleware, async (req, res) => {
    try {
        const allUser = await User.find({ _id: { $ne: req.userId } });

        res.send({
            message: "All User fetched successfully.",
            success: true,
            data: allUser
        });
    } catch (err) {
        res.status(400).send({
            message: err.message,
            success: false
        });
    }
});

module.exports = router;