import mongoose, { Schema, Document } from "mongoose";

export interface ISpace extends Document {
    name: string;
    description?: string;
    owner: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const spaceSchema = new Schema<ISpace>(
    {
        name: { type: String, required: true },
        description: { type: String },
        owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true }
);

export default mongoose.models.Space || mongoose.model<ISpace>("Space", spaceSchema);
