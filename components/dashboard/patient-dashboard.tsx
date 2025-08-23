"use client";

import { useEffect, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  LayoutDashboard,
  FolderHeart,
  Activity,
  FileText,
  ShieldCheck,
  Wallet,
  Users,
  FileCheck2,
  UploadCloud,
  BookOpenCheck,
  LifeBuoy,
} from "lucide-react";

type RecordItem = {
  id: string;
  type: string;
  source: "Platform" | "External";
  org: string;
  date: string;
  verified: "Platform Verified" | "AI Verified" | "Validator Verified" | "Pending";
};

type Claim = {
  id: string;
  title: string;
  status: "Submitted" | "AI Analysis" | "Validator Review" | "Insurance Decision";
  percent: number;
};

export function PatientDashboard() {
  const [loading, setLoading] = useState(true);
  const [name] = useState("Alex");

  const records: RecordItem[] = [
    { id: "r1", type: "Blood Test", source: "Platform", org: "Verixa Lab", date: "2d ago", verified: "Platform Verified" },
    { id: "r2", type: "X-Ray Chest", source: "External", org: "City Hospital", date: "5d ago", verified: "AI Verified" },
    { id: "r3", type: "MRI Knee", source: "External", org: "Prime Imaging", date: "10d ago", verified: "Validator Verified" },
  ];

  const claims: Claim[] = [
    { id: "c1", title: "Diagnostic Tests", status: "AI Analysis", percent: 45 },
    { id: "c2", title: "Emergency Visit", status: "Validator Review", percent: 72 },
  ];

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const verifiedCount = records.filter(r => r.verified !== "Pending").length;

  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider>
        <div className="min-h-screen w-full bg-background text-foreground flex overflow-x-hidden">
          <Sidebar className="border-r border-border">
            <SidebarHeader>
              <div className="flex items-center gap-3 px-2 py-1.5">
                <div className="h-8 w-8 rounded-md bg-foreground/5 grid place-items-center font-bold">V</div>
                <div className="leading-tight">
                  <div className="font-semibold">Verixa</div>
                  <div className="text-xs text-muted-foreground">Patient</div>
                </div>
              </div>
            </SidebarHeader>

            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Health</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start"><LayoutDashboard /> <span>Dashboard</span></SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start"><FolderHeart /> <span>Medical Records</span></SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start"><Activity /> <span>Health Timeline</span></SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarGroup>
                <SidebarGroupLabel>Insurance</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start"><FileText /> <span>Submit Claims</span></SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start" isActive>
                        <ShieldCheck /> <span className="flex-1">Claim Status</span>
                        <Badge className="ml-auto" variant="secondary">2</Badge>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start"><BookOpenCheck /> <span>Claim History</span></SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarGroup>
                <SidebarGroupLabel>Settings</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start"><Users /> <span>Profile</span></SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start"><ShieldCheck /> <span>Privacy Settings</span></SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start"><LifeBuoy /> <span>Emergency Contacts</span></SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start"><Wallet /> <span>Wallet</span></SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
              <div className="mt-auto px-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-between rounded-lg border border-border bg-foreground/5 px-3 py-2">
                      <div className="text-xs text-muted-foreground">Notifications</div>
                      <div className="font-semibold">3</div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="text-foreground">Insurance and record updates</TooltipContent>
                </Tooltip>
              </div>
            </SidebarFooter>
          </Sidebar>

          <SidebarInset className="flex-1 min-w-0 w-full overflow-x-hidden">
            <header className="sticky top-0 z-10 border-b border-border bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40">
              <div className="flex items-center gap-3 pl-4 pr-0 py-3">
                <SidebarTrigger className="text-foreground/80" />
                <div className="ml-1 text-sm text-muted-foreground">Patient Dashboard</div>
                <div className="ml-auto flex items-center gap-3">
                  <Badge variant="secondary">Secure</Badge>
                  <Avatar className="h-8 w-8" />
                </div>
              </div>
            </header>

            <main className="pl-4 pr-0 py-6 w-full max-w-full">
              {/* Welcome / Stats */}
              <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-2 border-border bg-gradient-to-br from-foreground/5 to-transparent">
                  <CardHeader>
                    <CardTitle className="text-xl">Welcome back, {name}</CardTitle>
                    <CardDescription>Your health overview and recent updates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-lg border border-border bg-foreground/5 p-3">
                        <div className="text-xs text-muted-foreground">Total Records</div>
                        <div className="mt-1 text-2xl font-semibold">{records.length}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{verifiedCount} verified</div>
                      </div>
                      <div className="rounded-lg border border-border bg-foreground/5 p-3">
                        <div className="text-xs text-muted-foreground">Active Claims</div>
                        <div className="mt-1 text-2xl font-semibold">{claims.length}</div>
                        <div className="mt-1 text-xs text-muted-foreground">With real-time tracking</div>
                      </div>
                      <div className="rounded-lg border border-border bg-foreground/5 p-3">
                        <div className="text-xs text-muted-foreground">Recent Reports</div>
                        <div className="mt-1 text-2xl font-semibold">{records.filter(r=>r.date.includes("d")).length}</div>
                        <div className="mt-1 text-xs text-muted-foreground">Last 30 days</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Shortcuts for common tasks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2">
                      <Button className="justify-start bg-foreground/10 text-foreground hover:bg-foreground/20"><FileCheck2 className="mr-2 h-4 w-4"/> Submit New Claim</Button>
                      <Button className="justify-start bg-foreground/10 text-foreground hover:bg-foreground/20"><UploadCloud className="mr-2 h-4 w-4"/> Upload External Report</Button>
                      <Button variant="secondary" className="justify-start"><FolderHeart className="mr-2 h-4 w-4"/> View All Records</Button>
                      <Button variant="outline" className="justify-start"><LifeBuoy className="mr-2 h-4 w-4"/> Emergency Access</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Timeline + Claims */}
              <div className="mt-6 grid gap-6 lg:grid-cols-3">
                {/* Timeline (Aceternity-style simple) */}
                <Card className="lg:col-span-2 border-border">
                  <CardHeader>
                    <CardTitle>Recent Medical Records</CardTitle>
                    <CardDescription>Chronological updates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />
                      <div className="space-y-5">
                        {loading && (
                          <>
                            <Skeleton className="h-14 w-full bg-foreground/10" />
                            <Skeleton className="h-14 w-11/12 bg-foreground/10" />
                            <Skeleton className="h-14 w-10/12 bg-foreground/10" />
                          </>
                        )}
                        {!loading && records.map((r) => (
                          <div key={r.id} className="relative pl-8">
                            <div className="absolute left-0 top-2 h-3 w-3 rounded-full bg-foreground" />
                            <div className="rounded-lg border border-border bg-foreground/5 p-3">
                              <div className="flex items-center gap-2 text-sm">
                                <FolderHeart className="h-4 w-4" />
                                <div className="font-medium">{r.type}</div>
                                <div className="ml-auto text-xs text-muted-foreground">{r.date}</div>
                              </div>
                              <div className="mt-1 text-xs text-muted-foreground">{r.org} • {r.source}</div>
                              <div className="mt-2 flex items-center gap-2">
                                <Badge variant={
                                  r.verified === "Platform Verified" ? "secondary" :
                                  r.verified === "AI Verified" ? "default" :
                                  r.verified === "Validator Verified" ? "outline" : "secondary"
                                }>{r.verified}</Badge>
                                <Button size="sm" variant="ghost" className="ml-auto">Download</Button>
                                <Button size="sm" variant="ghost">Share</Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Claims status */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle>Insurance Claim Status</CardTitle>
                    <CardDescription>Real-time verification progress</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {claims.map((c) => (
                        <div key={c.id} className="rounded-lg border border-border p-3 bg-foreground/5">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4" />
                            <div className="font-medium">{c.title}</div>
                            <Badge className="ml-auto" variant="secondary">{c.status}</Badge>
                          </div>
                          <div className="mt-2">
                            <Progress value={c.percent} />
                            <div className="mt-1 text-xs text-muted-foreground">{c.percent}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Records page preview (filters/search) */}
              <Card className="mt-6 border-border">
                <CardHeader>
                  <CardTitle>Browse Medical Records</CardTitle>
                  <CardDescription>Filters and quick search</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="all">
                    <TabsList>
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="platform">Platform Issued</TabsTrigger>
                      <TabsTrigger value="external">External</TabsTrigger>
                      <TabsTrigger value="blood">Blood</TabsTrigger>
                      <TabsTrigger value="xray">X-Ray</TabsTrigger>
                    </TabsList>
                    <TabsContent value="all" className="mt-4">
                      <div className="grid gap-3 md:grid-cols-3">
                        {[...records, ...records].slice(0,3).map((r, i) => (
                          <div key={r.id+"-grid-"+i} className="rounded-lg border border-border bg-foreground/5 p-3">
                            <div className="flex items-center gap-2 text-sm">
                              <FolderHeart className="h-4 w-4" />
                              <div className="font-medium">{r.type}</div>
                              <Badge className="ml-auto" variant="secondary">{r.verified}</Badge>
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">{r.org} • {r.date}</div>
                            <div className="mt-2 flex gap-2">
                              <Button size="sm" variant="ghost">View</Button>
                              <Button size="sm" variant="ghost">Download</Button>
                              <Button size="sm" variant="ghost">Add to Claim</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}

