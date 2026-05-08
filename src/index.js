import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import { startAvatarWorker, startOtpEmailWorker, startPdfWorker } from "./utils/worker.js";

dotenv.config();

const PORT = process.env.PORT || 8000;

// Initialize background workers
startAvatarWorker();
startOtpEmailWorker();
startPdfWorker();

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("MongoDB connection error", error);
    process.exit(1);
  });
