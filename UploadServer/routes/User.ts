import { Router } from "express";
import multer from "multer";
import UploadController from "../controllers/Upload";
import path from "path";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

const UserRouter: Router = Router();

UserRouter.post("/file/upload", upload.single("file"), UploadController.fileUpload);
UserRouter.post("/story/upload", upload.single("story"), UploadController.storyUpload);

export default UserRouter;