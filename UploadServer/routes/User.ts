import { Router } from "express";
import multer from "multer";
import UploadController from "../controllers/Upload";

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

const UserRouter: Router = Router();

UserRouter.post("/file/upload", upload.single("file"), UploadController.fileUpload);
UserRouter.post("/story/upload", upload.single("story"), UploadController.storyUpload);

export default UserRouter;