import mongoose, { Schema, Document } from "mongoose";

export interface IWorklog {
    userId: mongoose.Types.ObjectId;
    timeSpent: number;
    date: Date;
    description?: string;
}

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
    originalEstimate: number;
    timeSpent: number;
    remainingEstimate: number;
    worklogs: IWorklog[];
    startDate?: Date;
    endDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const WorklogSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    timeSpent: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    description: String
});

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
        originalEstimate: { type: Number, default: 0 },
        timeSpent: { type: Number, default: 0 },
        remainingEstimate: { type: Number, default: 0 },
        worklogs: [WorklogSchema],
        startDate: { type: Date },
        endDate: { type: Date },
    },
    { timestamps: true }
);

export default mongoose.models.Issue || mongoose.model<IIssue>("Issue", IssueSchema);
