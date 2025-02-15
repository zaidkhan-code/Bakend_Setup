import mongoose from "mongoose";
import { connectDB } from "./db/index.js";
import { app } from "./app.js";
import dotenv from "dotenv";
dotenv.config({ path: "./env" });
connectDB()
  .then(() => {
    app.listen(process.env.PORT || 5000, () => {
      console.log(`server is completely connected at ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("Mongodb connection failed");
  });
