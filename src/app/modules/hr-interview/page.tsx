"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HrInterviewModuleRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/assessment");
  }, [router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center text-center">
      <div className="space-y-2">
        <h2 className="text-xl font-bold">Redirecting to Interview Assessment...</h2>
        <p className="text-xs text-muted-foreground">Routing from legacy module path to /assessment</p>
      </div>
    </div>
  );
}
