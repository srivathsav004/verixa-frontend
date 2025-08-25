"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import {
  LayoutDashboard,
  BarChart3,
  LineChart,
  ShieldCheck,
  UploadCloud,
  FolderUp,
  Files,
  AlertTriangle,
  UserCog,
  ServerCog,
  Wallet,
  FileChartColumn,
} from "lucide-react";
import ActiveClaims from "@/components/insurance/active-claims";
import ApprovedClaims from "@/components/insurance/approved-claims";
import FraudAlerts from "@/components/insurance/fraud-alerts";
import UploadDocuments from "@/components/insurance/upload-documents";
import ValidateDocuments from "@/components/insurance/validate-documents";
import { config } from "@/lib/config";

type QueueItem = { id: string; name: string; priority: "Urgent" | "High" | "Normal"; etaMin: number };
type AlertItem = { id: string; severity: "Critical" | "High" | "Medium"; title: string; pattern: string };

export function InsuranceDashboard() {
  const api = useMemo(() => (config.apiBaseUrl || "http://127.0.0.1:8000") + "/api", []);
  const [selectedView, setSelectedView] = useState<"dashboard" | "upload" | "validate" | "active" | "approved" | "fraud">("dashboard");
  const [insuranceId, setInsuranceId] = useState<number | null>(null);
  const [resolving, setResolving] = useState<boolean>(false);
  // Animated counters (mocked)
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setTick((t) => (t + 1) % 1000000), 1500);
    return () => clearInterval(i);
  }, []);

  const docsToday = 1240 + (tick % 7);
  const fraudRate = 8.7 + ((tick % 3) - 1) * 0.2; // e.g., 8.5% - 8.9%
  const costSavings = 38250 + (tick % 5) * 120; // USD
  const avgTimeMin = 16 + (tick % 2); // minutes

  const queue: QueueItem[] = [
    { id: "q1", name: "External Report Batch", priority: "Urgent", etaMin: 15 },
    { id: "q2", name: "Daily Claims Intake", priority: "High", etaMin: 40 },
    { id: "q3", name: "Normal Verification", priority: "Normal", etaMin: 120 },
  ];

  const alerts: AlertItem[] = [
    { id: "a1", severity: "Critical", title: "Tampered MRI Report", pattern: "Copy-move forgery pattern detected" },
    { id: "a2", severity: "High", title: "Template Mismatch", pattern: "Issuer template not matching submission" },
    { id: "a3", severity: "Medium", title: "Anomaly in Metadata", pattern: "Creation date precedes scan timestamp" },
  ];

  const validatorsActive = 18;

  // Resolve insuranceId from cookie/localStorage, with API fallback
  useEffect(() => {
    const getCookie = (name: string) => {
      if (typeof document === "undefined") return null;
      const match = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, "\\$1") + "=([^;]*)"));
      return match ? decodeURIComponent(match[1]) : null;
    };
    const userIdStr = (typeof window !== "undefined" && window.localStorage.getItem("user_id")) || getCookie("user_id");
    const insuranceUserIdStr = getCookie("insurance_user_id");
    const cachedInsuranceId = getCookie("insurance_id");
    if (cachedInsuranceId) {
      const n = Number(cachedInsuranceId);
      if (!Number.isNaN(n)) setInsuranceId(n);
    }
    const tryResolve = async () => {
      const candidateUserId = insuranceUserIdStr || userIdStr;
      if (!candidateUserId) return;
      const uid = Number(candidateUserId);
      if (Number.isNaN(uid)) return;
      setResolving(true);
      try {
        const res = await fetch(`${api}/insurance/by-user/${uid}`);
        if (res.ok) {
          const j = await res.json();
          if (j?.insurance_id) {
            setInsuranceId(j.insurance_id);
            // cache as cookie for faster reloads
            try { document.cookie = `insurance_id=${j.insurance_id}; path=/`; } catch {}
          }
        }
      } catch (e) {
        console.error("resolve insurance by user failed", e);
      } finally {
        setResolving(false);
      }
    };
    if (!insuranceId) {
      tryResolve();
    }
  }, [api, insuranceId]);

  const handleLogout = () => {
    try {
      // Clear local storage
      try { window.localStorage.removeItem("user_id"); } catch {}
      // Expire cookies
      const expire = "; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      document.cookie = "user_id=" + expire;
      document.cookie = "role=" + expire;
      document.cookie = "issuer_user_id=" + expire;
      document.cookie = "patient_user_id=" + expire;
      document.cookie = "insurance_user_id=" + expire;
      document.cookie = "validator_user_id=" + expire;
      document.cookie = "wallet_address=" + expire;
    } catch (e) {
      console.error("Logout cleanup failed", e);
    }
    window.location.href = "/login";
  };

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
                  <div className="text-xs text-muted-foreground">Insurance</div>
                </div>
              </div>
            </SidebarHeader>

            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Overview</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start" isActive={selectedView === "dashboard"} onClick={() => setSelectedView("dashboard")}><LayoutDashboard /> <span>Dashboard</span></SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start"><BarChart3 /> <span>Analytics</span></SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start"><LineChart /> <span>Cost Savings</span></SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarGroup>
                <SidebarGroupLabel>Verification</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start" isActive={selectedView === "upload"} onClick={() => setSelectedView("upload")}><UploadCloud /> <span>Upload Documents</span></SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start" isActive={selectedView === "validate"} onClick={() => setSelectedView("validate")}><ShieldCheck /> <span>Validate Documents</span></SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start"><ShieldCheck /> <span>Verification Queue</span></SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start"><FolderUp /> <span>Bulk Upload</span></SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarGroup>
                <SidebarGroupLabel>Claims</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start" isActive={selectedView === "active"} onClick={() => setSelectedView("active")}><Files /> <span>Active Claims</span></SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start" isActive={selectedView === "approved"} onClick={() => setSelectedView("approved")}><FileChartColumn /> <span>Approved Claims</span></SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start" isActive={selectedView === "fraud"} onClick={() => setSelectedView("fraud")}><AlertTriangle /> <span>Fraud Alerts</span></SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarGroup>
                <SidebarGroupLabel>Management</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start"><UserCog /> <span>Team Settings</span></SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start"><ServerCog /> <span>API Integration</span></SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start"><Wallet /> <span>Billing</span></SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarGroup>
                <SidebarGroupLabel>Reports</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start"><AlertTriangle /> <span>Fraud Analytics</span></SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start"><BarChart3 /> <span>Performance Reports</span></SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start"><LineChart /> <span>ROI Analysis</span></SidebarMenuButton>
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
                      <div className="text-xs text-muted-foreground">Validators Active</div>
                      <div className="font-semibold">{validatorsActive}</div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="text-foreground">Currently online validators</TooltipContent>
                </Tooltip>
              </div>
            </SidebarFooter>
          </Sidebar>

          <SidebarInset className="flex-1 min-w-0 w-full overflow-x-hidden">
            <header className="sticky top-0 z-10 border-b border-border bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40">
              <div className="flex items-center gap-3 pl-4 pr-0 py-3">
                <SidebarTrigger className="text-foreground/80" />
                <div className="ml-1 text-sm text-muted-foreground">Insurance Company Dashboard</div>
                <div className="ml-auto flex items-center gap-3">
                  <Badge variant="secondary">Enterprise</Badge>
                  <Avatar className="h-8 w-8" />
                  <Button size="sm" variant="outline" onClick={handleLogout}>Logout</Button>
                </div>
              </div>
            </header>

            <main className="pl-4 pr-0 py-6 w-full max-w-full">
              {selectedView !== "dashboard" ? (
                <div className="max-w-full">
                  {insuranceId ? (
                    selectedView === "upload" ? (
                      <UploadDocuments insuranceId={insuranceId} />
                    ) : selectedView === "validate" ? (
                      <ValidateDocuments insuranceId={insuranceId} />
                    ) : selectedView === "active" ? (
                      <ActiveClaims insuranceId={insuranceId} />
                    ) : selectedView === "approved" ? (
                      <ApprovedClaims insuranceId={insuranceId} />
                    ) : (
                      <FraudAlerts insuranceId={insuranceId} />
                    )
                  ) : (
                    <div className="text-sm text-muted-foreground">{resolving ? "Resolving insurance account..." : "Insurance account not found."}</div>
                  )}
                </div>
              ) : (
                <>
                  {/* Executive Metrics (Bento Grid) */}
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Card className="border-border bg-foreground/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Documents Verified Today</CardTitle>
                    <CardDescription>Cost per verification</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-semibold">{docsToday.toLocaleString("en-US")}</div>
                    <div className="mt-1 text-xs text-muted-foreground">~ 0.12 POL</div>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Fraud Detection Rate</CardTitle>
                    <CardDescription>Rolling 7 days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-2">
                      <div className="text-3xl font-semibold">{fraudRate.toFixed(1)}%</div>
                      <Badge variant="secondary" className="text-xs">+0.3%</Badge>
                    </div>
                    <div className="mt-2">
                      <Progress value={Math.min(100, fraudRate)} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Cost Savings vs Manual</CardTitle>
                    <CardDescription>Month-to-date</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-semibold">${costSavings.toLocaleString("en-US")}</div>
                    <div className="mt-1 text-xs text-muted-foreground">+28% vs manual process</div>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Average Verification Time</CardTitle>
                    <CardDescription>AI vs Days (manual)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-semibold">{avgTimeMin}m</div>
                    <div className="mt-1 text-xs text-muted-foreground">Manual: 1-3 days</div>
                  </CardContent>
                </Card>
              </div>

              {/* Verification Queue Overview */}
              <div className="mt-6 grid gap-6 xl:grid-cols-3">
                <Card className="xl:col-span-2 border-border">
                  <CardHeader>
                    <CardTitle>Verification Queue</CardTitle>
                    <CardDescription>Live counts and ETAs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 md:grid-cols-3">
                      {queue.map((q) => (
                        <div key={q.id} className="rounded-lg border border-border bg-foreground/5 p-3">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4" />
                            <div className="font-medium">{q.name}</div>
                            <Badge className="ml-auto" variant="secondary">{q.priority}</Badge>
                          </div>
                          <div className="mt-2">
                            <Progress value={Math.max(5, 100 - q.etaMin)} />
                            <div className="mt-1 text-xs text-muted-foreground">ETA ~ {q.etaMin} minutes</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button size="sm" variant="secondary">Start Batch</Button>
                      <Button size="sm" variant="outline">Pause Queue</Button>
                      <Button size="sm" variant="outline">Rebalance</Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Fraud Alerts */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle>Fraud Detection Alerts</CardTitle>
                    <CardDescription>Pattern recognition and severity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {alerts.map((a) => (
                        <div key={a.id} className="rounded-lg border border-border p-3 bg-foreground/5">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            <div className="font-medium">{a.title}</div>
                            <Badge className="ml-auto" variant={a.severity === "Critical" ? "destructive" : "secondary"}>{a.severity}</Badge>
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">{a.pattern}</div>
                          <div className="mt-2 flex gap-2">
                            <Button size="sm" variant="ghost">Investigate</Button>
                            <Button size="sm" variant="ghost">Mark as False Positive</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Cost Analysis */}
              <Card className="mt-6 border-border">
                <CardHeader>
                  <CardTitle>Cost Analysis</CardTitle>
                  <CardDescription>ROI and verification cost breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="roi">
                    <TabsList>
                      <TabsTrigger value="roi">ROI</TabsTrigger>
                      <TabsTrigger value="breakdown">Cost Breakdown</TabsTrigger>
                      <TabsTrigger value="budget">Budget</TabsTrigger>
                    </TabsList>

                    <TabsContent value="roi" className="mt-4">
                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="rounded-lg border border-border bg-foreground/5 p-3">
                          <div className="text-xs text-muted-foreground">Monthly Savings</div>
                          <div className="mt-1 text-2xl font-semibold">${(costSavings * 3).toLocaleString("en-US")}</div>
                        </div>
                        <div className="rounded-lg border border-border bg-foreground/5 p-3">
                          <div className="text-xs text-muted-foreground">ROI vs Manual</div>
                          <div className="mt-1 text-2xl font-semibold">+212%</div>
                        </div>
                        <div className="rounded-lg border border-border bg-foreground/5 p-3">
                          <div className="text-xs text-muted-foreground">Break-even</div>
                          <div className="mt-1 text-2xl font-semibold">7 days</div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="breakdown" className="mt-4">
                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="rounded-lg border border-border p-3">
                          <div className="text-sm font-medium">AI Verification</div>
                          <div className="mt-2"><Progress value={65} /></div>
                          <div className="mt-1 text-xs text-muted-foreground">65% of total volume</div>
                        </div>
                        <div className="rounded-lg border border-border p-3">
                          <div className="text-sm font-medium">Validator Verification</div>
                          <div className="mt-2"><Progress value={28} /></div>
                          <div className="mt-1 text-xs text-muted-foreground">28% of total volume</div>
                        </div>
                        <div className="rounded-lg border border-border p-3">
                          <div className="text-sm font-medium">Manual</div>
                          <div className="mt-2"><Progress value={7} /></div>
                          <div className="mt-1 text-xs text-muted-foreground">7% of total volume</div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="budget" className="mt-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-lg border border-border p-4">
                          <div className="text-sm font-medium">Reward Setting (min 5 POL)</div>
                          <div className="mt-3">
                            <Slider defaultValue={[5]} min={5} max={20} step={0.5} />
                          </div>
                          <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                            <div className="rounded-md bg-foreground/5 p-2">Validators: 90% (4.5 POL)</div>
                            <div className="rounded-md bg-foreground/5 p-2">Platform: 10% (0.5 POL)</div>
                            <div className="rounded-md bg-foreground/5 p-2">Issuer bonus: 0.01 POL</div>
                          </div>
                        </div>

                        <div className="rounded-lg border border-border p-4">
                          <div className="text-sm font-medium">Priority Selection</div>
                          <div className="mt-3 grid grid-cols-3 gap-2">
                            <Button variant="secondary">Normal (24h)</Button>
                            <Button variant="outline">High (12h)</Button>
                            <Button variant="outline">Urgent (6h)</Button>
                          </div>
                          <div className="mt-3 text-xs text-muted-foreground">Validators needed for consensus: 3</div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
                </>
              )}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
