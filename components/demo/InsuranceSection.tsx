"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function InsuranceSection() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-bold">🏢 Insurance Company</h2>
        <Badge variant="outline">Two‑Layer Verification</Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="claims">Claims</TabsTrigger>
          <TabsTrigger value="ai">AI Verification</TabsTrigger>
          <TabsTrigger value="validator">Validator Layer</TabsTrigger>
          <TabsTrigger value="fraud">Fraud Alerts</TabsTrigger>
          <TabsTrigger value="future">Future</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard Overview</CardTitle>
              <CardDescription>Static demo metrics and status</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-md border border-border p-3">
                  <div className="text-xs text-muted-foreground">Open Claims</div>
                  <div className="text-xl font-semibold">24</div>
                </div>
                <div className="rounded-md border border-border p-3">
                  <div className="text-xs text-muted-foreground">Awaiting AI Review</div>
                  <div className="text-xl font-semibold">9</div>
                </div>
                <div className="rounded-md border border-border p-3">
                  <div className="text-xs text-muted-foreground">Manual (Validators)</div>
                  <div className="text-xl font-semibold">6</div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">This is demo data for illustration.</div>
              <div className="aspect-video w-full rounded-md border border-dashed border-border flex items-center justify-center text-xs text-muted-foreground">
                Screenshot placeholder: Insurance dashboard
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="claims">
          <Card>
            <CardHeader>
              <CardTitle>Claims Management</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-4">
              <div>
                <h4 className="font-semibold">Claim Buckets</h4>
                <ul className="list-disc ml-5 space-y-1">
                  <li><span className="font-medium">Auto‑Approve</span>: High AI score, clean checks → instant approval & payout.</li>
                  <li><span className="font-medium">Manual Review</span>: Medium AI score → sent to validators for consensus.</li>
                  <li><span className="font-medium">Reject/Investigate</span>: Low AI score or anomalies → fraud workflow.</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold">Workflow</h4>
                <ol className="list-decimal ml-5 space-y-1">
                  <li>Ingest reports from patients (linked to issuer on‑chain hash).</li>
                  <li>Run AI verification → categorize into buckets.</li>
                  <li>For manual bucket, create validator tasks with reward.</li>
                  <li>After consensus, finalize outcome and trigger payouts.</li>
                </ol>
              </div>
              <div className="aspect-video w-full rounded-md border border-dashed border-border flex items-center justify-center text-xs text-muted-foreground">
                Screenshot placeholder: Claims list & bucket filters
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle>Layer 1 – AI Verification</CardTitle>
              <CardDescription>Contract ownership and scoring</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-4">
              <div>
                <h4 className="font-semibold">One‑time AI Contract Setup</h4>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Deploy insurance‑owned verification contract (Polygon Amoy 80002).</li>
                  <li>Funding: 1 POL deposit → 0.9 POL rewards to issuer; 0.1 POL platform fee.</li>
                  <li>Configurable thresholds: approve ≥ 80, manual 50‑79, reject &lt; 50.</li>
                </ul>
              </div>
              <Separator />
              <div>
                <h4 className="font-semibold">AI Scoring Process</h4>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Template matching with issuer metadata and on‑chain hash.</li>
                  <li>Model signals: format score, text consistency, metadata, forensics.</li>
                  <li>Aggregate AI trust score → routes to Auto / Manual / Reject buckets.</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold">Outputs</h4>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Decision, score breakdown, and rationale.</li>
                  <li>Audit trail with inputs and hash references.</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validator">
          <Card>
            <CardHeader>
              <CardTitle>Layer 2 – Validator Verification</CardTitle>
              <CardDescription>Consensus & rewards</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-4">
              <div>
                <h4 className="font-semibold">Validator Contract Setup</h4>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Deploy validation contract with quorum and minimum validators.</li>
                  <li>Set reward per task and SLA (e.g., 24h deadline).</li>
                  <li>Distribution: 90% validators, 10% platform fee.</li>
                </ul>
              </div>
              <Separator />
              <div>
                <h4 className="font-semibold">Queues</h4>
                <ul className="list-disc ml-5 space-y-1">
                  <li><span className="font-medium">Validate Documents</span>: spawn tasks for claims in Manual.</li>
                  <li><span className="font-medium">Verification Queue</span>: track progress, votes, consensus.</li>
                  <li>Auto‑payout on success; re‑queue or reject on failure.</li>
                </ul>
              </div>
              <div className="aspect-video w-full rounded-md border border-dashed border-border flex items-center justify-center text-xs text-muted-foreground">
                Screenshot placeholder: Validator queue
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fraud">
          <Card>
            <CardHeader>
              <CardTitle>Fraud Detection</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <div>
                <h4 className="font-semibold">Signals</h4>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Low AI score, metadata tampering, copy‑move artifacts.</li>
                  <li>Issuer mismatch vs on‑chain hash or template violations.</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold">Actions</h4>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Flag and notify compliance team.</li>
                  <li>Collect evidence snapshot and generate report.</li>
                </ul>
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
              Analytics with fraud patterns, RBAC, external API integration, compliance reporting, ROI tracking.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
