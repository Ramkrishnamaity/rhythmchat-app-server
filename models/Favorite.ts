import { Document, Schema, model } from "mongoose";
import { FavoriteModelType } from "../lib/types/Models/Favorite";

const FavoriteSchema = new Schema<FavoriteModelType<Document["_id"]>>({
    conversationId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true
    }
});

const FavoriteModel = model<FavoriteModelType<Document["_id"]>>("favorites", FavoriteSchema);

export default FavoriteModel;

