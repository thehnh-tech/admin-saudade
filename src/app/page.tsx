import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/AdminDashboard";
import { BACKEND_URL, MARKETPLACE_URL, loadAdminData } from "@/lib/backend";
import { getAdminSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getAdminSession();
  if (!session) redirect("/login");

  const data = await loadAdminData(session.backendToken);
  return <AdminDashboard initialData={data} backendUrl={BACKEND_URL} marketplaceUrl={MARKETPLACE_URL} />;
}
