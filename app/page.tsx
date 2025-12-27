import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LandingPage } from "@/components/landing-page";

export default async function Home() {
  return <LandingPage />;
}
