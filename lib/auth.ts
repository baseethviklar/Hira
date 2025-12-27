import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/db";
import User from "@/lib/models/User";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                // OTP Login Flow
                if (credentials?.email && credentials?.otp) {
                    await connectToDatabase();
                    // Import VerificationCode dynamically to avoid circular dependecies if any
                    // But we can import at top level usually. 
                    // Let's use the model directly if possible or the one imported.
                    const VerificationCode = (await import("@/lib/models/VerificationCode")).default;

                    const record = await VerificationCode.findOne({
                        email: credentials.email,
                        code: credentials.otp
                    });

                    if (!record || new Date() > record.expiresAt) {
                        throw new Error("Invalid or expired OTP");
                    }

                    // Valid OTP. Find or Create User.
                    // Actually, verifyOTP action should have handled creation OR we do it here?
                    // Doing it here covers the actual signIn event.

                    let user = await User.findOne({ email: credentials.email });
                    if (!user) {
                        user = await User.create({
                            name: credentials.email.split("@")[0],
                            email: credentials.email,
                            image: "",
                        });
                    }

                    // Delete code after use
                    await VerificationCode.deleteOne({ _id: record._id });

                    return {
                        id: user._id.toString(),
                        name: user.name,
                        email: user.email,
                        image: user.image,
                    };
                }

                // Password Login Flow
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid credentials");
                }

                await connectToDatabase();

                const user = await User.findOne({ email: credentials.email });

                if (!user || !user.password) {
                    throw new Error("Invalid credentials");
                }

                const isCorrectPassword = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isCorrectPassword) {
                    throw new Error("Invalid credentials");
                }

                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    image: user.image,
                };
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === "google") {
                await connectToDatabase();
                try {
                    const existingUser = await User.findOne({ email: user.email });
                    if (!existingUser) {
                        await User.create({
                            name: user.name,
                            email: user.email,
                            image: user.image,
                            // Password is optional in schema, so this is fine
                        });
                    }
                    return true;
                } catch (error) {
                    console.error("Error creating user from Google login:", error);
                    return false;
                }
            }
            return true;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.sub as string;
            }
            return session;
        },
        async jwt({ token, user, account }) {
            if (user) {
                token.sub = user.id;
            }
            // If it's a google login, we might want to ensure we have the ID from DB if we just created it?
            // "user" object in jwt callback comes from the provider or the authorize function.
            // For Google, "user" is the object returned by the profile callback (normalized).
            // But we created the user in DB in signIn.
            // We need the DB _id to be the token.sub.

            if (account?.provider === "google") {
                await connectToDatabase();
                const dbUser = await User.findOne({ email: user?.email });
                if (dbUser) {
                    token.sub = dbUser._id.toString();
                }
            }
            return token;
        },
    },
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    },
};
