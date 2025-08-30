"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function InsuranceSection() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-bold">🏢 Insurance Company</h2>
        <Badge variant="outline">Two‑Layer Verification</Badge>
      </div>

      <Tabs defaultValue="dashboard">
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
            <CardContent className="text-sm text-muted-foreground">
              Claims management, contract deployment, and verification status tracking.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="claims">
          <Card>
            <CardHeader>
              <CardTitle>Claims Management</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              Active claims with verification status, approval workflow, and batch processing. Approved claims show payment status and settlement docs.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle>Layer 1 – AI Verification</CardTitle>
              <CardDescription>Contract ownership and scoring</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <div>
                <h4 className="font-semibold">One‑time AI Contract Setup</h4>
                <ul className="list-disc ml-5">
                  <li>Deploy personal smart contract (owner: insurance)</li>
                  <li>Cost: 1 POL → 0.9 POL to issuer + 0.1 POL platform fee</li>
                </ul>
              </div>
              <Separator />
              <div>
                <h4 className="font-semibold">AI Scoring Process</h4>
                <ul className="list-disc ml-5">
                  <li>Template matching with issuer templates</li>
                  <li>POC model generates scores → three buckets</li>
                  <li>Auto: approve; Manual: validators; Reject: alert</li>
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
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <div>
                <h4 className="font-semibold">Validator Contract Setup</h4>
                <ul className="list-disc ml-5">
                  <li>Deploy validation contract</li>
                  <li>Configure validator requirement and reward</li>
                  <li>Reward distribution: 90% validators, 10% platform</li>
                </ul>
              </div>
              <Separator />
              <div>
                <h4 className="font-semibold">Queues</h4>
                <ul className="list-disc ml-5">
                  <li>Validate Documents: create tasks for manual bucket</li>
                  <li>Verification Queue: active tasks with progress & consensus</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fraud">
          <Card>
            <CardHeader>
              <CardTitle>Fraud Detection</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Reject bucket produces alerts with indicators, evidence collection, and reporting.
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
