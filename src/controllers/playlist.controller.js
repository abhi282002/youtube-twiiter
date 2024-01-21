import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Playlist } from "../models/playlist.model.js";
import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";

//create playlist
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

//update playlist
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

//TODO:delete playlist
const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(200, "Playlist Id is not valid");
  }
  const playlist = await Playlist.findByIdAndDelete(playlistId);
  res.status(200).json(200, {}, "Playlist Deleted Successfully");
});

//add video into playlist
const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { videoId, playlistId } = req.params;
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(403, "PlaylistId is not valid");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(403, "Video Id is not valid");
  }
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(403, "Playlist is not found");
  }
  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(403, "Video is not found");
  }
  if (
    (playlist.owner?.toString() && video.owner.toString()) !==
    req.user?._id.toString()
  ) {
    throw new ApiError(400, "only owner can add video into playlist");
  }
  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $addToSet: {
        videos: videoId,
      },
    },
    {
      new: true,
    }
  );
  if (!updatedPlaylist) {
    throw new ApiError(400, "failed to add video to playlist please try again");
  }
  res
    .status(200)
    .json(new ApiResponse(200, updatePlaylist, "Video Added Successfully"));
});

//remove video from playlist
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { videoId, playlistId } = req.params;
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(403, "Video Id or PlaylistId is not valid");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(403, "Video Id is not valid");
  }
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(403, "Playlist is not found");
  }
  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(403, "Video is not found");
  }
  if (
    (playlist.owner?.toString() && video.owner.toString()) !==
    req.user?._id.toString()
  ) {
    throw new ApiError(400, "only owner can add video into playlist");
  }
  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: {
        videos: video?._id,
      },
    },
    {
      new: true,
    }
  );
  if (!updatedPlaylist) {
    throw new ApiError(
      400,
      "failed to delete video from playlist please try again"
    );
  }
  res
    .status(200)
    .json(new ApiResponse(200, updatePlaylist, "Video Deleted Successfully"));
});

//get UserPlaylist
const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!isValidObjectId(userId)) {
    throw new ApiError(403, "Userid is not valid");
  }
  const playlist = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
      },
    },
    {
      $match: {
        "videos.isPublished": true,
      },
    },
    {
      $addFields: {
        totalVideos: {
          $size: "$videos",
        },
        totalViews: {
          $sum: "$videos.views",
        },
      },
    },
    {
      $project: {
        _id: 1,
        totalVideos: 1,
        totalViews: 1,
        name: 1,
        description: 1,
        updatedAt: 1,
      },
    },
  ]);
  res
    .status(200)
    .json(new ApiResponse(200, playlist, "User playlist fetched Successfully"));
});

//getPlaylist by Id
const getPlayListById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId)) {
    throw new ApiError("Playlist Id is not valid");
  }
  const playlist = await Playlist.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(playlistId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
      },
    },
    {
      $match: {
        "videos.isPublished": true,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $addFields: {
        totalVideo: {
          $size: "$videos",
        },
        totalViews: {
          $sum: "$videos.views",
        },
        owner: {
          $first: "$owner",
        },
      },
    },
    {
      $project: {
        name: 1,
        description: 1,
        createdAt: 1,
        updatedAt: 1,
        totalVideo: 1,
        totalViews: 1,
        videos: {
          _id: 1,
          "videoFile.url": 1,
          "thumbnail.url": 1,
          title: 1,
          description: 1,
          duration: 1,
          createdAt: 1,
          views: 1,
        },
        owner: {
          username: 1,
          fullName: 1,
          "avatar.url": 1,
        },
      },
    },
  ]);

  res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetched Successfully"));
});

export {
  createPlaylist,
  updatePlaylist,
  addVideoToPlaylist,
  getUserPlaylists,
  removeVideoFromPlaylist,
  getPlayListById,
  deletePlaylist,
};
