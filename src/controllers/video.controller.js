import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";
import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Playlist } from "../models/playlist.model.js";
import { getUserTweet } from "./tweet.controller.js";

//get all videos

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query = `/^video/`,
    sortBy,
    sortType,
    userId,
  } = req.query;

  const pipeline = [];
  if (userId) {
    if (!isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid UserId");
    }
    pipeline.push({
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    });
  }
  pipeline.push({
    $match: {
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    },
  });

  //fetch all is Published Video
  pipeline.push({
    $match: {
      isPublished: true,
    },
  });

  if (sortBy && sortType) {
    pipeline.push({
      $sort: {
        [sortBy]: sortType === "asc" ? 1 : -1,
      },
    });
  } else {
    pipeline.push({ $sort: { createdAt: -1 } });
  }

  const videoAggregrate = Video.aggregate(pipeline);
  console.log(videoAggregrate);
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };

  const video = await Video.aggregatePaginate(videoAggregrate, options);
  res.status(200).json(new ApiResponse(200, video, "get all videos"));
});

//toggle published video
const toggleIsPublished = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(403, "VideoId is not valid");
  }
  const video = await Video.findById(videoId);
  if (video.owner.toString() != req.user?._id.toString()) {
    throw new ApiError(403, "You don't have permission to update this video");
  }

  await Video.findByIdAndUpdate(
    video._id,
    {
      $set: {
        isPublished: !video?.isPublished,
      },
    },
    {
      new: true,
    }
  );

  res
    .status(200)
    .json(new ApiResponse(200, {}, "toggle Published Successfully"));
});

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

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(403, "VideoId is not valid");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(403, "Video Id is Not Found");
  }
  if (video.owner.toString() != req.user?._id) {
    throw new ApiError(403, "You don't have permission to delete this video");
  }

  const playlist = await Playlist.findOne({ videos: video._id });
  if (playlist) {
    await Playlist.findByIdAndUpdate(
      playlist._id,
      {
        $pull: {
          videos: video._id,
        },
      },
      {
        new: true,
      }
    );
  }

  try {
    await Video.findByIdAndDelete(video._id);
  } catch (error) {
    throw new ApiError(500, error.message);
  }

  await deleteOnCloudinary(video.thumbnail.public_id);
  await deleteOnCloudinary(video.videoFile.public_id, "video");
  res.status(200).json(new ApiResponse(200, {}, "Video Deleted Successfully"));
});

//update video details
const updateVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(403, "Video Id is not valid");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(403, "Video is not Found");
  }
  const thumbnail = req.file.path;
  let thumbnailUrl;
  if (thumbnail) {
    await deleteOnCloudinary(video.thumbnail.public_id);
    thumbnailUrl = await uploadOnCloudinary(thumbnail);
    await Video.findByIdAndUpdate(
      video._id,
      {
        $set: {
          title: title,
          description: description,
          thumbnail: {
            url: thumbnailUrl.url,
            public_id: thumbnailUrl.public_id,
          },
        },
      },
      { new: true }
    );
  } else {
    await Video.findByIdAndUpdate(
      video._id,
      {
        $set: {
          title: title,
          description: description,
        },
      },
      { new: true }
    );
  }
  res
    .status(200)
    .json(new ApiResponse(200, {}, "Video Details updated Successfully"));
});

//get Video By Id
const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(403, "Invalid VideoId");
  }

  const video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
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
              avatar: 1,
              subscriberCount: 1,
              isSubscribed: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        likesCount: {
          $size: "$likes",
        },
        owner: {
          $first: "$owner",
        },
        isLiked: {
          $cond: {
            if: {
              $in: [req.user?._id, "$likes.likedBy"],
            },
            then: true,
            else: false,
          },
        },
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
        avatar: 1,
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

export {
  updateVideo,
  toggleIsPublished,
  createVideo,
  getVideoById,
  deleteVideo,
  getAllVideos,
};
