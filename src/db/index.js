import mongoose from "mongoose";
import { config } from "../../configs/config.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${config.MONGODB_URI}`);
    console.log("MongoDB connected !! DB Host: " + connectionInstance.connection.host);
  } catch (error) {
    console.error("MongoDB connection error", error);
    process.exit(1);
  }
};

export default connectDB;
