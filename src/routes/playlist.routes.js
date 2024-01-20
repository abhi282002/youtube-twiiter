import { Router } from "express";
const router = Router();
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addVideoToPlaylist,
  createPlaylist,
  updatePlaylist,
  getUserPlaylists,
  removeVideoFromPlaylist,
  getPlayListById,
  deletePlaylist,
} from "../controllers/playlist.controller.js";

router.use(verifyJWT);

router.route("/").post(createPlaylist);
router
  .route("/:playlistId")
  .patch(updatePlaylist)
  .get(getPlayListById)
  .delete(deletePlaylist);
router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist);
router.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist);
router.route("/user/:userId").get(getUserPlaylists);
export default router;
