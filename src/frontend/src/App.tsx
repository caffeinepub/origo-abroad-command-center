import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import { AppShell } from "./components/AppShell";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { LoginPage } from "./pages/LoginPage";

export type Page =
  | "dashboard"
  | "leads"
  | "content"
  | "tasks"
  | "campaigns"
  | "settings"
  | "reports"
  | "staff";

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const [isAdmin, setIsAdmin] = useState(false);
  const [roleLoaded, setRoleLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  useEffect(() => {
    if (!isAuthenticated || !actor || isFetching) {
      setRoleLoaded(false);
      return;
    }
    let cancelled = false;

    // Timeout fallback: if isCallerAdmin() hangs, unblock rendering after 10s
    const timeout = setTimeout(() => {
      if (!cancelled) {
        console.warn("isCallerAdmin() timed out, defaulting to non-admin");
        setIsAdmin(false);
        setRoleLoaded(true);
      }
    }, 10000);

    actor
      .isCallerAdmin()
      .then((admin) => {
        if (!cancelled) {
          clearTimeout(timeout);
          setIsAdmin(admin);
          setRoleLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          clearTimeout(timeout);
          setIsAdmin(false);
          setRoleLoaded(true);
        }
      });
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [isAuthenticated, actor, isFetching]);

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="space-y-3 text-center">
          <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <LoginPage />
        <Toaster />
      </>
    );
  }

  if (isFetching || !roleLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="space-y-3">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
    );
  }

  return (
    <>
      <AppShell
        isAdmin={isAdmin}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
      />
      <Toaster />
    </>
  );
}
