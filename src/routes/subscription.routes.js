import { Router } from "express";
const router = Router();
import { verifyJWT } from "../middlewares/auth.middleware";

router.use(verifyJWT);
router
  .route("c/:channelId")
  .get(getUserChannelSubscriber)
  .post(toggleSubscription);

router.route("u//:subscriberId").get(getSubscribedChannels);

export default router;
