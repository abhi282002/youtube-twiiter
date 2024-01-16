import { Router } from "express";
const router = Router();
import { verifyJWT } from "../middlewares/auth.middleware.js";
router.use(verifyJWT);
import { createVideo, getVideoById } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
router.route("/").post(
  upload.fields([
    {
      name: "videoFile",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  createVideo
);
router.route("/v/:videoId").get(getVideoById);

export default router;
