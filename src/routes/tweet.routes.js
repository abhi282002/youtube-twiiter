import { Router } from "express";
const router = Router();
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getUserTweet,
  postTweet,
  updateTweet,
} from "../controllers/tweet.controller.js";
//verify jwt
router.use(verifyJWT);

router.route("/").post(postTweet);
router.route("/:tweetId").patch(updateTweet);
router.route("/user/:userId").get(getUserTweet);
export default router;
