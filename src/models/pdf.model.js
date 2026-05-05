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
    description: {
      type: String,
      required: true,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const PDF = mongoose.models?.PDF || mongoose.model("PDF", pdfSchema);
