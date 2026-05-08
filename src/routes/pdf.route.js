import { Router } from "express";
import { getPdf, uploadPdf, getAllPdfs, updatePdf } from "../controllers/pdf.controller.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const pdfRouter = Router();

pdfRouter.route("/upload-pdf/:topicId").post(verifyAccessToken, upload.single("pdf"), uploadPdf);
pdfRouter.route("/get-pdf/:pdfId").get(verifyAccessToken, getPdf);
pdfRouter.route("/get-all-pdfs/:topicId").get(verifyAccessToken, getAllPdfs);
pdfRouter.route("/update-pdf/:pdfId").put(verifyAccessToken, updatePdf);

export default pdfRouter;
