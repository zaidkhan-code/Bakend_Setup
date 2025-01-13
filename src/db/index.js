import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";
export const connectDB = async () => {
  try {
    const connectionInstace = await mongoose.connect(
      `${process.env.MONGODB_URL}/${DB_NAME}`
    );
    console.log(`connection instance ${connectionInstace}`);
  } catch (error) {
    console.log("ERROR fail to connect ", error);
    throw error;
  }
};
