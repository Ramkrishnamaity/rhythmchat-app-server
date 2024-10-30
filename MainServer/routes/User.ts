import { Router } from "express";
import UserProfileController from "../controllers/user/Profile";
import UserController from "../controllers/user";
import UserNotificationController from "../controllers/user/Notiification";
import UserConversationController from "../controllers/user/Conversation";
import UserGroupController from "../controllers/user/Group";

const UserRouter: Router = Router();

// profile apis
UserRouter.get("/profile", UserProfileController.getUserProfile);
UserRouter.put("/profile", UserProfileController.updateProfile);
UserRouter.get("/device-token/:id", UserProfileController.updateDeviceToken);
UserRouter.put("/change-password", UserProfileController.updatePassword);
UserRouter.delete("/account", UserProfileController.deleteAccount);

// user list with filter
UserRouter.get("/member", UserController.getMembers);
UserRouter.get("/friend", UserController.getFriends);

// notification
UserRouter.get("/notification", UserNotificationController.fetchNotification);

// conversations
UserRouter.get("/conversation", UserConversationController.getConversations);
UserRouter.get("/conversation/:id", UserConversationController.getSingleConversation);

//group
UserRouter.post("/group", UserGroupController.createGroup);

export default UserRouter;