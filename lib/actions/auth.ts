"use server";

import connectToDatabase from "@/lib/db";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";

export async function registerUser(data: { name: string; email: string; password: string }) {
    await connectToDatabase();

    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
        throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    await User.create({
        name: data.name,
        email: data.email,
        password: hashedPassword,
    });

    return { success: true };
}
