import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";

//Post Tweet
const postTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content) {
    throw new ApiError(403, "Content is required");
  }
  const tweet = await Tweet.create({
    content,
    owner: req.user?._id,
  });
  if (!tweet) {
    throw new ApiError(500, "Something went wrong Please try again ");
  }
  res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet posted Successfully"));
});

//update Tweet
const updateTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { tweetId } = req.params;
  if (!content) {
    throw new ApiError(403, "Content is required");
  }
  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(403, "Tweet Not found");
  }
  if (tweet.owner.toString() != req.user?._id.toString()) {
    throw new ApiError(400, "You don't fave permission to updated this Tweet");
  }
  const updatedTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: {
        content: content,
      },
    },
    {
      new: true,
    }
  );
  if (!updatedTweet) {
    throw new ApiError(
      500,
      "Something went wrong while updating Tweet Please Try again"
    );
  }
  res
    .status(200)
    .json(new ApiResponse(200, updatedTweet, "Tweet Updated Successfully"));
});

//getUserTweet

export { postTweet, updateTweet };
