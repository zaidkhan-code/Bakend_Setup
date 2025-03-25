import { AsynHandler } from "../utils/AsynHandler.js";
import { User } from "../models/user.modal.js";
import { uploadOnCloudinary } from "../utils/Cloudnary.js";
import { Vedio } from "../models/vedio.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
// import { errorResponse } from "../utils/errorResponse.js";
import { errorResponse } from "../utils/response.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccesTokenAndRefereshToken = async (useId) => {
  try {
    const user = await User.findById(useId);
    const accessToken = user.generateAccesToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { refreshToken, accessToken };
  } catch (error) {
    // return res.status(500).json({ error: "Server error" });
  }
};
const registerUser = AsynHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    return res.status(400).json({ error: "Fill every field" });
  }

  // Ensure username and email are unique
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    return res.status(400).json({
      error: `User with ${
        existedUser.username === username ? "username" : "email"
      } already exists.`,
    });
  }

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    return res.status(400).json({ error: "Avatar file is required" });
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    return res.status(500).json({ error: "Avatar file upload failed" });
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username?.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    return res.status(500).json({ error: "Error creating user" });
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});
const logoutUser = AsynHandler(async (req, res) => {
  let options = {
    httpOnly: true,
    secure: true,
  };
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    { new: true }
  );
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});
const GetRefreshAndAccessToken = AsynHandler(async (req, res) => {
  let options = {
    httpOnly: true,
    secure: true,
  };
  const inComingRefreshToken = req.cookies?.token || res.body?.refreshToken;
  try {
    const decodedToken = jwt.verify(
      inComingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = User.findById(decodedToken._id);
    if (!user) {
      return res.status(404).json({ error: "invalid token" });
    }
    const { refreshToken, accessToken } =
      await generateAccesTokenAndRefereshToken(req.user?._id);
    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(new ApiResponse());
  } catch (error) {}
});
const loginuser = AsynHandler(async (req, res) => {
  const { email, username, password } = req.body;
  console.log(req.body);
  if (!username) {
    return res
      .status(500)
      .json({ error: "email and user name does not be empty" });
  }
  const user = await User.findOne({
    $or: [{ email }, { username }],
  });
  console.log(user, "check user if exist");
  if (!user) {
    return errorResponse(404, "user does not exist");
  }
  const isPasswordvalid = await user.isPasswordCorrect(password);
  if (!isPasswordvalid) {
    return res.status(500).json({ error: "invalid credential" });
  }
  const { refreshToken, accessToken } =
    await generateAccesTokenAndRefereshToken(user._id);
  const logdinUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  let options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { accessToken: accessToken, refreshToken },
        "Access token is refreshed"
      )
    );
});
const ChangePassword = AsynHandler(async (req, res) => {
  const { newpassword, oldPassword } = res.body;
  const user = await User.findById(req.user._id);
  const isPasswordCorrect = user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    res.status(404).json({ message: "invalid old password" });
  }
  user.password = newpassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "password change successfully"));
});
const GetCurrentUser = AsynHandler(async (req, res) => {
  const user = req.user;
  res.status(200).json(new ApiResponse(200), { user: user }, "current user");
});
const UpdateAccountDetail = AsynHandler(async (res, req) => {
  const { fullName, username, email } = req.body;
  if (!fullName || !email) {
    res.status(400).json({ message: "fullname or email is required" });
  }
  const user = await User.findByIdAndUpdate(
    res.user._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    {
      new: true,
    }
  ).select("-password");
  res
    .status(200)
    .json(new ApiResponse(200, { user }, "user is successfully updated"));
});
const UpdatedAvatar = AsynHandler(async (req, res) => {
  const path = req.files.avatar[0].path;
  const uploadfile = await uploadOnCloudinary(path);
  if (!uploadfile) {
    return res.status(400, { message: "avatar is required " });
  }

  const user = await User.findByIdAndUpdate(req.user?._id, {
    $set: {
      avatar: uploadfile.url,
    },
  }).select("-password");
  res
    .status(200)
    .json(new ApiResponse(200, user, "avatar is successfully updated"));
});
const getUserChannelProfile = AsynHandler(async (req, res) => {
  const { username } = req.params;
  if (!username?.trim()) {
    res.status(404).json({ message: "user is requied field" });
  }
  const Channel = await User.aggregate([
    {
      $match: {
        username: username.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subsciber",
        as: "subscribeto",
      },
    },
    {
      $addFields: {
        subscriberCount: {
          $size: "$subscribers",
        },
        channelCount: {
          $size: "$subscribeto",
        },
        isSubcibed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);
  if (!Channel?.length) {
    throw new ApiError(404, "channel does not exists");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, Channel[0], "User channel fetched successfully")
    );
});
const getwatchedVideos = AsynHandler(async (req, res) => {
  const { username } = req.params;
  const WachedHistory = await User.aggregate([
    {
      $match: {
        _id: mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "vedios",
        localField: "watchHistory",
        foreignField: "_id",
        as: "warchedVedios",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
            },
          },
        ],
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        WachedHistory[0],
        "User watchhistory fetched successfully"
      )
    );
});
export {
  registerUser,
  UpdateAccountDetail,
  getUserChannelProfile,
  loginuser,
  logoutUser,
  GetRefreshAndAccessToken,
  ChangePassword,
  GetCurrentUser,
  UpdatedAvatar,
};
