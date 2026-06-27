import { createFileRoute, Outlet } from "@tanstack/react-router";

// Auth gate temporarily disabled — all routes under _authenticated are
// accessible without sign-in for now. Re-enable by restoring the
// supabase.auth.getUser() check + redirect to /auth.
export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: () => <Outlet />,
});
