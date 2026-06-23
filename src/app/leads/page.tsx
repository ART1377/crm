import { Suspense } from "react";
import { LeadsPage } from "@/features/leads";
import { LeadsPageSkeleton } from "@/features/leads/skeleton";

export default function Leads() {
  return (
    <Suspense fallback={<LeadsPageSkeleton />}>
      <LeadsPage />
    </Suspense>
  );
}