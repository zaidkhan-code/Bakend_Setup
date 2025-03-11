import { AsynHandler } from "../utils/AsynHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.modal.js";
const Verifyjwt = AsynHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new ApiError(200, "unathorize request ");
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      throw new ApiError(401, "invalid Access token");
    }
    req.use = user;
    next();
  } catch (error) {
    throw new ApiError(401, "invalid Access token");
  }
});
export default Verifyjwt;
