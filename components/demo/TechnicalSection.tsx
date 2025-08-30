"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function TechnicalSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">🔧 Technical Specifications</h2>

      <Card>
        <CardHeader>
          <CardTitle>Blockchain Architecture</CardTitle>
          <CardDescription>Network & contracts</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <ul className="list-disc ml-5 space-y-1">
            <li>Polygon Amoy Testnet (Chain ID: 80002)</li>
            <li>Smart contracts for automated verification & payouts</li>
            <li>IPFS for document storage</li>
            <li>MetaMask wallet integration</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Token Economics</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <ul className="list-disc ml-5 space-y-1">
            <li>POL token utility & distribution</li>
            <li>10% platform fee on all transactions</li>
            <li>Reward mechanisms for roles</li>
            <li>Gas optimization strategies</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Measures</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <ul className="list-disc ml-5 space-y-1">
            <li>Document immutability via blockchain hashing</li>
            <li>Multi‑signature validation for high‑value claims</li>
            <li>Fraud detection algorithms & patterns</li>
            <li>Privacy & encryption controls</li>
          </ul>
        </CardContent>
      </Card>

      <Accordion type="single" collapsible>
        <AccordionItem value="api">
          <AccordionTrigger>API Integration</AccordionTrigger>
          <AccordionContent>
            RESTful API, webhooks for notifications, and SDKs for custom integrations with docs & examples.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
