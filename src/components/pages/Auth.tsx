import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import Image from "next/image";
import { useEffect } from "react";
import { Link,useNavigate } from "react-router-dom";

import clearSkaiLogo from "@/assets/clearskai-logo.jpg";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-accent/10">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-xl">
          <div className="mb-8 flex flex-col items-center">
            <Image src={clearSkaiLogo} alt="ClearSKai" className="mb-4 h-16 w-auto" />
            <h1 className="text-2xl font-bold text-foreground">Welcome to ClearSKai</h1>
            <p className="mt-2 text-center text-muted-foreground">
              Sign in to access your AI-powered roofing intelligence platform
            </p>
          </div>

          <SupabaseAuth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: "hsl(223, 69%, 32%)",
                    brandAccent: "hsl(223, 69%, 42%)",
                  },
                },
              },
            }}
            providers={[]}
            redirectTo={window.location.origin + "/dashboard"}
          />

          <div className="mt-6 space-y-3">
            <div className="text-center">
              <Link
                to="/auth/reset"
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                Forgot your password?
              </Link>
            </div>

            <div className="border-t border-border pt-4">
              <div className="space-y-2 text-center">
                <p className="text-sm text-muted-foreground">New to ClearSKai?</p>
                <Link to="/signup">
                  <button className="w-full rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                    Create Your Free Account
                  </button>
                </Link>
                <p className="mt-2 text-xs text-muted-foreground">
                  First user automatically becomes admin/owner
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
