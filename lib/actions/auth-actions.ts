"use server";

import connectToDatabase from "@/lib/db";
import VerificationCode from "@/lib/models/VerificationCode";
import User from "@/lib/models/User";
import { sendEmail } from "@/lib/email";
import crypto from "crypto";
import { signIn } from "next-auth/react"; // WARNING: Client side ONLY. Server side use auth() or similar? No, use signIn from client.

// Server Actions

import bcrypt from "bcryptjs"; // Need bcrypt for hashing

// Rename/Refactor verifyOTP to registerUser which handles the final creation
export async function sendOTP(email: string, mode: "SIGNUP" | "RESET" = "SIGNUP") {
    if (!email) return { success: false, message: "Email is required" };

    try {
        await connectToDatabase();

        const existingUser = await User.findOne({ email });

        if (mode === "SIGNUP") {
            // 1. Check if user already exists (for signup flow)
            if (existingUser) {
                return { success: false, exists: true, message: "User already exists." };
            }
        } else {
            // RESET flow: User MUST exist
            if (!existingUser) {
                return { success: false, message: "No account found with this email." };
            }
        }

        // Generate 6 digit code
        const code = crypto.randomInt(100000, 999999).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Delete existing code for this email
        await VerificationCode.deleteMany({ email });

        // Save to DB
        await VerificationCode.create({
            email,
            code,
            expiresAt,
        });

        // Send Email
        const result = await sendEmail({
            to: email,
            subject: "Your Hira-lite Verification Code",
            text: `Your verification code is: ${code}. It expires in 10 minutes.`,
            html: `<p>Your verification code is: <strong>${code}</strong></p><p>It expires in 10 minutes.</p>`,
        });

        if (!result.success) {
            return { success: false, message: "Failed to send email. Check server logs." };
        }

        return { success: true, message: "OTP sent to your email" };

    } catch (error) {
        console.error("Error in sendOTP:", error);
        return { success: false, message: "Internal server error" };
    }
}

export async function registerUser(email: string, code: string, password: string, name: string) {
    if (!email || !code || !password || !name) return { success: false, message: "All fields are required" };

    try {
        await connectToDatabase();

        const record = await VerificationCode.findOne({ email, code });

        if (!record) {
            return { success: false, message: "Invalid verification code" };
        }

        if (new Date() > record.expiresAt) {
            return { success: false, message: "Code expired" };
        }

        // Check user existence again just in case
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return { success: false, message: "User already exists" };
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        await User.create({
            name: name,
            email: email,
            password: hashedPassword,
            image: "",
        });

        // Delete the code
        await VerificationCode.deleteOne({ _id: record._id });

        return { success: true, message: "Account created successfully" };

    } catch (error) {
        console.error("Error in registerUser:", error);
        return { success: false, message: "Internal server error" };
    }
}

export async function resetPassword(email: string, code: string, password: string) {
    if (!email || !code || !password) return { success: false, message: "All fields are required" };

    try {
        await connectToDatabase();

        const record = await VerificationCode.findOne({ email, code });

        if (!record) {
            return { success: false, message: "Invalid verification code" };
        }

        if (new Date() > record.expiresAt) {
            return { success: false, message: "Code expired" };
        }

        const user = await User.findOne({ email });
        if (!user) {
            return { success: false, message: "User not found" };
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update password
        user.password = hashedPassword;
        await user.save();

        // Delete the code
        await VerificationCode.deleteOne({ _id: record._id });

        return { success: true, message: "Password reset successfully" };

    } catch (error) {
        console.error("Error in resetPassword:", error);
        return { success: false, message: "Internal server error" };
    }
}
