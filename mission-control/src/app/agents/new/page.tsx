import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth-server";
import AdminAgentForm from "@/components/AdminAgentForm";

export default async function NewAgentPage() {
  const hasToken = await isAuthenticated();
  if (!hasToken) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-[#f7f5f2] px-6 py-10">
      <AdminAgentForm />
    </div>
  );
}
