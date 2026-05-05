import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Topic } from "../models/topic.model.js";

const createTopic = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const owner = req.user._id;
  console.log(owner);

  const user = await User.findById(owner);
  if (!user) throw new ApiError(404, "User not found");

  if (!title || !description) throw new ApiError(400, "All fields are required");

  const existingTopic = await Topic.findOne({ owner, title });
  if (existingTopic) throw new ApiError(409, "Topic already exists");

  const topic = await Topic.create({ owner, title, description });

  return res.status(201).json(new ApiResponse(201, topic, "Topic created successfully"));
});

const getAllTopics = asyncHandler(async (req, res) => {
  const topics = await Topic.find({ owner: req.user._id });
  return res.status(200).json(new ApiResponse(200, topics, "Topics fetched successfully"));
});

const getTopic = asyncHandler(async (req, res) => {
  console.log(req.user._id);
  const topic = await Topic.findById(req.params.id);
  return res.status(200).json(new ApiResponse(200, topic, "Topic fetched successfully"));
});

const updateTopic = asyncHandler(async (req, res) => {
  const { title, description, isFavorite, isCompleted } = req.body;
  const topic = await Topic.findByIdAndUpdate(
    req.params.id,
    { title, description, isFavorite, isCompleted },
    { returnDocument: "after" },
  );
  return res.status(200).json(new ApiResponse(200, topic, "Topic updated successfully"));
});

const deleteTopic = asyncHandler(async (req, res) => {
  const topic = await Topic.findByIdAndDelete(req.params.id);
  if (!topic) throw new ApiError(404, "Topic not found");
  return res.status(200).json(new ApiResponse(200, topic, "Topic deleted successfully"));
});

export { createTopic, getAllTopics, getTopic, updateTopic, deleteTopic };
