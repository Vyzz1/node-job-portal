import multer from "multer";
import crypto from "crypto";
import { Request, Response } from "express";
import s3Client from "../utils/s3Client";
import { Readable } from "stream";
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const generateFileName = (fileName: string) =>
  Date.now() + "-" + fileName.replace(/\s/g, "-").toLowerCase();

const uploadFile = upload.single("file");

const handleUploadFile = async (req: Request, res: Response) => {
  const file = req.file;
  const fileName = generateFileName(file?.originalname ?? "");

  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  await s3Client.uploadToS3(file.buffer, fileName, file.mimetype);

  const response = {
    message: "File uploaded",
    uploadTime: new Date().toISOString(),
    fileName: fileName,
    size: file.size,
  };

  return res.status(201).json(response);
};

const handleGetFile = async (req: Request, res: Response) => {
  const { fileName } = req.params;
  try {
    const data = await s3Client.getFileFromS3(fileName);

    // Set response headers
    res.setHeader("Content-Length", data.ContentLength ?? 0);
    res.setHeader(
      "Content-Type",
      data.ContentType ?? "application/octet-stream"
    );
    res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);

    // Pipe the file stream to the response
    if (data.Body instanceof Readable) {
      data.Body.pipe(res);
    } else {
      res.status(404).json({ message: "File not found" });
    }
  } catch (error) {
    console.error("Error fetching file from S3:", error);
    res.status(500).json({ message: "Error fetching file from S3" });
  }
};

export default {
  uploadFile,
  handleUploadFile,
  handleGetFile,
};
