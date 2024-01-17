import { Router } from "express";
const router = Router();
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  deleteVideoComment,
  getVideoComment,
  postComment,
  updateVideoComment,
} from "../controllers/comment.controller.js";
//verify jwt
router.use(verifyJWT);

router.route("/:videoId").get(getVideoComment).post(postComment);
router
  .route("/c/:commentId")
  .patch(updateVideoComment)
  .delete(deleteVideoComment);
export default router;
