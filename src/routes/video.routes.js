import { Router } from "express";
const router = Router();
import { verifyJWT } from "../middlewares/auth.middleware.js";
router.use(verifyJWT);
import {
  createVideo,
  deleteVideo,
  getVideoById,
  toggleIsPublished,
  updateVideo,
} from "../controllers/video.controller.js";
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
router
  .route("/v/:videoId")
  .get(getVideoById)
  .delete(deleteVideo)
  .patch(upload.single({ name: "thumbnail", maxCount: 1 }), updateVideo);
router.route("/toggle/publish/:videoId").patch(toggleIsPublished);
export default router;
