// import mongoose from "mongoose";
// import { DB_NAME } from "../constant.js";
// export const connectDB = async () => {
//   try {
//     const connectionInstace = await mongoose.connect(
//       `${process.env.MONGODB_URL}/${DB_NAME}`
//     );
//     console.log(`connection instance ${connectionInstace}`);
//   } catch (error) {
//     console.log("ERROR fail to connect ", error);
//     throw error;
//   }
// };
import mongoose from "mongoose";
import { User } from "../models/user.modal.js";
import { DB_NAME } from "../constant.js";
import bcrypt from "bcrypt";
export const connectDB = async (DATABASE_URL, DATABASE) => {
  try {
    const DB_OPTIONS = {
      dbName: DATABASE,
    };

    mongoose.set("strictQuery", false);
    await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);

    let adminExisting = await User.find({ role: "admin" });
    if (adminExisting.length <= 0) {
      const phoneNumber = 7874263694;
      const name = "Admin Account";
      const username = "admin@gmail.com";
      const password = "admin123";
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      // Create a new user
      const user = new User({
        _id: new mongoose.Types.ObjectId("64d33173fd7ff3fa0924a109"),
        username,
        password: hashedPassword,
        fullName: "Admin Account",
        email: "zaidkhan1357913579@gmail.com",
        role: "admin",
      });
      // Save the user to the database
      await user.save();
      console.log("Admin created successfully..");
    } else if (adminExisting[0].deleted === true) {
      await User.findByIdAndUpdate(adminExisting[0]._id, { deleted: false });
      console.log("Admin Update successfully..");
    } else if (adminExisting.username !== "admin@gmail.com") {
      await User.findByIdAndUpdate(adminExisting[0]._id, {
        username: "admin@gmail.com",
      });
      console.log("Admin Update successfully..");
    }

    console.log("Database Connected Successfully..");
  } catch (err) {
    console.log("Database Not connected", err.message);
  }
};
