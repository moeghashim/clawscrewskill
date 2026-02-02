import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth-server";
import AdminTaskAssignForm from "@/components/AdminTaskAssignForm";
import SideNav from "@/components/SideNav";

export default async function AssignTaskPage() {
  const hasToken = await isAuthenticated();
  if (!hasToken) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-[#f7f5f2] px-6 py-10">
      <div className="grid grid-cols-[260px_1fr] gap-6">
        <SideNav />
        <AdminTaskAssignForm />
      </div>
    </div>
  );
}
