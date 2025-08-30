"use client";

import React from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { DemoSidebar } from "@/components/demo/DemoSidebar";
import { OverviewSection } from "@/components/demo/OverviewSection";
import { IssuerSection } from "@/components/demo/IssuerSection";
import { PatientSection } from "@/components/demo/PatientSection";
import { InsuranceSection } from "@/components/demo/InsuranceSection";
import { ValidatorSection } from "@/components/demo/ValidatorSection";
import { TechnicalSection } from "@/components/demo/TechnicalSection";
import { GettingStartedSection } from "@/components/demo/GettingStartedSection";
import { RegistrationLoginSection } from "@/components/demo/RegistrationLoginSection";
import { Logo } from "@/components/common/Logo";

export default function DemoPage() {
  return (
    <SidebarProvider
      style={{
        // Scope sidebar sizing to this page only (does not affect other routes)
        ["--sidebar-width" as any]: "15rem",
        ["--sidebar-width-icon" as any]: "3.25rem",
      }}
    >
      <div className="min-h-screen w-full bg-background text-foreground flex overflow-x-hidden">
        <Sidebar className="border-r border-border">
          <SidebarHeader className="px-3 py-2">
            <div className="flex items-center gap-2">
              <Logo size={18} className="text-primary" />
              <h1 className="text-lg font-semibold">Verixa Documentation</h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <DemoSidebar />
          </SidebarContent>
          <SidebarFooter className="px-3 py-2 text-xs text-muted-foreground">
            The Ledger Never Lies
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1 min-w-0 w-full overflow-x-hidden">
          <header className="sticky top-0 z-10 border-b border-border bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40">
            <div className="flex items-center gap-3 pl-4 pr-0 py-3">
              <SidebarTrigger className="text-foreground/80" />
              <div className="ml-1 text-sm text-muted-foreground">Documentation</div>
            </div>
          </header>

          <main className="pl-4 pr-0 py-6 w-full max-w-full space-y-16">
            <section id="overview" className="scroll-mt-24">
              <OverviewSection />
            </section>
            <Separator />

            <section id="roles-issuer" className="scroll-mt-24">
              <IssuerSection />
            </section>
            <Separator />

            <section id="roles-patient" className="scroll-mt-24">
              <PatientSection />
            </section>
            <Separator />

            <section id="roles-insurance" className="scroll-mt-24">
              <InsuranceSection />
            </section>
            <Separator />

            <section id="roles-validator" className="scroll-mt-24">
              <ValidatorSection />
            </section>
            <Separator />

            <section id="technical" className="scroll-mt-24">
              <TechnicalSection />
            </section>
            <Separator />

            <section id="registration-login" className="scroll-mt-24">
              <RegistrationLoginSection />
            </section>
            <Separator />

            <section id="getting-started" className="scroll-mt-24">
              <GettingStartedSection />
            </section>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
