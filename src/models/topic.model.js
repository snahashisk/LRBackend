import mongoose, { Schema } from "mongoose";

const topicSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minLength: [5, "Title must be at least 5 characters long"],
      maxLength: [100, "Title must be at most 100 characters long"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minLength: [10, "Description must be at least 10 characters long"],
      maxLength: [1000, "Description must be at most 1000 characters long"],
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const Topic = mongoose.models?.Topic || mongoose.model("Topic", topicSchema);
