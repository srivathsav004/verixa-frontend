"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

export function InsuranceSection() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-bold">🏢 Insurance Company</h2>
        <Badge variant="outline">Two‑Layer Verification</Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="max-sm:w-full max-sm:px-1 max-sm:overflow-x-auto max-sm:whitespace-nowrap [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <TabsTrigger className="max-sm:flex-none" value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger className="max-sm:flex-none" value="claims">Claims</TabsTrigger>
          <TabsTrigger className="max-sm:flex-none" value="ai">AI Verification</TabsTrigger>
          <TabsTrigger className="max-sm:flex-none" value="validator">Validator Layer</TabsTrigger>
          <TabsTrigger className="max-sm:flex-none" value="fraud">Fraud Alerts</TabsTrigger>
          <TabsTrigger className="max-sm:flex-none" value="future">Future</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard Overview</CardTitle>
              <CardDescription>High‑level metrics and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>
                The dashboard summarizes open claims, verification workload, recent approvals/rejections, and quick links
                to your verification tools. Most cards are informational and help you jump to actions quickly.
              </p>
              <div className="mt-1">
                <Image
                  src="/screenshots/insurance/dashboard.png"
                  alt="Insurance – Dashboard overview"
                  width={1919}
                  height={859}
                  className="w-full h-auto rounded-md border border-border bg-muted/20"
                  sizes="(max-width: 768px) 100vw, 800px"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="claims">
          <Card>
            <CardHeader>
              <CardTitle>Claims</CardTitle>
              <CardDescription>Manage active and approved claims</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-1">Active Claims</h4>
                <p>
                  Shows all incoming claims and whether their attached reports are verified or not. Claims with
                  platform‑issued, verified reports can be approved immediately. Unverified claims require verification
                  through the AI and/or Validator layers.
                </p>
                <div className="mt-2">
                  <Image
                    src="/screenshots/insurance/claims-active.png"
                    alt="Insurance – Active Claims table"
                    width={1919}
                    height={859}
                    className="w-full h-auto rounded-md border border-border bg-muted/20"
                    sizes="(max-width: 768px) 100vw, 800px"
                  />
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="font-semibold text-foreground mb-1">Approved Claims</h4>
                <p>
                  Once a claim is approved, it’s listed here with payout details and audit references. Claims backed by
                  trusted platform‑issued reports typically appear here without additional steps.
                </p>
                <div className="mt-2">
                  <Image
                    src="/screenshots/insurance/claims-approved.png"
                    alt="Insurance – Approved Claims table"
                    width={1919}
                    height={859}
                    className="w-full h-auto rounded-md border border-border bg-muted/20"
                    sizes="(max-width: 768px) 100vw, 800px"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle>AI Verification</CardTitle>
              <CardDescription>One‑time setup, then score unverified documents</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <ol className="list-decimal ml-5 space-y-1">
                <li>
                  Complete a one‑time AI contract setup. This makes you the owner of your verification contract and
                  configures fee flows.
                </li>
                <li>
                  For each scoring run, 1 POL is charged: <span className="font-medium text-foreground">0.9 POL</span>
                  goes to the report’s issuer for providing the template; <span className="font-medium text-foreground">0.1 POL</span>
                  is the platform fee.
                </li>
                <li>
                  Generate AI scores for all unverified documents. In this demo, scores are placeholder values; in
                  production, they’re computed from issuer‑provided templates and model checks.
                </li>
                <li>
                  Scores are bucketed into three outcomes based on your thresholds (set during registration):
                  <span className="font-medium text-foreground"> Auto</span>,
                  <span className="font-medium text-foreground"> Manual</span>, and
                  <span className="font-medium text-foreground"> Reject</span>.
                </li>
              </ol>
              <ul className="list-disc ml-5 space-y-1">
                <li><span className="font-medium text-foreground">Auto:</span> mark report as verified automatically.</li>
                <li><span className="font-medium text-foreground">Reject:</span> mark as rejected and move to Fraud Alerts.</li>
                <li><span className="font-medium text-foreground">Manual:</span> send to Validator Layer for human review.</li>
              </ul>
              <div className="mt-2">
                <Image
                  src="/screenshots/insurance/ai-verification.png"
                  alt="Insurance – AI Verification setup and scoring"
                  width={1919}
                  height={859}
                  className="w-full h-auto rounded-md border border-border bg-muted/20"
                  sizes="(max-width: 768px) 100vw, 800px"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validator">
          <Card>
            <CardHeader>
              <CardTitle>Validator Layer</CardTitle>
              <CardDescription>Human review for uncertain claims</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>
                Claims that require human review are sent to the Validator Layer. Validators review the claim and attached
                report, then vote on the outcome.
              </p>
              <div className="mt-2">
                <Image
                  src="/screenshots/insurance/validator-layer.png"
                  alt="Insurance – Validator Layer"
                  width={1919}
                  height={859}
                  className="w-full h-auto rounded-md border border-border bg-muted/20"
                  sizes="(max-width: 768px) 100vw, 800px"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fraud">
          <Card>
            <CardHeader>
              <CardTitle>Fraud Alerts</CardTitle>
              <CardDescription>Monitor and investigate suspicious activity</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>
                Claims that are flagged as suspicious or have a low AI score are moved to the Fraud Alerts section.
                Investigators can review the claim and attached report, then take action to resolve the issue.
              </p>
              <div className="mt-2">
                <Image
                  src="/screenshots/insurance/fraud-alerts.png"
                  alt="Insurance – Fraud Alerts"
                  width={1919}
                  height={859}
                  className="w-full h-auto rounded-md border border-border bg-muted/20"
                  sizes="(max-width: 768px) 100vw, 800px"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="future">
          <Card>
            <CardHeader>
              <CardTitle>Future Enhancements</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Analytics, policy management, pricing rules, advanced fraud analytics and dispute workflows can be added
              next based on operational needs.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
