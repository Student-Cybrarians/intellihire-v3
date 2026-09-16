"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CareerModuleRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center text-center">
      <div className="space-y-2">
        <h2 className="text-xl font-bold">Redirecting to Career Intelligence Workspace...</h2>
        <p className="text-xs text-muted-foreground">Routing from legacy module path to /dashboard</p>
      </div>
    </div>
  );
}
