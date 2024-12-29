const express = require("express");
const mongoose = require("mongoose");
const dotEnv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");

dotEnv.config();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

const userRoutes = require("./routes/userRoutes");

app.use(express.json());
app.use(cookieParser());
mongoose
  .connect(process.env.DATABASE_CONNECTION)
  .then(() => {
    console.log("Database Connected");
  })
  .catch((err) => {
    console.log(err);
  });

app.use("/users", userRoutes);
app.listen(process.env.PORT, () => {
  console.log(`Server is Running on PORT ${PORT}`);
});
