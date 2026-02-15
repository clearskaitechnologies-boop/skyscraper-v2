import { useUser } from "@supabase/auth-helpers-react";
import { Navigate } from "react-router-dom";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const user = useUser();
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}
