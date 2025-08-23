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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
// import { Separator } from "@/components/ui/separator";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Line, LineChart, XAxis, YAxis } from "recharts";
import {
  LayoutDashboard,
  FilePlus2,
  History,
  UploadCloud,
  PieChart,
  Wallet,
  Settings,
  Bell,
  Building2,
  Users2,
} from "lucide-react";

type Activity = {
  id: string;
  type: "issue" | "template_used" | "upload" | "earn";
  text: string;
  time: string;
};

export function IssuerDashboard() {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);

  // Mock async load
  useEffect(() => {
    const t = setTimeout(() => {
      setActivities([
        {
          id: "a1",
          type: "issue",
          text: "Issued Blood Test report to Jane Cooper",
          time: "2m ago",
        },
        {
          id: "a2",
          type: "template_used",
          text: "AI verified using ‘Blood Test v2’ (+0.01 POL)",
          time: "7m ago",
        },
        {
          id: "a3",
          type: "upload",
          text: "Uploaded ‘MRI Template – 2025’",
          time: "1h ago",
        },
        {
          id: "a4",
          type: "earn",
          text: "Milestone: 1.5 POL earned this week",
          time: "3h ago",
        },
      ]);
      setLoading(false);
    }, 700);
    return () => clearTimeout(t);
  }, []);

  const chartData = [
    { day: "Mon", uses: 5 },
    { day: "Tue", uses: 8 },
    { day: "Wed", uses: 6 },
    { day: "Thu", uses: 12 },
    { day: "Fri", uses: 14 },
    { day: "Sat", uses: 10 },
    { day: "Sun", uses: 9 },
  ];

  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider>
        <div className="min-h-screen bg-black text-white">
          <Sidebar className="border-r border-white/5">
            <SidebarHeader>
              <div className="flex items-center gap-3 px-2 py-1.5">
                <div className="h-8 w-8 rounded-md bg-white/5 grid place-items-center font-bold">V</div>
                <div className="leading-tight">
                  <div className="font-semibold">Verixa</div>
                  <div className="text-xs text-gray-400">Medical Issuer</div>
                </div>
              </div>
            </SidebarHeader>

            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Main</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start">
                        <LayoutDashboard /> <span>Dashboard</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start">
                        <FilePlus2 /> <span>Issue Reports</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start">
                        <History /> <span>Reports History</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarGroup>
                <SidebarGroupLabel>Templates</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start">
                        <Settings /> <span>Template Management</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start">
                        <UploadCloud /> <span>Upload Templates</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start">
                        <PieChart /> <span>Template Analytics</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarGroup>
                <SidebarGroupLabel>Earnings</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start">
                        <Wallet /> <span>POL Balance</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start">
                        <History /> <span>Transaction History</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start">
                        <Wallet /> <span>Withdrawal</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarGroup>
                <SidebarGroupLabel>Settings</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start">
                        <Building2 /> <span>Organization Profile</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start">
                        <Bell /> <span>Notification Preferences</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start">
                        <Users2 /> <span>Wallet Management</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
              <div className="mt-auto px-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                      <div className="text-xs text-gray-400">POL Balance</div>
                      <div className="font-semibold">12.34</div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="text-white">
                    0.01 POL earned per AI verification
                  </TooltipContent>
                </Tooltip>
              </div>
            </SidebarFooter>
          </Sidebar>

          <SidebarInset>
            <header className="sticky top-0 z-10 border-b border-white/5 bg-black/60 backdrop-blur supports-[backdrop-filter]:bg-black/40">
              <div className="flex items-center gap-3 px-4 py-3">
                <SidebarTrigger className="text-white/80" />
                <div className="ml-1 text-sm text-gray-400">Issuer Dashboard</div>
                <div className="ml-auto flex items-center gap-3">
                  <Badge variant="secondary" className="bg-white/10 text-white">Live</Badge>
                  <Avatar className="h-8 w-8" />
                </div>
              </div>
            </header>

            <main className="px-4 py-6">
              {/* Hero Stats */}
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Card className="bg-gradient-to-br from-white/5 to-transparent border-white/10">
                  <CardHeader>
                    <CardDescription>Total Reports Issued</CardDescription>
                    <CardTitle className="text-3xl">1,248</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-emerald-400">+12% this week</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-white/5 to-transparent border-white/10">
                  <CardHeader>
                    <CardDescription>Templates Helping AI</CardDescription>
                    <CardTitle className="text-3xl">17</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-gray-400">Used in verifications</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-white/5 to-transparent border-white/10">
                  <CardHeader>
                    <CardDescription>POL Earned</CardDescription>
                    <CardTitle className="text-3xl">54.21</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-gray-400">+0.01 POL per verification</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-white/5 to-transparent border-white/10">
                  <CardHeader>
                    <CardDescription>Template Success Rate</CardDescription>
                    <CardTitle className="text-3xl">93%</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-emerald-400">AI verified successfully</div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Button className="h-12 justify-start bg-white/10 text-white hover:bg-white/20">
                  <FilePlus2 className="mr-2 h-4 w-4" /> Issue New Report
                </Button>
                <Button className="h-12 justify-start bg-white/10 text-white hover:bg-white/20">
                  <UploadCloud className="mr-2 h-4 w-4" /> Upload Template
                </Button>
                <Button className="h-12 justify-start bg-white/10 text-white hover:bg-white/20">
                  <Wallet className="mr-2 h-4 w-4" /> View Earnings
                </Button>
                <Button className="h-12 justify-start bg-white/10 text-white hover:bg-white/20">
                  <PieChart className="mr-2 h-4 w-4" /> Template Analytics
                </Button>
              </div>

              {/* Body: Activity + Chart */}
              <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <Card className="border-white/10 lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Template Performance</CardTitle>
                    <CardDescription>Usage over the last 7 days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{ uses: { label: "Uses", color: "hsl(0 0% 98%)" } }}
                      className="aspect-[16/6]"
                    >
                      <LineChart data={chartData} margin={{ left: 12, right: 12 }}>
                        <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "#9CA3AF" }} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fill: "#9CA3AF" }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Line type="monotone" dataKey="uses" stroke="hsl(0 0% 98%)" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card className="border-white/10">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Live updates from your organization</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {loading && (
                        <>
                          <Skeleton className="h-4 w-3/4 bg-white/10" />
                          <Skeleton className="h-4 w-2/3 bg-white/10" />
                          <Skeleton className="h-4 w-4/5 bg-white/10" />
                        </>
                      )}
                      {!loading && activities.map((a) => (
                        <div key={a.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
                          <div className="text-sm">{a.text}</div>
                          <div className="mt-1 text-xs text-gray-400">{a.time}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
 
