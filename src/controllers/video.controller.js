import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";

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
  });
  res
    .status(200)
    .json(new ApiResponse(200, video, "Video Published Successfully"));
});

export { createVideo };
