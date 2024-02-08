import multer from "multer";
import { allowedExtensions } from "../utils/allowedExtentions.js";

import path from "path";
import fs from "fs";
import generateUniqueString from "../utils/generate-Unique-String.js";

/**
 * check the path if not exist create it
 * store in diskStorage
 * filter the file
 * create multer instance
 * return multer instance
 */

export const multerMiddleLocal = ({
  extensions = allowedExtensions.images,
  filePath = "general",
}) => {
  const destinationPath = path.resolve(`src/uploads/${filePath}`);

  // path check
  if (fs.existsSync(destinationPath)) {
    fs.mkdirSync(destinationPath, { recursive: true });
  }

  // * diskstorage
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, destinationPath);
    },
    filename: (req, file, cb) => {
      const uniqueFilename = generateUniqueString(5) + "-" + file.originalname;
      cb(null, uniqueFilename);
    },
  });

  // file Filter
  const fileFilter = (req, file, cb) => {
    if (extensions.includes(file.mimetype.splite("/")[1])) {
      return cb(null, true);
    }
    cb(new Error("Image format is not allowed!", false));
  };
  const file = multer({ fileFilter, storage });
  return file;
};

export const multerMiddleHost = ({ extensions = allowedExtensions.images }) => {
  // diskStorage
  const storage = multer.diskStorage({
    filename: (req, file, cb) => {
      const uniqueFilename = generateUniqueString(5) + "_" + file.originalname;
      cb(null, uniqueFilename);
    },
  });

  // fileFilters
  const fileFilters = (req, file, cb) => {
    if (extensions.includes(file.mimetype.splite("/")[1])) {
      return cb(null, true);
    }
    cb(new Error("Image format is not allowed!", false));
  };
  const file = multer({fileFilters, storage});
  return file;
};
