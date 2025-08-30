"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

export function ValidatorSection() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-bold">⚖️ Validator</h2>
        <Badge variant="outline">Earn POL</Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="tasks">Available Queue</TabsTrigger>
          <TabsTrigger value="active">Active Validations</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="future">Future</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <Card>
            <CardHeader>
              <CardTitle>Validator Dashboard</CardTitle>
              <CardDescription>Your overview: tasks, performance, and rewards.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-4">
              <div>
                <h4 className="font-semibold">Role</h4>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Review assigned documents and submit validation results on-chain.</li>
                  <li>Help achieve consensus across multiple validators per task.</li>
                  <li>Earn POL rewards automatically when tasks reach Completed.</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold">At a glance</h4>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Open tasks, active validations waiting on others, and completion rate.</li>
                  <li>Recent payouts and estimated rewards in pipeline.</li>
                  <li>Accuracy and reputation indicators (future).</li>
                </ul>
              </div>
              <div className="mt-2">
                <Image
                  src="/screenshots/validator/dashboard.png"
                  alt="Validator dashboard overview"
                  width={1919}
                  height={859}
                  className="w-full h-auto rounded-md border border-border bg-muted/20"
                  sizes="(max-width: 768px) 100vw, 800px"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Available Queue</CardTitle>
              <CardDescription>Browse pending tasks and submit your validation.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-4">
              <div>
                <h4 className="font-semibold">How it works</h4>
                <ol className="list-decimal ml-5 space-y-1">
                  <li>Filter by insurance, reward, SLA, or specialty.</li>
                  <li>Open a task to review the claim/report context and issuer metadata.</li>
                  <li>Submit your result (CID) with notes/evidence.</li>
                  <li>If more validators are needed, the task remains Pending until quorum.</li>
                </ol>
              </div>
              
              <div className="mt-3">
                <Image
                  src="/screenshots/validator/queue.png"
                  alt="Validator task queue with filters and rewards"
                  width={1919}
                  height={859}
                  className="w-full h-auto rounded-md border border-border bg-muted/20"
                  sizes="(max-width: 768px) 100vw, 800px"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Validations</CardTitle>
              <CardDescription>You've submitted your result; waiting for other validators.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-4">
              <div>
                <h4 className="font-semibold">Status tracking</h4>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Shows tasks where you already submitted but status is still Pending.</li>
                  <li>Tracks per-task progress: submitted count vs required validators.</li>
                  <li>Auto-closes when quorum is reached or SLA expires.</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold">What you can do</h4>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Review your submission and notes.</li>
                  <li>Monitor on-chain tx status and final outcome.</li>
                </ul>
              </div>
              <div className="mt-3">
                <Image
                  src="/screenshots/validator/active-validation.png"
                  alt="Active validation: document viewer, checklist, and evidence inputs"
                  width={1919}
                  height={859}
                  className="w-full h-auto rounded-md border border-border bg-muted/20"
                  sizes="(max-width: 768px) 100vw, 800px"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards">
          <Card>
            <CardHeader>
              <CardTitle>Rewards</CardTitle>
              <CardDescription>Paid automatically to your wallet when tasks are Completed.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <div>
                <h4 className="font-semibold">Payouts</h4>
                <ul className="list-disc ml-5 space-y-1">
                  <li>On status "Completed", the smart contract sends POL directly to your wallet.</li>
                  <li>Split: ~90% to validators (pro‑rata), ~10% platform fee.</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold">History</h4>
                <ul className="list-disc ml-5 space-y-1">
                  <li>View completed tasks and payouts in your history.</li>
                  <li>Export transactions for accounting.</li>
                </ul>
              </div>
              <div className="mt-3">
                <Image
                  src="/screenshots/validator/rewards.png"
                  alt="Validator rewards and payout history"
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
              <CardTitle>Future</CardTitle>
              <CardDescription>Improvements planned for validators.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <div>Planned enhancements to improve the validator experience:</div>
              <ul className="list-disc ml-5 space-y-1">
                <li>Comprehensive transaction and payout history with export.</li>
                <li>Accuracy metrics and performance analytics over time.</li>
                <li>Leaderboard showcasing top validators by accuracy and volume.</li>
                <li>Reputation score derived from consistency, dispute outcomes, and peer agreement.</li>
                <li>Settings: notification preferences, display density, default filters.</li>
                <li>Training and certification modules with sample tasks and feedback.</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
