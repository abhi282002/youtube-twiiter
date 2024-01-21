import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { Like } from "../models/like.model.js";
import mongoose, { isValidObjectId } from "mongoose";
//like unlike video
const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(403, "This video id is not valid");
  }
  const video = await Video.findById(videoId);
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
        `${req.user?.fullName} ${like ? "Like" : "Unlike"} Your Video`
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
        `${req.user?.fullName} ${like ? "Like" : "Unlike"} Your Comment`
      )
    );
});

//like unlike tweet
const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(403, "tweetId is not valid");
  }

  const alreadyLike = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user?._id,
  });

  let like;
  let unlike;
  if (alreadyLike) {
    unlike = await Like.findByIdAndDelete(alreadyLike?._id);

    if (!unlike) {
      throw new ApiError(500, "Dislike Unsuccess Please try again");
    }
  } else {
    like = await Like.create({
      tweet: tweetId,
      likedBy: req.user?._id,
    });
    if (!like) {
      throw new ApiError(500, "Like Unsuccess Please try again");
    }
  }
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        `${req.user?.fullName} ${like ? "Like" : "Unlike"} Your Tweet`
      )
    );
});

//get All liked Video
const getAllLikedVideo = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const likedVideo = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "likedVideo",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
            },
          },

          {
            $unwind: "$owner",
          },
        ],
      },
    },
    {
      $unwind: "$likedVideo",
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $project: {
        likedVideo: {
          _id: 1,
          "videoFile.url": 1,
          "thumbnail.url": 1,
          title: 1,
          description: 1,
          duration: 1,
          views: 1,
          createdAt: 1,
          owner: {
            username: 1,
            fullName: 1,
            avatar: 1,
          },
        },
      },
    },
  ]);
  res
    .status(200)
    .json(new ApiResponse(200, likedVideo, "Liked Video Fetch Successfully"));
});

export {
  toggleVideoLike,
  toggleTweetLike,
  toggleCommentLike,
  getAllLikedVideo,
};
