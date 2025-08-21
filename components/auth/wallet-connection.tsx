"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Wallet, Network } from "lucide-react";

interface WalletConnectionProps {
  onWalletConnected: (address: string) => void;
  onBack: () => void;
  onComplete: () => void;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function WalletConnection({ onWalletConnected, onBack, onComplete }: WalletConnectionProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [network, setNetwork] = useState("");
  const [error, setError] = useState("");
  const [isPolygonAmoy, setIsPolygonAmoy] = useState(false);

  const polygonAmoyConfig = {
    chainId: "0x13881", // 80001 in hex
    chainName: "Polygon Amoy Testnet",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
    rpcUrls: ["https://rpc-amoy.polygon.technology"],
    blockExplorerUrls: ["https://www.oklink.com/amoy"],
  };

  const checkIfWalletIsConnected = async () => {
    try {
      if (typeof window.ethereum !== "undefined") {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsConnected(true);
          onWalletConnected(accounts[0]);
          await checkNetwork();
        }
      }
    } catch (error) {
      console.error("Error checking wallet connection:", error);
    }
  };

  const checkNetwork = async () => {
    try {
      if (typeof window.ethereum !== "undefined") {
        const chainId = await window.ethereum.request({ method: "eth_chainId" });
        setNetwork(chainId);
        setIsPolygonAmoy(chainId === polygonAmoyConfig.chainId);
      }
    } catch (error) {
      console.error("Error checking network:", error);
    }
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    setError("");

    try {
      if (typeof window.ethereum === "undefined") {
        setError("MetaMask is not installed. Please install MetaMask first.");
        setIsConnecting(false);
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setIsConnected(true);
        onWalletConnected(accounts[0]);
        await checkNetwork();
      }
    } catch (error: any) {
      setError(error.message || "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  const switchToPolygonAmoy = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: polygonAmoyConfig.chainId }],
      });
      setIsPolygonAmoy(true);
      setError("");
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [polygonAmoyConfig],
          });
          setIsPolygonAmoy(true);
          setError("");
        } catch (addError) {
          setError("Failed to add Polygon Amoy network");
        }
      } else {
        setError("Failed to switch to Polygon Amoy network");
      }
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    
    if (typeof window.ethereum !== "undefined") {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          onWalletConnected(accounts[0]);
        } else {
          setWalletAddress("");
          setIsConnected(false);
        }
      });

      window.ethereum.on("chainChanged", () => {
        checkNetwork();
      });
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-2xl bg-gray-900/50 border-gray-800 text-white">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Connect Your Wallet
          </CardTitle>
          <CardDescription className="text-center text-gray-400 pt-2">
            Connect your MetaMask wallet and switch to Polygon Amoy Testnet to complete registration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert className="border-red-500 bg-red-500/10">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-400">{error}</AlertDescription>
            </Alert>
          )}

          {!isConnected ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-gray-800/50 rounded-lg">
                <Wallet className="h-6 w-6 text-blue-400" />
                <div>
                  <h3 className="font-semibold">MetaMask Wallet</h3>
                  <p className="text-sm text-gray-400">Connect your MetaMask wallet to proceed</p>
                </div>
              </div>
              
              <Button
                onClick={connectWallet}
                disabled={isConnecting}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
              >
                {isConnecting ? "Connecting..." : "Connect MetaMask"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert className="border-green-500 bg-green-500/10">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <AlertDescription className="text-green-400">
                  Wallet connected successfully!
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label>Wallet Address</Label>
                <Input
                  value={walletAddress}
                  readOnly
                  className="bg-gray-800 border-gray-700 font-mono text-sm"
                />
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-800/50 rounded-lg">
                <Network className="h-6 w-6 text-blue-400" />
                <div className="flex-1">
                  <h3 className="font-semibold">Network Status</h3>
                  <p className="text-sm text-gray-400">
                    {isPolygonAmoy ? "Connected to Polygon Amoy Testnet" : "Please switch to Polygon Amoy Testnet"}
                  </p>
                </div>
                {!isPolygonAmoy && (
                  <Button
                    onClick={switchToPolygonAmoy}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Switch Network
                  </Button>
                )}
              </div>

              {isPolygonAmoy && (
                <Alert className="border-green-500 bg-green-500/10">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <AlertDescription className="text-green-400">
                    Connected to Polygon Amoy Testnet! You're all set.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={onBack}
                  variant="outline"
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Back
                </Button>
                <Button
                  onClick={onComplete}
                  disabled={!isPolygonAmoy}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Complete Registration
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
} 