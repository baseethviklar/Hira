"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { sendOTP } from "@/lib/actions/auth-actions";
import { signIn } from "next-auth/react";

const formSchema = z.object({
    name: z.string().optional(),
    email: z.string().email(),
    password: z.string().optional(),
    otp: z.string().optional(),
});

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<"EMAIL" | "OTP" | "PASSWORD">("EMAIL");

    // We keep track of values manually or via form, but since steps change validation rules, 
    // it might be easier to use manual state for this multi-step flow or just one big form 
    // that validates partially. Let's stick to the manual state approach from landing page 
    // but wrapped in the Card UI for consistency with this page's design.

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (step === "EMAIL") {
                if (!email) throw new Error("Email is required");
                if (!email.endsWith("@gmail.com")) throw new Error("Only @gmail.com allowed");

                const result = await sendOTP(email, "SIGNUP");
                if (result.success) {
                    setStep("OTP");
                    toast.success("OTP sent to your email");
                } else if ((result as any).exists) {
                    toast.error("User already exists. Please login.");
                    router.push("/login");
                } else {
                    throw new Error(result.message || "Failed to send OTP");
                }
            } else if (step === "OTP") {
                if (!otp || otp.length !== 6) throw new Error("Invalid OTP");
                setStep("PASSWORD");
            } else if (step === "PASSWORD") {
                if (!name || name.length < 2) throw new Error("Name is required");
                if (!password || password.length < 6) throw new Error("Password min 6 chars");

                const { registerUser } = await import("@/lib/actions/auth-actions");
                const result = await registerUser(email, otp, password, name);

                if (result.success) {
                    toast.success("Account created!");
                    // Auto login
                    const signInResult = await signIn("credentials", {
                        email,
                        password,
                        redirect: false,
                    });
                    if (signInResult?.ok) {
                        router.push("/projects");
                    } else {
                        router.push("/login");
                    }
                } else {
                    throw new Error(result.message || "Registration failed");
                }
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Create an account</CardTitle>
                <CardDescription>
                    {step === "EMAIL" && "Enter your email to get started"}
                    {step === "OTP" && "Enter the verification code sent to " + email}
                    {step === "PASSWORD" && "Finish setting up your account"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    {step === "EMAIL" && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input
                                type="email"
                                placeholder="john@gmail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                autoFocus
                            />
                        </div>
                    )}

                    {step === "OTP" && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Verification Code</label>
                            <Input
                                type="text"
                                placeholder="123456"
                                maxLength={6}
                                className="text-center text-xl tracking-widest font-mono"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                disabled={isLoading}
                                autoFocus
                            />
                        </div>
                    )}

                    {step === "PASSWORD" && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Full Name</label>
                                <Input
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={isLoading}
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Password</label>
                                <Input
                                    type="password"
                                    placeholder="******"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    )}

                    <Button type="submit" className="w-full bg-[#077d7d] hover:bg-[#066060] text-white font-bold" disabled={isLoading}>
                        {isLoading ? "Processing..." :
                            step === "EMAIL" ? "Continue" :
                                step === "OTP" ? "Verify" : "Sign Up"
                        }
                    </Button>
                </form>

                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">
                            Or continue with
                        </span>
                    </div>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    className="h-12 w-full bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white font-medium transition-all hover:scale-[1.01] active:scale-[0.99]"
                    onClick={() => signIn("google", { callbackUrl: "/projects" })}
                    disabled={isLoading}
                >
                    <svg className="mr-2 h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                </Button>
            </CardContent>
            <CardFooter className="justify-center">
                <p className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="text-primary hover:underline">
                        Sign in
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
}
