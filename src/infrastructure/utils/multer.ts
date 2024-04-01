
import multer from "multer";
import path from "path";

const multerConfig = multer({
  storage: multer.diskStorage({}),
  fileFilter: (
    req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) => {
    let ext = path.extname(file.originalname);
    if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
      cb(null, false);
      return;
    }
    cb(null, true);
  },
});

export default multerConfig;
