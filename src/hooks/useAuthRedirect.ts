"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type RedirectOptions = {
  whenAuthenticated?: string;
  whenUnauthenticated?: string;
};

export function useAuthRedirect(options: RedirectOptions = {}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user && options.whenUnauthenticated) {
      router.push(options.whenUnauthenticated);
    } else if (user && options.whenAuthenticated) {
      router.push(options.whenAuthenticated);
    }
  }, [user, loading, router, options]);

  return { user, loading };
}
