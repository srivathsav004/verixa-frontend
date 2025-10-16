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
import { DemoSidebar } from "@/components/documentation/DemoSidebar";
import { OverviewSection } from "@/components/documentation/OverviewSection";
import { IssuerSection } from "@/components/documentation/IssuerSection";
import { PatientSection } from "@/components/documentation/PatientSection";
import { InsuranceSection } from "@/components/documentation/InsuranceSection";
import { ValidatorSection } from "@/components/documentation/ValidatorSection";
import { TechnicalSection } from "@/components/documentation/TechnicalSection";
import { GettingStartedSection } from "@/components/documentation/GettingStartedSection";
import { RegistrationLoginSection } from "@/components/documentation/RegistrationLoginSection";
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
            <div className="flex items-center gap-3 px-3 sm:px-4 py-3 w-full">
              <SidebarTrigger className="text-foreground/80" />
              <div className="ml-1 text-sm text-muted-foreground">Documentation</div>
            </div>
          </header>

          <main className="px-3 sm:px-6 py-6 w-full max-w-full">
            <div className="mx-auto w-full max-w-[48rem] md:max-w-4xl lg:max-w-5xl space-y-12 sm:space-y-16">
              <section id="overview" className="scroll-mt-20 sm:scroll-mt-24">
                <OverviewSection />
              </section>
              <Separator />

              <section id="roles-issuer" className="scroll-mt-20 sm:scroll-mt-24">
                <IssuerSection />
              </section>
              <Separator />

              <section id="roles-patient" className="scroll-mt-20 sm:scroll-mt-24">
                <PatientSection />
              </section>
              <Separator />

              <section id="roles-insurance" className="scroll-mt-20 sm:scroll-mt-24">
                <InsuranceSection />
              </section>
              <Separator />

              <section id="roles-validator" className="scroll-mt-20 sm:scroll-mt-24">
                <ValidatorSection />
              </section>
              <Separator />

              <section id="technical" className="scroll-mt-20 sm:scroll-mt-24">
                <TechnicalSection />
              </section>
              <Separator />

              <section id="registration-login" className="scroll-mt-20 sm:scroll-mt-24">
                <RegistrationLoginSection />
              </section>
              <Separator />

              <section id="getting-started" className="scroll-mt-20 sm:scroll-mt-24">
                <GettingStartedSection />
              </section>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

