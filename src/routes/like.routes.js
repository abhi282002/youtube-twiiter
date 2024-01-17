import { Router } from "express";
const router = Router();
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getSubscribedChannels } from "../controllers/subscription.controller.js";

//verify jwt
router.use(verifyJWT);
