import fs from "fs";
import multer from "multer";
import os from "os";
import path from "path";

const tmp = path.join(os.tmpdir(), "cafe-blk-and-brwn-uploads");
fs.mkdirSync(tmp, { recursive: true });

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

/** Disk storage (temp) -> controller sends the file to Cloudinary and deletes it. */
export const upload = multer({
  storage: multer.diskStorage({
    destination: tmp,
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname).toLowerCase()}`),
  }),
  fileFilter: (_req, file, cb) => {
    if (ALLOWED.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only JPG, PNG, WebP, GIF or AVIF images are allowed."));
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});
