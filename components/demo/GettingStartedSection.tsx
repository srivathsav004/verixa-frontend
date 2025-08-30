"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function GettingStartedSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">🚀 Getting Started</h2>

      <Card>
        <CardHeader>
          <CardTitle>Registration Process</CardTitle>
          <CardDescription>Wallet & role setup</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <ol className="list-decimal ml-5 space-y-1">
            <li>Install MetaMask and connect Polygon Amoy (80002)</li>
            <li>Select role and complete verification</li>
            <li>Set password and link wallet</li>
            <li>Make your first transaction</li>
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Platform Navigation</CardTitle>
          <CardDescription>Dashboards & workflows</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Guided tour of role dashboards, best practices, and common use cases.
        </CardContent>
      </Card>

      <Accordion type="single" collapsible>
        <AccordionItem value="troubleshooting">
          <AccordionTrigger>Troubleshooting</AccordionTrigger>
          <AccordionContent>
            Connection errors, gas estimation, and support resources with FAQs.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
