"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import DWASFWLoader from "@/components/GDGLoader";

export default function SignOutPage() {
  const router = useRouter();
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const performSignOut = async () => {
      try {
        await authClient.signOut();
        toast.success("Signed out successfully", { id: "signout-success" });
        router.push("/");
      } catch (error) {
        console.error("Sign out error:", error);
        toast.error("Failed to sign out");
        router.push("/");
      }
    };

    performSignOut();
  }, [router]);

  return (
    <DWASFWLoader />
  );
} 