import { Router } from "express";
const router = Router();
import { verifyJWT } from "../middlewares/auth.middleware.js";
router.use(verifyJWT);
import {
  createVideo,
  deleteVideo,
  getAllVideos,
  getVideoById,
  toggleIsPublished,
  updateVideo,
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
router
  .route("/")
  .get(getAllVideos)
  .post(
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
  .patch(upload.single("thumbnail"), updateVideo);
router.route("/toggle/publish/:videoId").patch(toggleIsPublished);
export default router;
