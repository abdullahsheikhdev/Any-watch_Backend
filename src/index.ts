import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDB from "./config/mongodb.js";
import authRouter from "./routers/authRouters.js";
import adminRouter from "./routers/adminRouters.js";
import { initializeAdmin } from "./utils/initAdmin.js";

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Api is running successfully");
});

app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);

const startServer = async () => {
  try {
    await connectDB();

    await initializeAdmin();

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
};
