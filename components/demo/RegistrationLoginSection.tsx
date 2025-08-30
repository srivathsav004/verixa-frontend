"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

export function RegistrationLoginSection() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-bold">🧭 Registration & Login</h2>
        <Badge variant="outline">Polygon Amoy · Chain ID 80002</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prerequisites</CardTitle>
          <CardDescription>Web3 wallet and network</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <ul className="list-disc ml-5 space-y-1">
            <li>Install MetaMask (or compatible Web3 wallet).</li>
            <li>Switch to <span className="font-medium">Polygon Amoy Testnet</span> (Chain ID: <span className="font-mono">80002</span>).</li>
            <li>Ensure a small test balance for gas fees (insurance/validator flows may trigger on-chain txns).</li>
          </ul>
          <div className="aspect-video w-full rounded-md border border-dashed border-border flex items-center justify-center text-xs">
            Screenshot placeholder: MetaMask network setup (Amoy 80002)
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Role Selection</CardTitle>
          <CardDescription>Choose Issuer, Patient, Insurance, or Validator</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3">
          <p>
            Start at the role selection page to pick your primary role and complete registration.
          </p>
          <div className="rounded-md border border-border p-3 bg-muted/30 text-xs">
            URL: <a href="https://verixa.vercel.app/role-selection" target="_blank" rel="noreferrer" className="underline">https://verixa.vercel.app/role-selection</a>
          </div>
          <ol className="list-decimal ml-5 space-y-1">
            <li>Connect your wallet.</li>
            <li>Select your role and provide basic details.</li>
            <li>Set a platform password (stored securely; wallet address + password form your credentials).</li>
            <li>Confirm registration and proceed to login.</li>
          </ol>
          <div className="aspect-video w-full rounded-md border border-dashed border-border flex items-center justify-center text-xs">
            Screenshot placeholder: Role selection
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Login Flow</CardTitle>
          <CardDescription>Wallet address + password</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3">
          <p>
            After registration, sign in using your wallet address and the password you set. On success, you will be redirected to your respective dashboard.
          </p>
          <div className="rounded-md border border-border p-3 bg-muted/30 text-xs">
            URL: <a href="https://verixa.vercel.app/login" target="_blank" rel="noreferrer" className="underline">https://verixa.vercel.app/login</a>
          </div>
          <ul className="list-disc ml-5 space-y-1">
            <li>Issuer → Issuer Dashboard</li>
            <li>Patient → Patient Dashboard</li>
            <li>Insurance → Insurance Dashboard</li>
            <li>Validator → Validator Dashboard</li>
          </ul>
          <div className="aspect-video w-full rounded-md border border-dashed border-border flex items-center justify-center text-xs">
            Screenshot placeholder: Login page
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notes on Gas & Transactions</CardTitle>
          <CardDescription>Where fees may apply</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Some actions (mainly for Insurance and Validators) can trigger on-chain transactions. Ensure you have test MATIC/POL on Amoy for gas. The platform routes all blockchain operations to Polygon Amoy Testnet (80002).
        </CardContent>
      </Card>

      <Accordion type="single" collapsible>
        <AccordionItem value="troubleshooting">
          <AccordionTrigger>Troubleshooting & Security</AccordionTrigger>
          <AccordionContent>
            <ul className="list-disc ml-5 text-sm text-muted-foreground space-y-1">
              <li>If your wallet can’t connect, verify the network (Amoy 80002) and reload.</li>
              <li>For insufficient funds, request test tokens from a Polygon Amoy faucet.</li>
              <li>Password is required in addition to your wallet address for platform login.</li>
              <li>Do not share private keys or seed phrases; the platform never asks for them.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
