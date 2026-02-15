import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// Note: original repo is Vite/React; this login page is Next-style scaffold adapted to plain React router.

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      // Replace with your auth call (Supabase/other)
      // const { error } = await supabase.auth.signInWithPassword({ email, password });
      // if (error) throw error;
      navigate("/");
    } catch (err) {
      console.error("login failed", err);
      alert("Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto mt-20 max-w-md rounded bg-white p-6 shadow">
      <h1 className="mb-4 text-2xl font-semibold">Sign in</h1>
      <form onSubmit={handleSubmit} aria-label="Login form">
        <label htmlFor="login-email" className="mb-2 block">Email</label>
        <input
          id="login-email"
          name="email"
          type="email"
          placeholder="you@example.com"
          className="mb-4 w-full rounded border p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label htmlFor="login-password" className="mb-2 block">Password</label>
        <input
          id="login-password"
          name="password"
          type="password"
          placeholder="••••••••"
          className="mb-4 w-full rounded border p-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          className="w-full rounded bg-blue-600 p-2 text-white"
          disabled={loading}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
