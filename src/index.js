// require("dotenv").config({ path: "./env" });
import dotenv from "dotenv";
import connectDB from "./db/db.js";
import { app } from "./app.js";

dotenv.config({ path: "./.env" });
connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running at PORT:${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGODB CONNECTION FAILED!!!!!", err);
  });

// import express from "express";
// //use ifi to immediately execute
// const app = express();
// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//     app.on("ERROR:", (error) => {
//       console.log("ERROR:", error);
//       throw error;
//     });
//     app.listen(process.env.PORT, () => {
//       console.log(`App is listening on port ${process.env.PORT}`);
//     });
//   } catch (error) {
//     console.error("ERROR:", error);
//     throw error;
//   }
// })();
