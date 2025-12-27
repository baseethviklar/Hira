import mongoose, { Schema, Document } from "mongoose";

export interface IVerificationCode extends Document {
    email: string;
    code: string;
    expiresAt: Date;
}

const VerificationCodeSchema = new Schema<IVerificationCode>(
    {
        email: { type: String, required: true },
        code: { type: String, required: true },
        expiresAt: { type: Date, required: true },
    },
    { timestamps: true }
);

export default mongoose.models.VerificationCode ||
    mongoose.model<IVerificationCode>("VerificationCode", VerificationCodeSchema);
