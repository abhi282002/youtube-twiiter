import { Router } from "express";
const router = Router();
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addVideoToPlaylist,
  createPlaylist,
  updatePlaylist,
  getUserPlaylists,
} from "../controllers/playlist.controller.js";

router.use(verifyJWT);

router.route("/").post(createPlaylist);
router.route("/:playlistId").patch(updatePlaylist);
router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist);
router.route("/user/:userId").get(getUserPlaylists);
export default router;
