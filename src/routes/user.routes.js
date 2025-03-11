import { Router } from "express";
import {
  registerUser,
  loginuser,
  logoutUser,
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
export default router;
