import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth-server";
import DashboardClient from "@/components/DashboardClient";

export default async function Home() {
  const hasToken = await isAuthenticated();
  if (!hasToken) {
    redirect("/sign-in");
  }

  return <DashboardClient />;
}
