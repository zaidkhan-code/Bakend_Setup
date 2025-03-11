import { AsynHandler } from "../utils/AsynHandler.js";
import { User } from "../models/user.modal.js";
import { uploadOnCloudinary } from "../utils/Cloudnary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
// import { errorResponse } from "../utils/errorResponse.js";
import { errorResponse } from "../utils/response.js";

const generateAccesTokenAndRefereshToken = async (useId) => {
  try {
    const user = await User.findById(useId);
    const accessToken = user.generateAccesToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { refreshToken, accessToken };
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
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
        { user: logdinUser, refreshToken, accessToken },
        "user is successfully login"
      )
    );
});
export { registerUser, loginuser, logoutUser };
