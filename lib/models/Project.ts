import mongoose, { Schema, Document } from "mongoose";

export interface IProject extends Document {
    name: string;
    key: string;
    description?: string;
    owner: mongoose.Types.ObjectId;
    statuses: { id: string; label: string; color?: string }[];
    createdAt: Date;
    updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
    {
        name: { type: String, required: true },
        key: { type: String, required: true, uppercase: true },
        description: { type: String },
        owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
        statuses: [
            {
                id: { type: String, required: true },
                label: { type: String, required: true },
                color: { type: String },
            },
        ],
    },
    { timestamps: true }
);

export default mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);
