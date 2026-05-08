import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Topic } from "../models/topic.model.js";
import { PDF } from "../models/pdf.model.js";
import { pdfQueue } from "../utils/queue.js";
import { getPresignedUrl } from "../utils/getPresignedUrl.js";

const uploadPdf = asyncHandler(async (req, res) => {
  const { title } = req.body;
  const owner = req.user._id;
  const file = req.file?.path;
  const topic = req.params.topicId;
  console.log(title, file);

  if (!file) throw new ApiError(400, "All fields are required");
  const user = await User.findById(owner);
  if (!user) throw new ApiError(404, "User not found");

  const topicExists = await Topic.findById(topic);
  if (!topicExists) throw new ApiError(404, "Topic not found");
  const pdf = await PDF.create({ owner, topic, file, title });

  pdfQueue.add("pdf-upload", {
    pdfId: pdf._id,
    pdfLocalPath: file,
  });

  return res.status(201).json(new ApiResponse(201, pdf, "PDF uploaded successfully"));
});

const getPdf = asyncHandler(async (req, res) => {
  const { pdfId } = req.params;
  const owner = req.user._id;
  const pdf = await PDF.findOne({ _id: pdfId, owner });
  if (!pdf) throw new ApiError(404, "PDF not found");

  const url = await getPresignedUrl(pdf.file);
  if (!url) throw new ApiError(404, "PDF URL not found");

  return res.status(200).json(new ApiResponse(200, { pdf, url }, "PDF fetched successfully"));
});

const getAllPdfs = asyncHandler(async (req, res) => {
  const owner = req.user._id;
  const topic = req.params.topicId;
  const pdfs = await PDF.find({ owner, topic });
  return res.status(200).json(new ApiResponse(200, pdfs, "PDFs fetched successfully"));
});

const updatePdf = asyncHandler(async (req, res) => {
  const { pdfId } = req.params;
  const owner = req.user._id;
  const pdf = await PDF.findOne({ _id: pdfId, owner });
  if (!pdf) throw new ApiError(404, "PDF not found");
  const { notes } = req.body;
  pdf.notes = notes;
  await pdf.save();
  return res.status(200).json(new ApiResponse(200, pdf, "PDF updated successfully"));
});

export { uploadPdf, getPdf, getAllPdfs, updatePdf };
