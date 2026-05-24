import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import LandingOrOnboarding from "@/components/onboarding/landing-or-onboarding";

export default async function RootPage() {
  const { userId } = await auth();
  if (userId) redirect("/chat");

  return <LandingOrOnboarding />;
}
