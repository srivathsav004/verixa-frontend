"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export function ValidatorSection() {
  const [activeTab, setActiveTab] = useState<string>("tasks");
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-bold">⚖️ Validator</h2>
        <Badge variant="outline">Earn POL</Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="tasks">Available Queue</TabsTrigger>
          <TabsTrigger value="active">Active Validations</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="future">Future</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Task Management</CardTitle>
              <CardDescription>Filter, accept, and validate</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-4">
              <div>
                <h4 className="font-semibold">Lifecycle</h4>
                <ol className="list-decimal ml-5 space-y-1">
                  <li>Browse queue → filter by reward, SLA, specialty.</li>
                  <li>Open task → review claim context and issuer metadata.</li>
                  <li>Accept task → slot reserved until SLA expires.</li>
                  <li>Submit verdict with notes and evidence highlights.</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold">Example Tasks</h4>
                <div className="rounded-md border border-border divide-y">
                  <div className="grid grid-cols-4 gap-2 p-2 text-xs text-muted-foreground">
                    <div className="font-medium text-foreground">Task</div>
                    <div className="font-medium text-foreground">Reward (POL)</div>
                    <div className="font-medium text-foreground">SLA</div>
                    <div className="font-medium text-foreground">Status</div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 p-2 text-xs">
                    <div>#4218 – MRI Report</div>
                    <div>0.12</div>
                    <div>24h</div>
                    <div>Open</div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 p-2 text-xs">
                    <div>#4227 – Lab Panel</div>
                    <div>0.10</div>
                    <div>12h</div>
                    <div>Open</div>
                  </div>
                </div>
              </div>
              <div className="aspect-video w-full rounded-md border border-dashed border-border flex items-center justify-center text-xs">
                Screenshot placeholder: Task queue
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Validation Workflow</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-4">
              <div>
                <h4 className="font-semibold">Consensus Mechanics</h4>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Quorum defined by insurance (e.g., 3 of 5 validators).</li>
                  <li>Weighted voting based on historical accuracy (future).</li>
                  <li>Auto-close when quorum reached or SLA expires.</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold">Validation Flow</h4>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Document viewer with zoom/annotations.</li>
                  <li>Structured checklist (format, text, metadata, forensics).</li>
                  <li>Upload evidence snapshots and notes.</li>
                </ul>
              </div>
              <div className="aspect-video w-full rounded-md border border-dashed border-border flex items-center justify-center text-xs">
                Screenshot placeholder: Active validation view
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards">
          <Card>
            <CardHeader>
              <CardTitle>Reward System</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <div>
                <h4 className="font-semibold">Payouts</h4>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Upon consensus: smart contract distributes POL automatically.</li>
                  <li>Split: 90% to validators (pro‑rata), 10% platform fee.</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold">Performance</h4>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Accuracy score influences task access and bonuses (future).</li>
                  <li>Transparent payment history and export.</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="future">
          <Card>
            <CardHeader>
              <CardTitle>Future Improvements</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Transaction history, accuracy metrics, leaderboard, preferences, training & certification.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
