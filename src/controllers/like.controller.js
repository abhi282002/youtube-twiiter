import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { Like } from "../models/like.model.js";

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

export { toggleVideoLike };
