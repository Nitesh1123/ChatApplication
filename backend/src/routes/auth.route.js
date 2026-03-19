import express from "express";
import {
  signup,
  login,
  logout,
  updateProfile,
  changePassword,
  deleteAccount,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";

const router = express.Router();

router.use(arcjetProtection);

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.patch("/update-profile", protectRoute, updateProfile);
router.put("/update-profile", protectRoute, updateProfile);
router.post("/change-password", protectRoute, changePassword);
router.delete("/delete-account", protectRoute, deleteAccount);

router.get("/check", protectRoute, (req, res) => res.status(200).json(req.user));

export default router;
