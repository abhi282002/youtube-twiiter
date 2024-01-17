import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Playlist } from "../models/playlist.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name || !description) {
    throw new ApiError(403, "Either name or description is missing");
  }
  const playlist = await Playlist.create({
    name,
    description,
    owner: req.user?._id,
  });
  console.log(playlist);
  if (!playlist) {
    new ApiError(
      500,
      "Something went wrong while creating Playlist Please Try again"
    );
  }
  res.status(200).json(new ApiResponse(200, playlist, "Playlist created"));
});
const updatePlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const { playlistId } = req.params;
  if (!name || !description) {
    throw new ApiError("403", "Either name or description is missing");
  }
  const playlist = await Playlist.findById(playlistId);
  console.log(playlist);
  if (playlist.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "You don't have permission to update playlist");
  }
  if (!playlist) {
    throw new ApiError(403, "Playlist not found");
  }
  await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name: name,
        description: description,
      },
    },
    {
      new: true,
    }
  );
  res.status(200).json(new ApiResponse(200, {}, "Playlist Updated"));
});

export { createPlaylist, updatePlaylist };
