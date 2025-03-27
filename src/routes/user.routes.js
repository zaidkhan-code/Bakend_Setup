import { Router } from "express";
import {
  registerUser,
  loginuser,
  getAllUsers,
  updateUser,
  logoutUser,
  ChangePassword,
  GetRefreshAndAccessToken,
} from "../controllers/user.controller.js";
import Verifyjwt from "../middleware/auth.meddleware.js";
import { upload } from "../middleware/multer.middleware.js";
const router = Router();
router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);
router.route("/login").post(loginuser);
router.route("/logout").post(Verifyjwt, logoutUser);
router.route("/changepassword").post(Verifyjwt, ChangePassword);
router.route("/get-token").post(GetRefreshAndAccessToken);
router.route("/getalluser").get(getAllUsers);
router.route("/register/:userId").put(updateUser);
export default router;
