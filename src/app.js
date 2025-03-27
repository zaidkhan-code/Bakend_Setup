import express from "express";
const app = express();
import cors from "cors";
import leadRoutes from "./routes/lead.routes.js";
import cookieParser from "cookie-parser";
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json({ limit: "20kb" }));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(cookieParser());
import userRoutes from "./routes/user.routes.js";
app.use("/api", leadRoutes);
app.use("/api/v1/user/", userRoutes);
export { app };
