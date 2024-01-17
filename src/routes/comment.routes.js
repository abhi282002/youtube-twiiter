import { Router } from "express";
const router = Router();
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getVideoComment,
  postComment,
} from "../controllers/comment.controller.js";
//verify jwt
router.use(verifyJWT);

router.route("/:videoId").get(getVideoComment).post(postComment);

export default router;
