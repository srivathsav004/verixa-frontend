"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export function ValidatorSection() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-bold">⚖️ Validator</h2>
        <Badge variant="outline">Earn POL</Badge>
      </div>

      <Tabs defaultValue="tasks">
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
            <CardContent className="text-sm text-muted-foreground">
              Browse tasks, view details (reward, requirements), and accept with one click.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Validation Workflow</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              High‑quality viewer, structured assessment, evidence collection, consensus tracking, and status updates.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards">
          <Card>
            <CardHeader>
              <CardTitle>Reward System</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Automatic POL distribution after consensus; performance‑based bonuses; transparent payment history.
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
