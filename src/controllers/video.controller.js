import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";

//Publish Video
const createVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  if (!title && !description) {
    throw new ApiError(403, "Please upload title and description both");
  }
  console.log(req.files);
  const videoFile = req.files.videoFile[0].path;
  const thumbnail = req.files.thumbnail[0].path;
  if (!videoFile && !thumbnail) {
    throw new ApiError(403, "VideFile and thumnail is required");
  }
  let videoFileUrl;
  let thumbnailUrl;
  try {
    videoFileUrl = await uploadOnCloudinary(videoFile);
    thumbnailUrl = await uploadOnCloudinary(thumbnail);
    console.log(videoFileUrl);
    if (!thumbnailUrl || !videoFileUrl) {
      throw new ApiError(500, "Error while uploading video or thumbnail");
    }
  } catch (error) {
    throw new ApiError(500, error.message);
  }
  const video = await Video.create({
    videoFile: { url: videoFileUrl.url, public_id: videoFileUrl.public_id },
    thumbnail: { url: thumbnailUrl.url, public_id: thumbnailUrl.public_id },
    title,
    description,
    duration: videoFileUrl.duration,
    owner: req.user?._id,
    isPublished: true,
  });
  const videoId = await Video.findById(video?._id);
  if (!videoId) {
    throw new ApiError(500, "Video upload failed please try again");
  }
  res
    .status(200)
    .json(new ApiResponse(200, video, "Video Published Successfully"));
});

//get video by id

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  console.log(videoId);
  if (!videoId) {
    throw new ApiError(403, "Invalid VideoId");
  }

  const video = await Video.aggregate([
    {
      $match: {
        "videoFile.public_id": videoId,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $lookup: {
              from: "subscriptions",
              localField: "_id",
              foreignField: "channel",
              as: "Subscriber",
            },
          },
          {
            $addFields: {
              subscriberCount: {
                $size: "$Subscriber",
              },
              isSubscribed: {
                $cond: {
                  if: {
                    $in: [req.user?._id, "$Subscriber.subscriber"],
                  },
                  then: true,
                  else: false,
                },
              },
            },
          },
          {
            $project: {
              username: 1,
              "avatar.url": 1,
              subscriberCount: 1,
              isSubscribed: 1,
            },
          },
        ],
      },
    },
    {
      $project: {
        "videoFile.url": 1,
        "thumbnail.url": 1,
        title: 1,
        description: 1,
        duration: 1,
        views: 1,
        isPublished: 1,
        duration: 1,
        comments: 1,
        owner: 1,
        likesCount: 1,
        isLiked: 1,
        "avatar.url": 1,
        subscriberCount: 1,
        isSubscribed: 1,
      },
    },
  ]);

  if (!video) {
    throw new ApiError(500, "Failed to fetch video");
  }

  try {
    const updatedVideo = await Video.findByIdAndUpdate(
      new mongoose.Types.ObjectId(video[0]._id),
      {
        $inc: {
          views: 1,
        },
      },
      { new: true } // This option returns the modified document
    );
    video[0].views = updatedVideo.views;
    console.log(updatedVideo);
    await User.findByIdAndUpdate(
      req.user?._id,
      {
        $addToSet: {
          watchHistory: video[0]._id,
        },
      },
      {
        new: true,
      }
    );
  } catch (error) {
    console.error("Error while processing:", error);
    throw new ApiError(500, "Error While Processing");
  }
  console.log(video);
  res.status(200).json(new ApiResponse(200, video[0], "Video get Sucessfully"));
});

export { createVideo, getVideoById };
