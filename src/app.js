import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
//common name
const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

//forms se data aye to
app.use(
  express.json({
    limit: "16kb",
  })
);
//url se data aye to
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

//file folder store or assets
app.use(express.static("public"));

//cookie se data
app.use(cookieParser());
export { app };
