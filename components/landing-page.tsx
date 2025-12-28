"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { sendOTP } from "@/lib/actions/auth-actions";

export function LandingPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [step, setStep] = useState<"EMAIL" | "OTP" | "PASSWORD" | "LOGIN">("EMAIL");
    const [flow, setFlow] = useState<"SIGNUP" | "RESET">("SIGNUP");
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        if (step === "EMAIL") {
            // Step 1: Send OTP
            if (!email) {
                setError("Email address is required.");
                setIsLoading(false);
                return;
            }

            // Gmail check
            if (!email.endsWith("@gmail.com")) {
                setError("Only @gmail.com addresses are allowed.");
                setIsLoading(false);
                return;
            }


            // If we are in RESET flow, we just send OTP to existing email
            const result = await sendOTP(email, flow);

            if (result.success) {
                setStep("OTP");
            } else if ((result as any).exists && flow === "SIGNUP") {
                // Only redirect to login if we are in SIGNUP flow and user exists
                setStep("LOGIN");
                setError("");
            } else {
                setError(result.message || "Failed to send verification code.");
            }
            setIsLoading(false);
        } else if (step === "OTP") {
            // Step 2: Verify OTP locally (or move to password step if we trust valid 6 digits for now)
            // But we can't verify OTP easily without server action if we want to be strict before password.
            // Actually, let's just move to password step if format is valid, 
            // and do final verification + creation in one go.
            // OR simpler: verify OTP via verifyOTP action first? 
            // We renamed verifyOTP to registerUser... but we can't call registerUser without password.
            // Let's add password input here.

            // Wait, logic: User enters OTP. We can't verify it fully because `registerUser` needs password.
            // BUT we should probably check if it LOOKS right before showing password field?
            // Actually, let's accept it and move to password step. The final step will verify everything.

            if (!otp || otp.length !== 6) {
                setError("Please enter the 6-digit code.");
                setIsLoading(false);
                return;
            }
            setStep("PASSWORD");
            setIsLoading(false);
        } else if (step === "PASSWORD") {
            // Step 3: Register
            if (!password || password.length < 6) {
                setError("Password must be at least 6 characters.");
                setIsLoading(false);
                return;
            }

            if (flow === "SIGNUP") {
                if (!name) {
                    setError("Please enter your name.");
                    setIsLoading(false);
                    return;
                }

                // Dynamic import
                const { registerUser } = await import("@/lib/actions/auth-actions");
                const result = await registerUser(email, otp, password, name);

                if (result.success) {
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
                    setError(result.message || "Failed to create account.");
                    if (result.message?.toLowerCase().includes("code")) {
                        setStep("OTP");
                    }
                }
            } else {
                // RESET FLOW
                const { resetPassword } = await import("@/lib/actions/auth-actions");
                const result = await resetPassword(email, otp, password);

                if (result.success) {
                    // Login with new password
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
                    setError(result.message || "Failed to reset password.");
                }
            }
            setIsLoading(false);
        } else if (step === "LOGIN") {
            // Step 4: Login for existing user
            if (!password) {
                setError("Please enter your password.");
                setIsLoading(false);
                return;
            }

            const signInResult = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (signInResult?.error) {
                setError("Invalid password.");
            } else {
                router.push("/projects");
            }
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-950 text-white">
            {/* Header */}
            <header className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="relative w-32 h-10">
                        <Image
                            src="/HiraNew.png"
                            alt=""
                            fill
                            className="object-contain object-left"
                            priority
                        />
                    </div>
                </div>
                <nav className="hidden md:flex gap-6 text-sm font-medium">
                    <Link href="#" className="hover:text-blue-400">Features</Link>
                    <Link href="#" className="hover:text-blue-400">Pricing</Link>
                    <Link href="#" className="hover:text-blue-400">Enterprise</Link>
                    <Link href="#" className="hover:text-blue-400">Resources</Link>
                </nav>
                <div className="flex items-center gap-4">
                    <Link href="/login">
                        <Button className="bg-[#077d7d] text-white hover:bg-[#066060] font-bold border-none transition-colors">
                            Log in
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col lg:flex-row items-center justify-center p-6 lg:p-12 gap-12 max-w-7xl mx-auto w-full">

                {/* Left Column: Text & Form */}
                <div className="flex-1 w-full max-w-lg space-y-8">
                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-white">
                            Smart task management, simplified
                        </h1>
                        <p className="text-lg md:text-xl text-slate-400 leading-relaxed">
                            Built for students, professionals, and everyone juggling life's tasks.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <form onSubmit={handleSignUp} className="space-y-4" noValidate>
                            {step === "EMAIL" && (
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium ml-1 text-slate-300">
                                        Your email
                                    </label>
                                    <div className="relative">
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="Enter your Email ID"
                                            className={`h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 transition-colors ${error ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                                if (error) setError("");
                                            }}
                                            disabled={isLoading}
                                        />
                                        {error && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                                    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {step === "OTP" && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-right-4">
                                    <label htmlFor="otp" className="text-sm font-medium ml-1 text-slate-300">
                                        Enter Verification Code
                                    </label>
                                    <div className="relative">
                                        <Input
                                            id="otp"
                                            type="text"
                                            placeholder="123456"
                                            maxLength={6}
                                            className={`h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 text-center tracking-widest text-xl font-mono transition-colors ${error ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            disabled={isLoading}
                                        />
                                    </div>

                                    <p className="text-xs text-slate-500 ml-1">
                                        We sent a code to <span className="text-white font-medium">{email}</span>
                                    </p>
                                </div>
                            )}

                            {(step === "PASSWORD" || step === "LOGIN") && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-right-4">
                                    <label htmlFor="password" className="text-sm font-medium ml-1 text-slate-300">
                                        {step === "LOGIN" ? "Enter your password" : flow === "RESET" ? "Set new password" : "Set your details"}
                                    </label>
                                    <div className="space-y-3">
                                        {step === "PASSWORD" && flow === "SIGNUP" && (
                                            <div className="relative">
                                                <Input
                                                    id="name"
                                                    type="text"
                                                    placeholder="Your full name"
                                                    className={`h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 transition-colors ${error && !name ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    disabled={isLoading}
                                                />
                                            </div>
                                        )}
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type="password"
                                                placeholder={step === "LOGIN" ? "Your password" : "Min. 6 characters"}
                                                className={`h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 transition-colors ${error ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                disabled={isLoading}
                                            />
                                        </div>
                                        {step === "LOGIN" && (
                                            <div className="text-right">
                                                <p
                                                    className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer"
                                                    onClick={() => {
                                                        setFlow("RESET");
                                                        setStep("EMAIL");
                                                    }}
                                                >
                                                    Forgot password?
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {error && (
                                <p className="text-sm text-red-400 flex items-center gap-1.5 ml-1 animate-in fade-in">
                                    {error}
                                </p>
                            )}

                            <Button
                                type="submit"
                                size="lg"
                                className="w-full h-12 bg-[#077d7d] text-white hover:bg-[#066060] font-bold text-lg transition-colors"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Processing...
                                    </span>
                                ) : (
                                    step === "EMAIL" ? (flow === "RESET" ? "Send Reset Code" : "Sign Up/ Sign In") :
                                        step === "OTP" ? "Verify Code" :
                                            step === "LOGIN" ? "Log in" : (flow === "RESET" ? "Reset Password" : "Create Account")
                                )}
                            </Button>
                        </form>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-white/10" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-slate-950 px-2 text-slate-500">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <Button
                                variant="outline"
                                className="h-12 w-full bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white font-medium transition-all hover:scale-[1.01] active:scale-[0.99]"
                                onClick={() => signIn("google", { callbackUrl: "/projects" })}
                            >
                                <svg className="mr-2 h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Continue with Google
                            </Button>
                        </div>
                    </div>

                    <div className="w-full overflow-hidden opacity-60 pt-6">
                        <p className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">Trusted by industry leaders</p>
                        <div className="relative flex overflow-x-hidden group">
                            <div className="animate-marquee whitespace-nowrap flex items-center gap-12">
                                <span className="text-2xl font-bold text-slate-400 mx-4">GOOGLE</span>
                                <span className="text-2xl font-bold text-slate-400 mx-4">MICROSOFT</span>
                                <span className="text-2xl font-bold text-slate-400 mx-4">SPOTIFY</span>
                                <span className="text-2xl font-bold text-slate-400 mx-4">AMAZON</span>
                                <span className="text-2xl font-bold text-slate-400 mx-4">NETFLIX</span>
                                {/* Duplicate for seamless loop */}
                                <span className="text-2xl font-bold text-slate-400 mx-4">GOOGLE</span>
                                <span className="text-2xl font-bold text-slate-400 mx-4">MICROSOFT</span>
                                <span className="text-2xl font-bold text-slate-400 mx-4">SPOTIFY</span>
                                <span className="text-2xl font-bold text-slate-400 mx-4">AMAZON</span>
                                <span className="text-2xl font-bold text-slate-400 mx-4">NETFLIX</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Video/Visual */}
                <div className="flex-1 w-full max-w-2xl relative">
                    <div className="absolute -top-12 -right-12 text-[#077d7d] opacity-20">
                        <svg width="200" height="200" viewBox="0 0 100 100">
                            <rect x="20" y="20" width="60" height="60" transform="rotate(15 50 50)" fill="currentColor" />
                        </svg>
                    </div>

                    <div className="bg-white rounded-lg shadow-2xl overflow-hidden aspect-video relative z-10 border-4 border-white/10">
                        {/* Video Placeholder */}
                        <div className="absolute inset-0 bg-slate-100 flex items-center justify-center group cursor-pointer">
                            <div className="text-center">
                                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                                    <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-slate-900 font-bold text-lg">Watch Demo</h3>
                                <p className="text-slate-500 text-sm">See Hira-lite in action</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main >
        </div >
    );
}
