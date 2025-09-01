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
            <li>MetaMask (or compatible Web3 wallet) installed.</li>
            <li>Polygon Amoy Testnet selected (Chain ID <span className="font-mono">80002</span>).</li>
            <li>Small test POL for gas (mainly for Insurance/Validator actions).</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Role Selection</CardTitle>
          <CardDescription>Choose Issuer, Patient, Insurance, or Validator</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3">
          <p>Start at the Role Selection page, pick your role, and complete the role-specific form.</p>
          <div className="rounded-md border border-border p-3 bg-muted/30 text-xs">
            URL: <a href="https://verixa.vercel.app/role-selection" target="_blank" rel="noreferrer" className="underline">https://verixa.vercel.app/role-selection</a>
          </div>
          <ol className="list-decimal ml-5 space-y-1">
            <li>Open Role Selection and choose your role.</li>
            <li>You will be routed to <span className="font-mono">/register/&lt;role&gt;</span> (e.g., <span className="font-mono">/register/validator</span>).</li>
            <li>Connect your wallet and switch to Polygon Amoy within the form if prompted.</li>
            <li>Fill in details and set your platform password.</li>
            <li>Submit to complete registration.</li>
          </ol>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notes on Gas & Transactions</CardTitle>
          <CardDescription>Where fees may apply</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Some actions (mainly for Insurance and Validators) can trigger on-chain transactions. Ensure you have testnet POL on Amoy for gas. The platform routes all blockchain operations to Polygon Amoy Testnet (80002).
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
