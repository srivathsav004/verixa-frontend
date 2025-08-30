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
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-bold">🏥 Medical Issuer</h2>
        <Badge variant="outline">Auto‑Verified Reports</Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="future">Future</TabsTrigger>
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
                <div className="mt-2 text-[11px] text-muted-foreground">
                  Place your screenshot at <code className="font-mono">public/screenshots/issuer/dashboard-overview.png</code>
                </div>
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
                  <li>Search and select enrolled patients from a paginated table.</li>
                  <li>Specify <em>Report Type</em> (e.g., Blood Test, MRI).</li>
                  <li>Attach the PDF report (up to 5 MB) and click <em>Issue</em>.</li>
                  <li>Backend endpoint: <span className="font-medium text-foreground">POST /api/issuer/issued-docs</span> with <span className="font-medium text-foreground">patient_id</span>, <span className="font-medium text-foreground">issuer_id</span>, <span className="font-medium text-foreground">report_type</span>, and file.</li>
                  <li>UI component: <span className="font-medium text-foreground">components/issuer/issue-new-document.tsx</span>.</li>
                </ul>
              </div>
              <div>
                <div className="text-foreground font-medium mb-1">Records & History</div>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Track all issued reports in <span className="font-medium text-foreground">ReportsHistory</span> (<span className="font-medium text-foreground">components/issuer/reports-history.tsx</span>).</li>
                  <li>Status reflects verifiability and single‑use lock after a successful claim.</li>
                  <li>Patients are notified on issuance; insurers read the report as trusted when a claim is filed.</li>
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
                <li>Log in as Issuer and open the dashboard (<span className="font-medium text-foreground">components/dashboard/issuer-dashboard.tsx</span>).</li>
                <li>Navigate to <em>Issue Reports</em> → <span className="font-medium text-foreground">IssueNewDocument</span> table loads enrolled patients.</li>
                <li>Search/select a patient, enter <em>Report Type</em>, and attach the PDF.</li>
                <li>Click <em>Issue</em> → the platform creates a verifiable record and notifies the patient.</li>
                <li>Patient files an insurance claim using this report. Insurer treats it as trusted (no re‑verification).</li>
                <li><strong>Single‑use lock:</strong> after a successful claim, the report is marked used/locked and cannot be reused for another claim.</li>
                <li>Issuer can review past issuances in <span className="font-medium text-foreground">ReportsHistory</span>.</li>
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
                <div className="mt-2 text-[11px] text-muted-foreground">
                  Place your screenshot at <code className="font-mono">public/screenshots/issuer/issue-report-flow.png</code>
                </div>
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
