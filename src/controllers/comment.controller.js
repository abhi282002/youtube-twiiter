import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import mongoose from "mongoose";

const getVideoComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  if (!videoId) {
    throw new ApiError(403, "VideoId Invalid");
  }
  const video = await Video.findOne({ "videoFile.public_id": videoId });
  if (!video) {
    throw new ApiError(403, "Video not found");
  }

  const pipeline = [
    {
      $match: {
        video: new mongoose.Types.ObjectId(video?._id),
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
        owner: {
          $first: "$owner",
        },
      },
    },
    {
      $project: {
        content: 1,
        createdAt: 1,
        owner: {
          username: 1,
          avatar: 1,
          fullName: 1,
        },
      },
    },
    {
      $skip: (page - 1) * limit,
    },
    {
      $limit: limit,
    },
  ];

  const aggregateResult = await Comment.aggregate(pipeline);
  console.log(aggregateResult);
  const result = await Comment.aggregatePaginate(aggregateResult, {
    page,
    limit,
  });
  console.log(result, aggregateResult);
  result.docs = aggregateResult;

  res
    .status(200)
    .json(new ApiResponse(200, result, "Comment Fetch successfully"));
});

const postComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;
  if (!videoId) {
    throw new ApiError(403, "VideoId Invalid");
  }
  if (!content) {
    throw new ApiError(403, "Content is required");
  }
  const video = await Video.findOne({ "videoFile.public_id": videoId });
  if (!video) {
    throw new ApiError(403, "Video not found");
  }
  const comment = await Comment.create({
    content,
    video: video._id,
    owner: req.user?._id,
  });
  if (!comment) {
    throw new ApiError(500, "Error while processing");
  }
  res.status(200).json(new ApiResponse(200, comment, "Comment Added"));
});

export { getVideoComment, postComment };
