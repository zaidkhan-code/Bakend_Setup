import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});
const uploadOnCloudinary = async (localFileData) => {
  try {
    const result = await cloudinary.uploader.upload(localFileData, {
      resource_type: "auto",
    });
    console.log("file is uploaded on cludnary", result.url);
    return result;
  } catch {
    fs.unlinkSync(localFileData);
  }
};
