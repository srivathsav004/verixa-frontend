"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export function PatientSection() {
  const [activeTab, setActiveTab] = useState<string>("reports");
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-bold">👤 Patient</h2>
        <Badge variant="outline">Claims & Records</Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="reports">Medical Reports</TabsTrigger>
          <TabsTrigger value="submit">Submit Claims</TabsTrigger>
          <TabsTrigger value="status">Claim Status</TabsTrigger>
          <TabsTrigger value="history">Claim History</TabsTrigger>
        </TabsList>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Medical Reports</CardTitle>
              <CardDescription>Platform‑issued reports with status</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
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
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submit">
          <Card>
            <CardHeader>
              <CardTitle>Submit Claim</CardTitle>
              <CardDescription>Attach platform or external documents</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              Provider selection → attach docs → specify external issuer if needed → enter amount & description → upload supporting docs → submit.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>Claim Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Claim History</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Complete list of approved/rejected claims with verification breakdowns, settlements, and disputes.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
