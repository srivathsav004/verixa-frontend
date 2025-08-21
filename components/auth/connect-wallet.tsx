"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ConnectWallet() {
  const handleConnect = async () => {
    // MetaMask connection logic will go here
    alert("Connecting to MetaMask on Polygon Amoy Testnet...");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="w-full max-w-md bg-gray-900/50 border-gray-800 text-white">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Connect Your Wallet</CardTitle>
          <CardDescription className="text-center text-gray-400 pt-2">Connect your MetaMask wallet to complete registration.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <p className="text-sm text-gray-500">Network: Polygon Amoy Testnet</p>
          <Button onClick={handleConnect} className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold">Connect MetaMask</Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
