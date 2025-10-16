"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";

export function PatientSection() {
  const [activeTab, setActiveTab] = useState<string>("reports");
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
        <h2 className="text-xl sm:text-2xl font-bold">👤 Patient</h2>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">Claims & Records</Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full px-1 overflow-x-auto whitespace-nowrap [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:w-auto sm:px-0 sm:overflow-visible sm:whitespace-normal">
          <TabsTrigger className="flex-none" value="reports">Medical Reports</TabsTrigger>
          <TabsTrigger className="flex-none" value="submit">Submit Claims</TabsTrigger>
          <TabsTrigger className="flex-none" value="status">Claim Status</TabsTrigger>
          <TabsTrigger className="flex-none" value="history">Claim History</TabsTrigger>
        </TabsList>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Medical Reports</CardTitle>
              <CardDescription>All reports issued to you by trusted providers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                View every medical report that has been officially issued to you on this platform. Each report is
                verifiable and can be used to back an insurance claim. Once a report successfully backs a claim, it
                becomes <span className="font-medium text-foreground">single‑use locked</span> and is marked as used.
              </p>
              <p>
                The table supports quick search, filters (status, type, date), and neat pagination for a clean UX.
              </p>

              <div className="rounded-md border border-border">
                {/* <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Issuer</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>2025‑06‑01</TableCell>
                      <TableCell>City Hospital</TableCell>
                      <TableCell>Blood Panel</TableCell>
                      <TableCell><Badge variant="secondary">Verified</Badge></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>2025‑05‑18</TableCell>
                      <TableCell>Wellness Clinic</TableCell>
                      <TableCell>X‑Ray</TableCell>
                      <TableCell><Badge>Used</Badge></TableCell>
                    </TableRow>
                  </TableBody>
                </Table> */}
              </div>

              <div className="mt-3">
                <Image
                  src="/screenshots/patient/reports.png"
                  alt="Patient – Medical Reports view"
                  width={1919}
                  height={859}
                  className="w-full h-auto rounded-md border border-border bg-muted/20"
                  sizes="(max-width: 768px) 100vw, 800px"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submit">
          <Card>
            <CardHeader>
              <CardTitle>Submit Claim</CardTitle>
              <CardDescription>Use an issued report or upload external documents</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <ol className="list-decimal ml-5 space-y-1">
                <li>Select your insurance provider from the list.</li>
                <li>
                  Choose an existing platform‑issued report <span className="text-foreground">(recommended)</span> — this is
                  instantly verifiable and speeds up processing.
                </li>
                <li>
                  If you don’t have an issued report on the platform, you can upload your own files. You’ll be asked to
                  specify the external issuer (e.g., hospital/clinic) so the insurer can verify against the proper
                  template and checks.
                </li>
                <li>Enter claim details (amount, description) and attach any supporting documents.</li>
                <li>Review and submit. You’ll receive updates as your claim progresses.</li>
              </ol>

              <div className="mt-3">
                <Image
                  src="/screenshots/patient/submit-claim.png"
                  alt="Patient – Submit Claim flow"
                  width={1919}
                  height={859}
                  className="w-full h-auto rounded-md border border-border bg-muted/20"
                  sizes="(max-width: 768px) 100vw, 800px"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>Claim Status</CardTitle>
              <CardDescription>Track your claim through AI analysis and human validation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                After submission, your claim is first assessed by AI (format, consistency, metadata and other checks),
                then sent to human validators if needed. You can see exactly where it is in the process below.
              </p>
              {/* <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>AI Analysis</span>
                  <span>80%</span>
                </div>
                <Progress value={80} />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Validator Review</span>
                  <span>40%</span>
                </div>
                <Progress value={40} />
              </div> */}

              <div className="mt-3">
                <Image
                  src="/screenshots/patient/status.png"
                  alt="Patient – Claim Status view"
                  width={1919}
                  height={859}
                  className="w-full h-auto rounded-md border border-border bg-muted/20"
                  sizes="(max-width: 768px) 100vw, 800px"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Claim History</CardTitle>
              <CardDescription>Approved and rejected claims with clear breakdowns</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>
                Review every past claim with outcomes, timestamps, and verification details. Use filters and pagination to
                quickly find what you need.
              </p>
              <div className="mt-1">
                <Image
                  src="/screenshots/patient/history.png"
                  alt="Patient – Claim History table"
                  width={1919}
                  height={859}
                  className="w-full h-auto rounded-md border border-border bg-muted/20"
                  sizes="(max-width: 768px) 100vw, 800px"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
