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
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { config } from "@/lib/config";
import ClaimSubmit from "@/components/patient/claim-submit";
import ClaimStatus from "@/components/patient/claim-status";
import ClaimHistory from "@/components/patient/claim-history";
import MedicalReports from "@/components/patient/medical-reports";
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
  claim_id: number;
  patient_id: number;
  insurance_id: number;
  report_url: string;
  is_verified: boolean;
  issued_by: number | null;
  status: string;
  created_at: string;
};

type IssuedDoc = {
  id: number;
  patient_id: number;
  report_type: string;
  document_url: string;
  issuer_id?: number | null;
  created_at: string;
};

export function PatientDashboard() {
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState<string>("");
  const [active, setActive] = useState<
    "dashboard" | "medical" | "claim-submit" | "claim-status" | "claim-history"
  >("dashboard");
  const [patientId, setPatientId] = useState<number | null>(null);
  const api = useMemo(() => (config.apiBaseUrl || "http://127.0.0.1:8000") + "/api", []);
  // views now render modular components; local claim form/state removed

  // Helpers to read identifiers
  const getStoredUserId = () => {
    if (typeof window === "undefined") return null;
    const val = window.localStorage.getItem("user_id");
    if (val) return Number(val);
    // fallback read from cookies if present
    const m = document.cookie.match(/(?:^|; )user_id=([^;]+)/);
    return m ? Number(decodeURIComponent(m[1])) : null;
  };

  const [issuedDocs, setIssuedDocs] = useState<IssuedDoc[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);

  const handleLogout = () => {
    try {
      // Clear local storage
      try { window.localStorage.removeItem("user_id"); } catch {}
      try { window.localStorage.removeItem("patient_id"); } catch {}
      // Expire cookies
      const expire = "; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      document.cookie = "user_id=" + expire;
      document.cookie = "role=" + expire;
      document.cookie = "patient_user_id=" + expire;
      document.cookie = "issuer_user_id=" + expire;
      document.cookie = "insurance_user_id=" + expire;
      document.cookie = "validator_user_id=" + expire;
    } catch (e) {
      console.error("Logout cleanup failed", e);
    }
    window.location.href = "/login";
  };

  useEffect(() => {
    if (!patientId) return;
    let ignore = false;
    const load = async () => {
      setStatsLoading(true);
      try {
        const [dRes, cRes] = await Promise.all([
          fetch(`${api}/issuer/issued-docs/by-patient/${patientId}`),
          fetch(`${api}/claims/by-patient/${patientId}`),
        ]);
        if (dRes.ok) {
          const dj = await dRes.json();
          if (!ignore) setIssuedDocs(dj.items || []);
        }
        if (cRes.ok) {
          const cj = await cRes.json();
          if (!ignore) setClaims(cj.items || []);
        }
      } catch (e) {
        console.error("Failed to load dashboard stats", e);
      } finally {
        if (!ignore) setStatsLoading(false);
      }
    };
    load();
    return () => { ignore = true; };
  }, [patientId, api]);

  const totalRecords = issuedDocs.length;
  const verifiedRecords = issuedDocs.filter(d => d.issuer_id != null).length; // platform-issued
  const activeClaimsApproved = claims.filter(c => (c.status || "").toLowerCase().includes("approved")).length;
  const recent30Days = issuedDocs.filter(d => {
    const dt = new Date(d.created_at).getTime();
    return Date.now() - dt <= 30 * 24 * 60 * 60 * 1000;
  }).length;
  const latestIssued = [...issuedDocs].sort((a,b)=> new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0,3);
  const latestClaims = [...claims].sort((a,b)=> new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0,4);

  // loading will be controlled by bootstrap and data fetches

  // On every mount/refresh: map user_id -> patient_id and fetch name
  useEffect(() => {
    let ignore = false;
    const bootstrap = async () => {
      setLoading(true);
      try {
        const uid = getStoredUserId();
        if (!uid) return;
        // Fetch all patients and find current user's patient
        const res = await fetch(`${api}/patients/fetch`);
        if (!res.ok) throw new Error(`fetch patients failed: ${res.status}`);
        const data = await res.json();
        const me = (data?.items || []).find((p: any) => Number(p.user_id) === Number(uid));
        if (!me) return;
        if (ignore) return;
        setPatientId(me.patient_id);
        setFullName(`${me.first_name} ${me.last_name}`.trim());
        // Store for potential reuse elsewhere
        try { window.localStorage.setItem("patient_id", String(me.patient_id)); } catch {}
      } catch (e) {
        console.error("Failed to bootstrap patient info", e);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    bootstrap();
    return () => { ignore = true; };
  }, [api]);

  // medical docs loading handled by MedicalReports component

  // claim submit handled inside ClaimSubmit component

  // claim status/history handled in respective components

  // submit logic moved into ClaimSubmit component

  const prettyDate = (iso: string) => { try { return new Date(iso).toLocaleDateString(); } catch { return iso; } };
  const statusVariant = (s: string): "default" | "secondary" | "destructive" | "outline" => {
    const v = (s||"").toLowerCase();
    if (v.includes("approve")) return "secondary";
    if (v.includes("reject") || v.includes("cancel")) return "destructive";
    return "default";
  };

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
                      <SidebarMenuButton className="justify-start" isActive={active === "dashboard"} onClick={()=>setActive("dashboard")}><LayoutDashboard /> <span>Dashboard</span></SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start" isActive={active === "medical"} onClick={()=>setActive("medical")}><FolderHeart /> <span>Medical Reports</span></SidebarMenuButton>
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
                      <SidebarMenuButton className="justify-start" isActive={active === "claim-submit"} onClick={()=>setActive("claim-submit")}><FileText /> <span>Submit Claims</span></SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start" isActive={active === "claim-status"} onClick={()=>setActive("claim-status")}>
                        <ShieldCheck /> <span className="flex-1">Claim Status</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="justify-start" isActive={active === "claim-history"} onClick={()=>setActive("claim-history")}><BookOpenCheck /> <span>Claim History</span></SidebarMenuButton>
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
                  <Button size="sm" variant="outline" onClick={handleLogout}>Logout</Button>
                </div>
              </div>
            </header>

            <main className="pl-4 pr-0 py-6 w-full max-w-full">
              {/* Dashboard View */}
              {active === "dashboard" && (
              <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-2 border-border bg-gradient-to-br from-foreground/5 to-transparent">
                  <CardHeader>
                    <CardTitle className="text-xl">
                      {loading ? <Skeleton className="h-6 w-48 bg-foreground/10" /> : `Welcome back${fullName ? ", " + fullName : ""}`}
                    </CardTitle>
                    <CardDescription>Your health overview and recent updates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-lg border border-border bg-foreground/5 p-3">
                        <div className="text-xs text-muted-foreground">Total Records</div>
                        <div className="mt-1 text-2xl font-semibold">{loading || statsLoading ? <Skeleton className="h-6 w-12 bg-foreground/10" /> : totalRecords}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{loading || statsLoading ? <Skeleton className="h-4 w-20 bg-foreground/10" /> : `${verifiedRecords} verified (platform)`}</div>
                      </div>
                      <div className="rounded-lg border border-border bg-foreground/5 p-3">
                        <div className="text-xs text-muted-foreground">Active Claims (Approved)</div>
                        <div className="mt-1 text-2xl font-semibold">{loading || statsLoading ? <Skeleton className="h-6 w-12 bg-foreground/10" /> : activeClaimsApproved}</div>
                        <div className="mt-1 text-xs text-muted-foreground">Total approved claims</div>
                      </div>
                      <div className="rounded-lg border border-border bg-foreground/5 p-3">
                        <div className="text-xs text-muted-foreground">Recent Reports</div>
                        <div className="mt-1 text-2xl font-semibold">{loading || statsLoading ? <Skeleton className="h-6 w-12 bg-foreground/10" /> : recent30Days}</div>
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
                      <Button className="justify-start bg-foreground/10 text-foreground hover:bg-foreground/20" onClick={()=>setActive("claim-submit")}><FileCheck2 className="mr-2 h-4 w-4"/> Submit New Claim</Button>
                      <Button className="justify-start bg-foreground/10 text-foreground hover:bg-foreground/20"><UploadCloud className="mr-2 h-4 w-4"/> Upload External Report</Button>
                      <Button variant="secondary" className="justify-start" onClick={()=>setActive("medical")}><FolderHeart className="mr-2 h-4 w-4"/> View All Records</Button>
                      <Button variant="outline" className="justify-start"><LifeBuoy className="mr-2 h-4 w-4"/> Emergency Access</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              )}

              {active === "dashboard" && (
              <div className="mt-6 grid gap-6 lg:grid-cols-3">
                {/* Recent Medical Records: latest issued docs */}
                <Card className="lg:col-span-2 border-border">
                  <CardHeader>
                    <CardTitle>Recent Medical Records</CardTitle>
                    <CardDescription>Latest issued documents from our platform</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />
                      <div className="space-y-5">
                        {(loading || statsLoading) && (
                          <>
                            <Skeleton className="h-14 w-full bg-foreground/10" />
                            <Skeleton className="h-14 w-11/12 bg-foreground/10" />
                            <Skeleton className="h-14 w-10/12 bg-foreground/10" />
                          </>
                        )}
                        {!loading && !statsLoading && latestIssued.map((d) => (
                          <div key={d.id} className="relative pl-8">
                            <div className="absolute left-0 top-2 h-3 w-3 rounded-full bg-foreground" />
                            <div className="rounded-lg border border-border bg-foreground/5 p-3">
                              <div className="flex items-center gap-2 text-sm">
                                <FolderHeart className="h-4 w-4" />
                                <div className="font-medium">{d.report_type}</div>
                                <div className="ml-auto text-xs text-muted-foreground">{prettyDate(d.created_at)}</div>
                              </div>
                              <div className="mt-1 text-xs text-muted-foreground">Platform Issued {d.issuer_id ? `• Issuer #${d.issuer_id}` : ""}</div>
                              <div className="mt-2 flex items-center gap-2">
                                <a className="text-xs text-primary hover:underline" href={d.document_url} target="_blank" rel="noopener noreferrer">Preview</a>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Claims status snapshot */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle>Insurance Claim Status</CardTitle>
                    <CardDescription>Latest updates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {(loading || statsLoading) ? (
                      <div className="space-y-2">
                        <Skeleton className="h-10 w-full bg-foreground/10" />
                        <Skeleton className="h-10 w-11/12 bg-foreground/10" />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {latestClaims.length === 0 && (
                          <div className="text-sm text-muted-foreground">No recent claims.</div>
                        )}
                        {latestClaims.map((c) => (
                          <div key={c.claim_id} className="rounded-lg border border-border p-3 bg-foreground/5">
                            <div className="flex items-center gap-2 text-sm">
                              <ShieldCheck className="h-4 w-4" />
                              <div className="font-medium">Claim #{c.claim_id}</div>
                              <Badge className="ml-auto" variant={statusVariant(c.status)}>{c.status}</Badge>
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground flex items-center justify-between">
                              <span>{prettyDate(c.created_at)}</span>
                              {c.report_url && <a className="text-primary hover:underline" href={c.report_url} target="_blank" rel="noopener noreferrer">Preview</a>}
                            </div>
                          </div>
                        ))}
                        <div className="flex items-center gap-3 pt-1">
                          <Button size="sm" onClick={()=>setActive("claim-status")}>
                            <ShieldCheck className="mr-2 h-4 w-4" /> Open Claim Status
                          </Button>
                          <Button size="sm" variant="outline" onClick={()=>setActive("claim-history")}>
                            <BookOpenCheck className="mr-2 h-4 w-4" /> View History
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              )}

              {/* Medical Reports view */}
              {active === "medical" && (
                patientId ? <MedicalReports patientId={patientId} /> : <Skeleton className="h-24 w-full bg-foreground/10" />
              )}

              {/* Claim Submit view */}
              {active === "claim-submit" && (
                patientId ? <ClaimSubmit patientId={patientId} /> : <Skeleton className="h-24 w-full bg-foreground/10" />
              )}

              {/* Claim Status view */}
              {active === "claim-status" && (
                patientId ? <ClaimStatus patientId={patientId} /> : <Skeleton className="h-24 w-full bg-foreground/10" />
              )}

              {/* Claim History view */}
              {active === "claim-history" && (
                patientId ? <ClaimHistory patientId={patientId} /> : <Skeleton className="h-24 w-full bg-foreground/10" />
              )}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}

