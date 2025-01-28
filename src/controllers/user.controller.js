import { AsynHandler } from "../utils/AsynHandler.js";
const registerUser = AsynHandler(async (req, res) => {
  res.status(200).json({
    messages: "check data mester zaid",
  });
});
export { registerUser };
