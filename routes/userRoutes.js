const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/register", userController.userRegister);
router.post("/login", userController.loginUser);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password/:token", userController.resetPassword);
router.get("/verify", userController.verifyUser, (req, res) => {
  res.status(200).json({ status: true, message: "User Verified" });
});
router.get("/logout", userController.userLogout);

module.exports = router;
