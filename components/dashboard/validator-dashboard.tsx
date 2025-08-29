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
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import {
  ListChecks,
  PlayCircle,
  History,
  Coins,
  Banknote,
  LineChart,
  Gauge,
  School,
  BookOpenCheck,
  Bell,
  Settings,
  UserCog,
  Filter,
  FileText,
  Zap,
} from "lucide-react";
import AvailableQueue from "@/components/validator/available-queue";
import CompletedHistory from "@/components/validator/completed-history";
import ActiveValidations from "@/components/validator/active-validations";

type ValidationItem = {
  id: string;
  type: string;
  reward: number; // POL
  priority: "Urgent" | "High" | "Normal";
  aiConfidence: number; // 0-100
  estMin: number;
  assigned: number;
};

export function ValidatorDashboard() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setTick((t) => (t + 1) % 1000000), 2000);
    return () => clearInterval(i);
  }, []);

  const [view, setView] = useState<"dashboard" | "available" | "active" | "history">("dashboard");

  const handleLogout = () => {
    try {
      // Clear local storage
      try { window.localStorage.removeItem("user_id"); } catch {}
      // Expire cookies
      const expire = "; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      document.cookie = "wallet_address=" + expire;
      document.cookie = "user_id=" + expire;
      document.cookie = "role=" + expire;
      document.cookie = "issuer_user_id=" + expire;
      document.cookie = "patient_user_id=" + expire;
      document.cookie = "insurance_user_id=" + expire;
      document.cookie = "validator_user_id=" + expire;
    } catch (e) {
      console.error("Failed clearing wallet cookie", e);
    }
    window.location.href = "/login";
  };

  const available = 24 + (tick % 3);
  const accuracy = 96.4 + ((tick % 3) - 1) * 0.2;
  const earnedToday = 18.5 + (tick % 2) * 0.2;
  const stake = 250;

  const validations: ValidationItem[] = [
    { id: "v1", type: "Blood Test", reward: 1.2, priority: "Urgent", aiConfidence: 41, estMin: 6, assigned: 1 },
    { id: "v2", type: "X-Ray Chest", reward: 0.9, priority: "High", aiConfidence: 68, estMin: 8, assigned: 2 },
    { id: "v3", type: "MRI Knee", reward: 1.5, priority: "Normal", aiConfidence: 85, estMin: 12, assigned: 1 },
    { id: "v4", type: "CT Brain", reward: 2.0, priority: "High", aiConfidence: 55, estMin: 14, assigned: 3 },
    { id: "v5", type: "ECG", reward: 0.8, priority: "Normal", aiConfidence: 92, estMin: 5, assigned: 0 },
    { id: "v6", type: "Ultrasound Abdomen", reward: 1.1, priority: "Urgent", aiConfidence: 33, estMin: 10, assigned: 2 },
  ];

  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="min-h-screen w-full bg-background text-foreground flex overflow-x-hidden">
          <Sidebar className="border-r border-border">
            <SidebarHeader>
              <div className="flex items-center gap-3 px-2 py-1.5">
                <div className="h-8 w-8 rounded-md bg-foreground/5 grid place-items-center font-bold">V</div>
                <div className="leading-tight">
                  <div className="font-semibold">Verixa</div>
                  <div className="text-xs text-muted-foreground">Validator</div>
                </div>
              </div>
            </SidebarHeader>

            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Validation</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start" isActive={view === "dashboard"} onClick={() => setView("dashboard")}><LineChart /> <span>Dashboard</span></SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start" isActive={view === "available"} onClick={() => setView("available")}><ListChecks /> <span>Available Queue</span></SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start" isActive={view === "active"} onClick={() => setView("active")}> <PlayCircle /> <span>Active Validations</span></SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start" isActive={view === "history"} onClick={() => setView("history")}><History /> <span>Completed History</span></SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarGroup>
                <SidebarGroupLabel>Earnings</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start"><Coins /> <span>POL Balance</span></SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start"><Banknote /> <span>Staking Management</span></SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start"><LineChart /> <span>Transaction History</span></SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarGroup>
                <SidebarGroupLabel>Performance</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start"><Gauge /> <span>Accuracy Metrics</span></SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start"><Zap /> <span>Reputation Score</span></SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start"><BookOpenCheck /> <span>Leaderboard</span></SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarGroup>
                <SidebarGroupLabel>Learning</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start"><School /> <span>Guidelines</span></SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start"><BookOpenCheck /> <span>Training Materials</span></SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start"><Bell /> <span>Feedback</span></SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarGroup>
                <SidebarGroupLabel>Settings</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start"><UserCog /> <span>Professional Profile</span></SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start"><Settings /> <span>Availability</span></SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start"><Bell /> <span>Notification Preferences</span></SidebarMenuButton>
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
                      <div className="text-xs text-muted-foreground">Streak</div>
                      <div className="font-semibold">{5 + (tick % 3)} days</div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="text-foreground">Consecutive accurate validations</TooltipContent>
                </Tooltip>
              </div>
            </SidebarFooter>
          </Sidebar>

          <SidebarInset className="flex-1 min-w-0 w-full overflow-x-hidden">
            <header className="sticky top-0 z-10 border-b border-border bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40">
              <div className="flex items-center gap-3 pl-4 pr-0 py-3">
                <SidebarTrigger className="text-foreground/80" />
                <div className="ml-1 text-sm text-muted-foreground">Validator Dashboard</div>
                <div className="ml-auto flex items-center gap-3">
                  <Badge variant="secondary">Pro</Badge>
                  <Avatar className="h-8 w-8" />
                  <Button size="sm" variant="outline" onClick={handleLogout}>Logout</Button>
                </div>
              </div>
            </header>

            <main className="pl-4 pr-0 py-6 w-full max-w-full">
              {view === "dashboard" && (
                <>
                  {/* Performance Overview */}
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <Card className="border-border bg-foreground/5">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Available Validations</CardTitle>
                        <CardDescription>Potential earnings</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-semibold">{available}</div>
                        <div className="mt-1 text-xs text-muted-foreground">Up to ~{(available * 1).toFixed(1)} POL</div>
                      </CardContent>
                    </Card>

                    <Card className="border-border">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Current Accuracy</CardTitle>
                        <CardDescription>Impacts reputation</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-baseline gap-2">
                          <div className="text-3xl font-semibold">{accuracy.toFixed(1)}%</div>
                          <Badge variant="secondary" className="text-xs">+0.2%</Badge>
                        </div>
                        <div className="mt-2"><Progress value={Math.min(100, accuracy)} /></div>
                      </CardContent>
                    </Card>

                    <Card className="border-border">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">POL Earned</CardTitle>
                        <CardDescription>Today / Week / Month</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-semibold">{earnedToday.toFixed(2)} POL</div>
                        <div className="mt-1 text-xs text-muted-foreground">Week: 62.8 • Month: 241.3</div>
                      </CardContent>
                    </Card>

                    <Card className="border-border">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Current Staking</CardTitle>
                        <CardDescription>Lock status</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-semibold">{stake} POL</div>
                        <div className="mt-1 text-xs text-muted-foreground">Unlock in 3d 12h</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Available Validations + Quick Stats */}
                  <div className="mt-6 grid gap-6 xl:grid-cols-3">
                    <Card className="xl:col-span-2 border-border">
                      <CardHeader>
                        <CardTitle>Available Validations</CardTitle>
                        <CardDescription>Filter by type, reward, priority, confidence</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <Button size="sm" variant="secondary"><Filter className="mr-1 h-4 w-4"/> Document Type</Button>
                          <Button size="sm" variant="outline">Reward (High→Low)</Button>
                          <Button size="sm" variant="outline">Priority</Button>
                          <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
                            AI confidence
                            <div className="w-36"><Slider defaultValue={[40, 90]} min={0} max={100} step={1} /></div>
                          </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          {validations.map((v) => (
                            <div key={v.id} className="rounded-lg border border-border p-3 bg-foreground/5">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                <div className="font-medium">{v.type}</div>
                                <Badge className="ml-auto" variant={v.priority === "Urgent" ? "destructive" : "secondary"}>{v.priority}</Badge>
                              </div>
                              <div className="mt-1 text-xs text-muted-foreground">AI confidence: {v.aiConfidence}% • Est: {v.estMin} min • Assigned: {v.assigned}</div>
                              <div className="mt-2 flex items-center gap-3">
                                <div className="text-sm font-medium">Reward: {v.reward} POL</div>
                                <div className="ml-auto flex gap-2">
                                  <Button size="sm" variant="ghost">Details</Button>
                                  <Button size="sm">Start</Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <Card className="border-border">
                      <CardHeader>
                        <CardTitle>Quick Stats</CardTitle>
                        <CardDescription>Today</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="rounded-lg border border-border p-3 bg-foreground/5">
                            <div className="text-xs text-muted-foreground">Earnings</div>
                            <div className="mt-1 text-xl font-semibold">{earnedToday.toFixed(2)} POL</div>
                          </div>
                          <div className="rounded-lg border border-border p-3 bg-foreground/5">
                            <div className="text-xs text-muted-foreground">Validation Streak</div>
                            <div className="mt-1 text-xl font-semibold">{5 + (tick % 3)} days</div>
                          </div>
                          <div className="rounded-lg border border-border p-3 bg-foreground/5">
                            <div className="text-xs text-muted-foreground">Time to Next Payout</div>
                            <div className="mt-1 text-xl font-semibold">2h 18m</div>
                          </div>
                          <div className="rounded-lg border border-border p-3 bg-foreground/5">
                            <div className="text-xs text-muted-foreground">Staking Status</div>
                            <div className="mt-1 text-xl font-semibold">Locked • 3d 12h</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Records/History preview */}
                  <Card className="mt-6 border-border">
                    <CardHeader>
                      <CardTitle>History & Performance</CardTitle>
                      <CardDescription>Recent validations and trends</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="history">
                        <TabsList>
                          <TabsTrigger value="history">History</TabsTrigger>
                          <TabsTrigger value="analytics">Analytics</TabsTrigger>
                        </TabsList>
                        <TabsContent value="history" className="mt-4">
                          <div className="grid gap-3 md:grid-cols-3">
                            {["Blood Test", "X-Ray", "MRI"].map((t, i) => (
                              <div key={t+"-h-"+i} className="rounded-lg border border-border bg-foreground/5 p-3">
                                <div className="flex items-center gap-2 text-sm">
                                  <FileText className="h-4 w-4" />
                                  <div className="font-medium">{t}</div>
                                  <Badge className="ml-auto" variant="secondary">Acc {92 + i}%</Badge>
                                </div>
                                <div className="mt-1 text-xs text-muted-foreground">Duration: {6 + i}m • Earned: {(1 + i*0.3).toFixed(1)} POL</div>
                              </div>
                            ))}
                          </div>
                        </TabsContent>
                        <TabsContent value="analytics" className="mt-4">
                          <div className="grid gap-3 md:grid-cols-3">
                            <div className="rounded-lg border border-border p-3">
                              <div className="text-sm font-medium">Accuracy Trend</div>
                              <div className="mt-2"><Progress value={90} /></div>
                              <div className="mt-1 text-xs text-muted-foreground">+3% last 14 days</div>
                            </div>
                            <div className="rounded-lg border border-border p-3">
                              <div className="text-sm font-medium">Earnings Progression</div>
                              <div className="mt-2"><Progress value={70} /></div>
                              <div className="mt-1 text-xs text-muted-foreground">+18 POL this week</div>
                            </div>
                            <div className="rounded-lg border border-border p-3">
                              <div className="text-sm font-medium">Specialization Performance</div>
                              <div className="mt-2"><Progress value={60} /></div>
                              <div className="mt-1 text-xs text-muted-foreground">Best: Imaging</div>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </>
              )}

              {view === "available" && (
                <AvailableQueue />
              )}

              {view === "active" && (
                <ActiveValidations />
              )}

              {view === "history" && (
                <CompletedHistory />
              )}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}

