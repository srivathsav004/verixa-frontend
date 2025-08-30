"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export function IssuerSection() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-bold">🏥 Medical Issuer</h2>
        <Badge variant="outline">Auto‑Verified Reports</Badge>
      </div>

      <Tabs defaultValue="overview">
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
              <CardDescription>Issue reports directly to enrolled patients</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <ul className="list-disc ml-5">
                <li>Reports issued via Verixa are automatically verified</li>
                <li>Patients can submit insurance claims immediately</li>
                <li>Single‑use validity prevents fraudulent double claims</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle>Core Functionalities</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <ul className="list-disc ml-5 space-y-1">
                <li>Patient enrollment & management</li>
                <li>Direct report issuance</li>
                <li>Document upload & metadata</li>
                <li>Automatic verification status</li>
              </ul>
              <ul className="list-disc ml-5 space-y-1">
                <li>Patient DB with enrollment tracking</li>
                <li>Issued reports history</li>
                <li>Template management</li>
                <li>Notifications & preferences</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflow">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Demonstration</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Issuer logs in → selects enrolled patient → uploads report with metadata → system verifies & assigns → patient notified → report ready for claims.
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
                <li>AI‑optimized templates</li>
                <li>Bulk issuance</li>
                <li>Hospital system integrations</li>
              </ul>
              <ul className="list-disc ml-5 space-y-1">
                <li>Analytics dashboards</li>
                <li>Revenue tracking</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
