import express from "express";
const app = express();
import cors from "cors";
import cookieParser from "cookie-parser";
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
  })
);
app.use(express.json({ limit: "20kb" }));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(cookieParser());
export { app };
