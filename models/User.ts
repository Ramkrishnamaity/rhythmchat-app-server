import mongoose, { Document, Schema } from "mongoose";
import { UserModelType } from "../lib/types/Models/User";
import { CommonModelType } from "../lib/types/Models";

const UserSchema = new Schema<UserModelType<CommonModelType & Document["_id"]>>({
	about: {
		type: String,
		default: "Hi there."
	},
	firstName: {
		type: String,
		required: [true, "First Name is Required."]
	},
	lastName: {
		type: String,
		required: [true, "Last Name is Required."]
	},
	email: {
		type: String,
		required: [true, "Email is required."],
		unique: true
	},
	password: {
		type: String,
		required: [true, "Password is Required."]
	},
	image: {
		type: String,
		default: "https://savari.blr1.digitaloceanspaces.com/665337ffd8c9fcafc278765f/image/1722662350635.png"
	},
	createdOn: {
		type: Date,
		default: Date.now
	},
	updatedOn: {
		type: Date,
		default: Date.now
	},
	isDeleted: {
		type: Boolean,
		default: false
	}
});

const UserModel = mongoose.model<UserModelType<CommonModelType & Document["_id"]>>("User", UserSchema);

export default UserModel;
