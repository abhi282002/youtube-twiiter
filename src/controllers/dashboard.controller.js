import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Subscription } from "../models/subscription.model.js";
import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const subscriber = await Subscription.aggregate([
    {
      $match: { channel: new mongoose.Types.ObjectId(userId) },
    },
    {
      $group: {
        _id: null,
        subscriberCount: {
          $sum: 1,
        },
      },
    },
  ]);

  if (!subscriber) {
    throw new ApiError(500, "Error while fetching data");
  }

  const video = await Video.aggregate([
    {
      $match: { owner: new mongoose.Types.ObjectId(userId) },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $project: {
        totalLikes: {
          $size: "$likes",
        },
        totalViews: "$views",
        totalVideo: 1,
      },
    },
    {
      $group: {
        _id: null,
        totalLikes: {
          $sum: "$totalLikes",
        },
        totalViews: {
          $sum: "$totalViews",
        },
        totalVideo: {
          $sum: 1,
        },
      },
    },
  ]);
  if (!video) {
    throw new ApiError(500, "Error while fetching data");
  }
  const channelStats = {
    totalSubscribers: subscriber[0]?.subscriberCount || 0,
    totalLikes: video[0]?.totalLikes || 0,
    totalViews: video[0]?.totalViews || 0,
    totalVideos: video[0]?.totalVideo || 0,
  };
  res
    .status(200)
    .json(
      new ApiResponse(200, channelStats, "Chnnel Stats fetch Successfully")
    );
});

//getChannelAllUploaded Video
const getAllChannelVideo = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const channel = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $addFields: {
        createdAt: {
          $dateToParts: { date: "$createdAt" },
        },
        likesCount: {
          $size: "$likes",
        },
      },
    },
    {
      $project: {
        _id: 1,
        "videoFile.url": 1,
        "thumbnail.url": 1,
        title: 1,
        description: 1,
        createdAt: {
          year: 1,
          month: 1,
          day: 1,
        },
        isPublished: 1,
        likesCount: 1,
      },
    },
  ]);

  res
    .status(200)
    .json(
      new ApiResponse(200, channel, "All Channel Video Fetched Successfully")
    );
});
export { getChannelStats, getAllChannelVideo };
