const User = require("../models/User");
const bycrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const userRegister = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User Already Exists" });
    }
    const hashedPassword = await bycrypt.hash(password, 12);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    res
      .status(201)
      .json({ status: true, message: "User Registered Successfully", newUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.error("Error during user registration", error);
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }
    const isMatch = await bycrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.cookie("token", token, { maxAge: 3600000, httpOnly: true });
    res
      .status(200)
      .json({ status: true, message: "User Logged In Successfully", token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "youremail@gmail.com",
        pass: "your password",
      },
    });
    var mailOptions = {
      from: "youremail@gmail.com",
      to: email,
      subject: "Reset Password",
      text: `http://localhost:5173/resetpassword/${token}`,
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        res.status(500).json({ message: "Error to sent", error });
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }
    const hashedPassword = await bycrypt.hash(password, 10);
    await User.findByIdAndUpdate(user._id, { password: hashedPassword });
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Invalid Token", error });
  }
};

const verifyUser = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ status: false, message: "Unauthorized" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    res.status(200).json({ message: "User Verified", user });
  } catch (error) {
    res.status(500).json({ message: "Invalid Token", error });
  }
};

const userLogout = async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ status: true, message: "User Logged Out" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  userRegister,
  loginUser,
  forgotPassword,
  resetPassword,
  verifyUser,
  userLogout,
};
