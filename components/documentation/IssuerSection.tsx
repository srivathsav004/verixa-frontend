"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

export function IssuerSection() {
  const [activeTab, setActiveTab] = useState<string>("overview");
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
        <h2 className="text-xl sm:text-2xl font-bold">🏥 Medical Issuer</h2>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">Auto‑Verified Reports</Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="max-sm:w-full max-sm:px-1 max-sm:overflow-x-auto max-sm:whitespace-nowrap [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <TabsTrigger className="max-sm:flex-none" value="overview">Overview</TabsTrigger>
          <TabsTrigger className="max-sm:flex-none" value="features">Features</TabsTrigger>
          <TabsTrigger className="max-sm:flex-none" value="workflow">Workflow</TabsTrigger>
          <TabsTrigger className="max-sm:flex-none" value="future">Future</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Role Overview</CardTitle>
              <CardDescription>Issue reports directly to enrolled patients. Insurers trust these reports without extra verification.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <ul className="list-disc ml-5 space-y-1">
                <li>Reports issued from this platform are treated as trusted and verifiable by insurers.</li>
                <li>Patients can file claims immediately using these reports — no third‑party attestation required.</li>
                <li><strong>Single‑use validity:</strong> once a report is used successfully in a claim, it becomes locked and cannot be reused for another claim.</li>
                <li>Issuer actions are performed from the dashboard’s “Issue Reports” view.</li>
              </ul>
              <div className="mt-3">
                <Image
                  src="/screenshots/issuer/dashboard-overview.png"
                  alt="Issuer Dashboard overview and quick stats"
                  width={1919}
                  height={859}
                  className="w-full h-auto rounded-md border border-border bg-muted/20"
                  sizes="(max-width: 768px) 100vw, 800px"
                  priority
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle>Core Functionalities</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <div className="text-foreground font-medium mb-1">Issuance</div>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Find the patient in your organization’s roster and open their row.</li>
                  <li>Choose a report type (e.g., Blood Test, MRI) and attach the PDF (max ~5 MB).</li>
                  <li>Click <em>Issue</em> to create a verifiable record that is tied to the patient’s identity.</li>
                  <li>Behind the scenes, the platform fingerprints the file, secures a tamper‑evident reference on‑chain, and stores the document in managed storage.</li>
                  <li>The patient is notified immediately and can use this report for an insurance claim without extra attestations.</li>
                </ul>
              </div>
              <div>
                <div className="text-foreground font-medium mb-1">Records & History</div>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Track all reports your organization has issued in the <em>Reports History</em> view.</li>
                  <li>Each item shows the current status (verifiable, used/locked after a successful claim, or revoked if applicable).</li>
                  <li>Patients are notified on issuance; insurers treat the report as trusted when a claim is filed.</li>
                </ul>
              </div>
              <div>
                <div className="text-foreground font-medium mb-1">Templates</div>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Design standardized templates that improve downstream AI checks.</li>
                  <li>Upload and manage versions (planned UI in Issuer Dashboard sidebar).</li>
                </ul>
              </div>
              <div>
                <div className="text-foreground font-medium mb-1">Notifications</div>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Configure organization‑level notification preferences (planned).</li>
                  <li>Automatic patient notification on report issuance.</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflow">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Demonstration</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <ol className="list-decimal ml-5 space-y-1">
                <li>Log in as an Issuer and open your dashboard.</li>
                <li>Go to <em>Issue Reports</em> and locate the patient from your roster.</li>
                <li>Select a report type, attach the PDF, and click <em>Issue</em>.</li>
                <li>The platform timestamps and fingerprints the document, then creates a tamper‑evident reference on the blockchain.</li>
                <li>The patient can immediately use this report to submit an insurance claim. Insurers recognize it as trusted.</li>
                <li><strong>Single‑use lock:</strong> after the report successfully backs a claim, it is locked and cannot be reused for another claim.</li>
                <li>Review previous issuances in <em>Reports History</em> and export logs for audits if needed.</li>
              </ol>
              <div className="mt-3">
                <Image
                  src="/screenshots/issuer/issue-report-flow.png"
                  alt="Issue New Document — select patient, upload PDF, issue"
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
            <CardContent className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <ul className="list-disc ml-5 space-y-1">
                <li>Template management UI (versioning, validation hints, required fields).</li>
                <li>Bulk issuance and CSV import.</li>
                <li>Hospital/EHR integrations (FHIR, HL7).</li>
                <li>Report update/re‑issue with lineage and audit trail.</li>
              </ul>
              <ul className="list-disc ml-5 space-y-1">
                <li>Analytics on template performance and claim outcomes.</li>
                <li>Notification preferences per organization and per template.</li>
                <li>Financials: POL earnings and withdrawal management.</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
