import fs from "fs";
import FormData from "form-data";
import { config } from "../../configs/config.js";
import axios from "axios";

export const uploadToOpeninary = async (localFilePath) => {
  if (!localFilePath) return null;

  try {
    console.log(localFilePath);
    const form = new FormData();

    // EXACTLY like Postman
    form.append("files", fs.createReadStream(localFilePath));
    form.append("folder", "doitnowavatar");
    form.append("transformations", "w_300,h_300,c_fill");

    const response = await axios.post("https://openinary.kanrarmcbackend.sbs/api/upload", form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${config.OPENINARY_API}`,
      },
    });

    console.log("Status:", response.data.success);

    if (!response.data.success) {
      throw new Error("Upload failed");
    }

    fs.unlinkSync(localFilePath);

    return response.data.files?.[0]?.prewarmedUrls?.[0] || response.data.files?.[0]?.url;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};
