"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sparkles, ShieldCheck, Timer, Coins } from "lucide-react";

export function OverviewSection() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Verixa: The Ledger Never Lies</h2>
          <p className="text-muted-foreground">Eliminating medical document fraud with blockchain + AI + human consensus.</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="gap-1"><Timer className="size-3" /> Instant</Badge>
          <Badge variant="secondary" className="gap-1"><ShieldCheck className="size-3" /> Secure</Badge>
          <Badge variant="secondary" className="gap-1"><Coins className="size-3" /> Cost‑efficient</Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Problem → Solution</CardTitle>
          <CardDescription>Why Verixa matters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold">Problem</h3>
            <ul className="list-disc ml-5 text-muted-foreground">
              <li>Manual verification takes 3–7 days, expensive and error‑prone</li>
              <li>High fraud rates due to tampered and repeated documents</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold">Solution</h3>
            <ul className="list-disc ml-5 text-muted-foreground">
              <li>Blockchain‑backed proofs + AI analysis + human validator consensus</li>
              <li>Single‑use validity prevents double claims</li>
              <li>Transparent, auditable workflow</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold">Key Benefits</h3>
            <ul className="list-disc ml-5 text-muted-foreground">
              <li>Instant verification</li>
              <li>Fraud prevention</li>
              <li>Cost reduction</li>
              <li>End‑to‑end transparency</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Technical Requirements</CardTitle>
            <CardDescription>Environment & access</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <ul className="list-disc ml-5">
              <li>Web3 wallet (MetaMask)</li>
              <li>Polygon Amoy Testnet (Chain ID: 80002)</li>
              <li>Gas fee for insurance companies and validators</li>
              <li>Login: Wallet address + password set during registration</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Statistics</CardTitle>
            <CardDescription>Operational model</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <ul className="list-disc ml-5">
              <li>4 roles with specialized dashboards</li>
              <li>Two‑layer verification (AI + Human consensus)</li>
              <li>Automatic POL reward distribution</li>
              <li>Single‑use document validity</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Accordion type="single" collapsible>
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How the end‑to‑end flow works</AccordionTrigger>
          <AccordionContent>
            Issuer uploads → AI pre‑scores → Bucketed (Auto / Manual / Reject) → Manual bucket triggers validation tasks → Validators reach consensus → Smart contracts distribute POL → Insurance pays out.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
