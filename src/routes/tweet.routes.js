import { Router } from "express";
const router = Router();
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { postTweet, updateTweet } from "../controllers/tweet.controller.js";
//verify jwt
router.use(verifyJWT);

router.route("/").post(postTweet);
router.route("/:tweetId").patch(updateTweet);
export default router;
