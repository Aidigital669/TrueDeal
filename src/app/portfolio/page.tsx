import { redirect } from "next/navigation";
import { getCurrentUserSession } from "@/lib/auth-actions";

export default async function PortfolioIndexPage() {
  const session = await getCurrentUserSession();
  const slug = session?.slug || "anv-reealty";
  redirect(`/portfolio/${slug}`);
}

