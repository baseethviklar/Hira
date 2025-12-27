import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    image?: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String }, // Optional for OAuth, but required for Credentials
        image: { type: String },
    },
    { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
