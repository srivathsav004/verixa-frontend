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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="w-full max-w-md bg-gray-900/50 border-gray-800 text-white">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Welcome Back</CardTitle>
          <CardDescription className="text-center text-gray-400 pt-2">Enter your wallet address and password to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="wallet">Wallet Address</Label>
              <Input
                id="wallet"
                type="text"
                placeholder="0x..."
                className="bg-gray-800 border-gray-700"
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
                className="bg-gray-800 border-gray-700"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold">
              {loading ? "Logging in..." : "Login"}
            </Button>
            <p className="text-center text-sm text-gray-500">
              First time here?{" "}
              <Link href="/role-selection" className="text-blue-400 hover:underline">
                Register now
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
