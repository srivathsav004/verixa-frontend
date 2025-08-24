"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UserService } from "@/services/userService";
import Link from "next/link";

export function LoginForm() {
  const router = useRouter();
  const [wallet, setWallet] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await UserService.login({ wallet_address: wallet.trim(), password });
      // Persist user_id for subsequent API calls (issuer_id usage)
      try {
        if (res?.user_id != null) {
          window.localStorage.setItem("user_id", String(res.user_id));
          document.cookie = `user_id=${encodeURIComponent(String(res.user_id))}; path=/`;
        }
      } catch {}
      const role = res?.role?.toLowerCase?.() ?? "";
      if (role === "issuer") router.push("/dashboard/issuer");
      else if (role === "insurance") router.push("/dashboard/insurance");
      else if (role === "patient") router.push("/dashboard/patient");
      else if (role === "validator") router.push("/dashboard/validator");
      else router.push("/");
    } catch (err: any) {
      setError(err?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="w-full max-w-sm mx-auto">
      <Card className="w-full">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-xl font-semibold tracking-tight no-underline">Welcome Back</CardTitle>
          <CardDescription>Enter your wallet address and password to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wallet">Wallet Address</Label>
              <Input
                id="wallet"
                type="text"
                placeholder="0x..."
                autoComplete="username"
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button type="submit" variant="default" disabled={loading} className="w-full">
              {loading ? "Logging in..." : "Login"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              First time here?{" "}
              <Link href="/role-selection" className="text-primary hover:underline">
                Register now
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
