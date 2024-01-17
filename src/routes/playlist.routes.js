import { Router } from "express";
const router = Router();
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createPlaylist,
  updatePlaylist,
} from "../controllers/playlist.controller.js";

router.use(verifyJWT);

router.route("/").post(createPlaylist);
router.route("/:playlistId").patch(updatePlaylist);

export default router;
