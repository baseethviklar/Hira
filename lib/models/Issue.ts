import mongoose, { Schema, Document } from "mongoose";

export interface IIssue extends Document {
    title: string;
    description?: string;
    status: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
    type: "TASK" | "BUG" | "STORY";
    projectId: mongoose.Types.ObjectId;
    assigneeId?: mongoose.Types.ObjectId;
    reporterId: mongoose.Types.ObjectId;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

const IssueSchema = new Schema<IIssue>(
    {
        title: { type: String, required: true },
        description: { type: String },
        status: { type: String, required: true },
        priority: { type: String, enum: ["LOW", "MEDIUM", "HIGH"], default: "MEDIUM" },
        type: { type: String, enum: ["TASK", "BUG", "STORY"], default: "TASK" },
        projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
        assigneeId: { type: Schema.Types.ObjectId, ref: "User" },
        reporterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        order: { type: Number, default: 0 },
    },
    { timestamps: true }
);

export default mongoose.models.Issue || mongoose.model<IIssue>("Issue", IssueSchema);
