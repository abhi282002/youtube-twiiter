import { Router } from "express";
const router = Router();
import { verifyJWT } from "../middlewares/auth.middleware.js";

import {
  toggleVideoLike,
  toggleCommentLike,
  toggleTweetLike,
  getAllLikedVideo,
} from "../controllers/like.controller.js";

//verify jwt
router.use(verifyJWT);

router.route("/toggle/v/:videoId").post(toggleVideoLike);
router.route("/toggle/c/:commentId").post(toggleCommentLike);
router.route("/toggle/t/:tweetId").post(toggleTweetLike);
router.route("/videos").get(getAllLikedVideo);
export default router;
