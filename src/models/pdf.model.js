import mongoose, { Schema } from "mongoose";

const pdfSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    topic: {
      type: Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
    },
    file: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
      required: false,
    },
    notes: {
      type: String,
      default: "<p>This is where you write your notes...</p>",
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const PDF = mongoose.models?.PDF || mongoose.model("PDF", pdfSchema);
