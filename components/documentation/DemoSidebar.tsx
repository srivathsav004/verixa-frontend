"use client";

import React from "react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Users, Hospital, User, Building2, Scale, Wrench, Rocket } from "lucide-react";

export function DemoSidebar() {
  return (
    <ScrollArea className="h-full">
      <div className="px-2 pb-3">
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
            <BookOpen className="size-4" /> Overview
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-sm">
                  <Link href="#overview" className="hover:underline">Platform Overview</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-1.5" />

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
            <Users className="size-4" /> Platform Roles
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-sm">
                  <a href="#roles-issuer" className="flex items-center gap-2 hover:underline"><Hospital className="size-4" /> Medical Issuer</a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-sm">
                  <a href="#roles-patient" className="flex items-center gap-2 hover:underline"><User className="size-4" /> Patient</a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-sm">
                  <a href="#roles-insurance" className="flex items-center gap-2 hover:underline"><Building2 className="size-4" /> Insurance</a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-sm">
                  <a href="#roles-validator" className="flex items-center gap-2 hover:underline"><Scale className="size-4" /> Validator</a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-1.5" />

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
            <Wrench className="size-4" /> Technical
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-sm">
                  <a href="#technical" className="hover:underline">Technical Specs</a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-1.5" />

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
            <Rocket className="size-4" /> Getting Started
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-sm">
                  <a href="#registration-login" className="hover:underline">Registration & Login</a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-sm">
                  <a href="#getting-started" className="hover:underline">Setup Guide</a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-3 px-2">
          <Badge variant="outline" className="w-full justify-center">Dark Theme</Badge>
        </div>
      </div>
    </ScrollArea>
  );
}
