import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import mongoose, { isValidObjectId } from "mongoose";

//get Video By Comment
const getVideoComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(403, "VideoId Invalid");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(403, "Video not found");
  }

  const aggregateResult = Comment.aggregate([
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
  ]);

  const options = {
    page: page,
    limit: limit,
  };

  const result = await Comment.aggregatePaginate(aggregateResult, options);

  res
    .status(200)
    .json(new ApiResponse(200, result, "Comment Fetch successfully"));
});

const updateVideoComment = asyncHandler(async (req, res) => {
  const { updatedComment } = req.body;
  const { commentId } = req.params;
  if (!updatedComment) {
    throw new ApiError(403, "Comment is require");
  }
  if (!isValidObjectId(commentId)) {
    throw new ApiError(403, "CommentId Not valid");
  }
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(4403, "Comment Not Found");
  }
  if (comment?.owner.toString() != req.user?._id.toString()) {
    throw new ApiError(403, "You don't have permission to update this message");
  }
  await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content: updatedComment,
      },
    },
    {
      new: true,
    }
  );
  res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment Updated Successfully"));
});

const deleteVideoComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(403, "CommentId Not valid");
  }
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(4403, "Comment Not Found");
  }
  if (comment?.owner.toString() != req.user?._id.toString()) {
    throw new ApiError(403, "You don't have permission to update this message");
  }
  await Comment.findByIdAndDelete(commentId);
  res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment Deleted Successfully"));
});

const postComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(403, "VideoId Invalid");
  }
  if (!content) {
    throw new ApiError(403, "Content is required");
  }
  const video = await Video.findById(videoId);
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

export { getVideoComment, postComment, updateVideoComment, deleteVideoComment };
