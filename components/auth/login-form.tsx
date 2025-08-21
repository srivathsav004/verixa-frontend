"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export function LoginForm() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="w-full max-w-md bg-gray-900/50 border-gray-800 text-white">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Welcome Back</CardTitle>
          <CardDescription className="text-center text-gray-400 pt-2">Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="user@example.com" className="bg-gray-800 border-gray-700" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="********" className="bg-gray-800 border-gray-700" />
          </div>
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold">Login</Button>
          <p className="text-center text-sm text-gray-500">
            First time here?{" "}
            <Link href="/role-selection" className="text-blue-400 hover:underline">
              Register now
            </Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
