import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { Like } from "../models/like.model.js";
import { isValidObjectId } from "mongoose";
//like unlike video
const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(403, "This video id is not valid");
  }
  const video = await Video.findOne({ "videoFile.public_id": videoId });
  const alreadyLike = await Like.findOne({
    video: video._id,
    likedBy: req.user._id,
  });
  let like;
  let unlike;
  if (alreadyLike) {
    unlike = await Like.findByIdAndDelete(alreadyLike?._id);
    if (!unlike) {
      throw new ApiError(500, "Something went wrong While Unlike this video");
    }
  } else {
    like = await Like.create({
      video: video._id,
      likedBy: req.user?._id,
    });
  }
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        `User ${like ? "like" : "Unlike"} video successfully`
      )
    );
});

//like unlike comment
const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(403, "This comment id is not valid");
  }

  const alreadyLike = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });
  let like;
  let unlike;
  if (alreadyLike) {
    unlike = await Like.findByIdAndDelete(alreadyLike?._id);
    if (!unlike) {
      throw new ApiError(500, "Something went wrong While Unlike this comment");
    }
  } else {
    like = await Like.create({
      comment: commentId,
      likedBy: req.user?._id,
    });
  }
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        `User ${like ? "like" : "Unlike"} comment successfully`
      )
    );
});

export { toggleVideoLike, toggleCommentLike };
