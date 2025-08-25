"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { config } from "@/lib/config";

export type UploadDocumentsProps = { insuranceId: number };

type ClaimItem = {
  claim_id: number;
  patient_id: number;
  insurance_id: number;
  report_url: string;
  is_verified: boolean;
  issued_by?: number | null;
  status: string;
  created_at: string;
};

type PaginatedClaimsResponse = {
  items: ClaimItem[];
  total: number;
  page: number;
  page_size: number;
};

type Thresholds = {
  insurance_id: number;
  auto_approval_threshold: number | null;
  manual_review_threshold: number | null;
  rejection_threshold: number | null;
};

export default function UploadDocuments({ insuranceId }: UploadDocumentsProps) {
  const api = useMemo(() => (config.apiBaseUrl || "http://127.0.0.1:8000") + "/api", []);
  const { toast } = useToast();

  // data
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ClaimItem[]>([]);
  const [total, setTotal] = useState(0);

  // filters/pagination
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // thresholds
  const [thresholds, setThresholds] = useState<Thresholds | null>(null);

  // selection and AI scores
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [aiScores, setAiScores] = useState<Record<number, number>>({});
  const [patientNames, setPatientNames] = useState<Record<number, string>>({});
  const [bucketFilter, setBucketFilter] = useState<"all" | "auto" | "manual" | "reject">("all");

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);

  useEffect(() => {
    // fetch thresholds
    const loadThresholds = async () => {
      try {
        const res = await fetch(`${api}/insurance/contact-tech/${insuranceId}`);
        if (res.ok) {
          const j: Thresholds = await res.json();
          setThresholds(j);
        }
      } catch (e) {
        console.error("threshold fetch failed", e);
      }
    };
    if (insuranceId) loadThresholds();
  }, [api, insuranceId]);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
      if (search.trim()) params.set("search", search.trim());
      const res = await fetch(`${api}/claims/unverified-external/by-insurance/${insuranceId}?${params.toString()}`);
      if (!res.ok) throw new Error(`fetch failed ${res.status}`);
      const j: PaginatedClaimsResponse = await res.json();
      setItems(j.items || []);
      setTotal(j.total || 0);
      // clear selection for non-visible
      setSelected({});
      // prefetch patient names for current page
      prefetchPatientNames(j.items || []);
      // preload existing AI evaluations for current page
      await loadAIEvals(j.items || []);
    } catch (e) {
      console.error(e);
      toast({ title: "Could not load claims", description: "Please retry in a moment.", /* neutral styling */ variant: "default", className: "bg-muted text-foreground" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!insuranceId) return;
    fetchClaims();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [insuranceId, page, pageSize, search]);

  // hoisted bucket helper so it's available before useMemo below
  function bucket(score: number | undefined) {
    if (!thresholds || score == null) return "unscored" as const;
    const { auto_approval_threshold: autoT, manual_review_threshold: manualT, rejection_threshold: rejectT } = thresholds;
    // Treat undefined thresholds safely; fall back to typical ordering: reject < manual < auto.
    const r = rejectT ?? 30;
    const m = manualT ?? 60;
    const a = autoT ?? 80;
    if (score >= a) return "auto" as const;
    if (score < r) return "reject" as const;
    if (score >= r && score < m) return "manual" as const;
    return "manual" as const; // between manual and auto -> manual
  }

  // filter rows per selected bucket (placed before references)
  const filteredItems = useMemo(() => {
    if (bucketFilter === "all") return items;
    return items.filter((r) => {
      const s = aiScores[r.claim_id];
      const b = bucket(s);
      return b === bucketFilter;
    });
  }, [items, aiScores, bucketFilter, thresholds]);

  const handleToggleAll = (checked: boolean) => {
    const pageIds = filteredItems.map((i) => i.claim_id);
    const next: Record<number, boolean> = { ...selected };
    pageIds.forEach((id) => (next[id] = checked));
    setSelected(next);
  };

  const handleToggle = (id: number, checked: boolean) => setSelected((s) => ({ ...s, [id]: checked }));

  // Load AI evals for current rows from backend so refresh preserves scores
  const loadAIEvals = async (rows: ClaimItem[]) => {
    const ids = rows.map((r) => r.claim_id);
    if (!ids.length) return;
    try {
      const res = await fetch(`${api}/claims/ai-evaluations/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim_ids: ids }),
      });
      if (!res.ok) return;
      const evals: Array<{ claim_id: number; ai_score: number; bucket?: string; evaluated_at: string }> = await res.json();
      const map: Record<number, number> = {};
      evals.forEach((e) => { map[e.claim_id] = e.ai_score; });
      setAiScores((prev) => ({ ...prev, ...map }));
    } catch (err) {
      console.warn("ai eval preload failed", err);
    }
  };

  const generateScores = async () => {
    const selIds = Object.entries(selected).filter(([, v]) => v).map(([k]) => Number(k));
    if (selIds.length === 0) {
      toast({ title: "Select claims first", description: "Pick one or more rows to score.", variant: "default", className: "bg-muted text-foreground" });
      return;
    }
    // Only generate for claims that don't already have a saved score
    const toGenerate = selIds.filter((id) => aiScores[id] == null);
    if (toGenerate.length === 0) {
      toast({ title: "Already scored", description: "Selected claims already have AI scores.", variant: "default", className: "bg-muted text-foreground" });
      return;
    }
    const next: Record<number, number> = { ...aiScores };
    toGenerate.forEach((id) => (next[id] = Math.floor(Math.random() * 101)));
    setAiScores(next);
    // auto-persist to backend
    try {
      const evaluations = toGenerate.map((id) => {
        const claim = items.find((i) => i.claim_id === id);
        const b = bucket(next[id]);
        return {
          claim_id: id,
          report_type: undefined,
          document_url: claim?.report_url,
          ai_score: next[id],
          bucket: b === "unscored" ? undefined : b,
        };
      });
      const res = await fetch(`${api}/claims/ai-evaluations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ evaluations }),
      });
      if (!res.ok) throw new Error("persist failed");
      toast({ title: "AI scores saved", description: `Generated and saved for ${toGenerate.length} claim(s).` });
    } catch (e) {
      console.error(e);
      toast({ title: "Save failed", description: "Scores generated locally but not saved.", variant: "destructive" });
    }
  };

  // bucket defined above as a function declaration

  const approveSelected = async () => {
    const ids = Object.entries(selected).filter(([, v]) => v).map(([k]) => Number(k));
    if (ids.length === 0) return toast({ title: "No selection", description: "Select claims to approve.", variant: "destructive" });
    try {
      const res = await fetch(`${api}/claims/bulk-set-verified`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim_ids: ids }),
      });
      if (!res.ok) throw new Error("approve failed");
      toast({ title: "Marked Verified", description: `Set verified for ${ids.length} claim(s)` });
      fetchClaims();
    } catch (e) {
      console.error(e);
      toast({ title: "Verification update failed", description: "Please try again.", variant: "destructive" });
    }
  };

  const rejectSelected = async () => {
    const ids = Object.entries(selected).filter(([, v]) => v).map(([k]) => Number(k));
    if (ids.length === 0) return toast({ title: "No selection", description: "Select claims to reject.", variant: "destructive" });
    try {
      const res = await fetch(`${api}/claims/bulk-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim_ids: ids, status: "rejected" }),
      });
      if (!res.ok) throw new Error("reject failed");
      toast({ title: "Rejected", description: `Rejected ${ids.length} claim(s)` });
      fetchClaims();
    } catch (e) {
      console.error(e);
      toast({ title: "Reject failed", description: "Please try again.", variant: "destructive" });
    }
  };

  // Helpers used by Apply button for bucket actions
  const approveIds = async (ids: number[]) => {
    try {
      const res = await fetch(`${api}/claims/bulk-set-verified`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim_ids: ids }),
      });
      if (!res.ok) throw new Error("approve failed");
      toast({ title: "Marked Verified", description: `Set verified for ${ids.length} claim(s)` });
      fetchClaims();
    } catch (e) {
      console.error(e);
      toast({ title: "Verification update failed", description: "Please try again.", variant: "destructive" });
    }
  };

  const rejectIds = async (ids: number[]) => {
    try {
      const res = await fetch(`${api}/claims/bulk-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim_ids: ids, status: "rejected" }),
      });
      if (!res.ok) throw new Error("reject failed");
      toast({ title: "Rejected", description: `Rejected ${ids.length} claim(s)` });
      fetchClaims();
    } catch (e) {
      console.error(e);
      toast({ title: "Reject failed", description: "Please try again.", variant: "destructive" });
    }
  };


  const pageNumbers = useMemo(() => {
    const maxButtons = 5;
    const pages: (number | string)[] = [];
    if (pageCount <= maxButtons) {
      for (let p = 1; p <= pageCount; p++) pages.push(p);
      return pages;
    }
    const half = Math.floor(maxButtons / 2);
    let startP = Math.max(1, page - half);
    let endP = Math.min(pageCount, startP + maxButtons - 1);
    if (endP - startP + 1 < maxButtons) startP = Math.max(1, endP - maxButtons + 1);
    if (startP > 1) pages.push(1, "...");
    for (let p = startP; p <= endP; p++) pages.push(p);
    if (endP < pageCount) pages.push("...", pageCount);
    return pages;
  }, [page, pageCount]);

const allOnPageChecked = filteredItems.length > 0 && filteredItems.every((i) => selected[i.claim_id]);

// Apply action according to bucket filter
const applyBucketAction = async () => {
  if (bucketFilter === "all") {
    toast({ title: "Choose a bucket", description: "Select Auto, Manual, or Reject.", variant: "default", className: "bg-muted text-foreground" });
    return;
  }
  const ids = filteredItems.map((r) => r.claim_id);
  if (!ids.length) {
    toast({ title: "No items", description: "No claims in this bucket on this page.", variant: "default", className: "bg-muted text-foreground" });
    return;
  }
  if (bucketFilter === "auto") {
    await approveIds(ids);
    return;
  }
  if (bucketFilter === "reject") {
    await rejectIds(ids);
    return;
  }
  // manual bucket: inform only
  toast({ title: "Manual review", description: `${ids.length} claim(s) flagged for manual review.`, variant: "default", className: "bg-muted text-foreground" });
};

  // --- Patient name helpers ---
  const fetchPatientName = async (patientId: number) => {
    if (patientNames[patientId]) return;
    try {
      const res = await fetch(`${api}/patient/${patientId}/basic-info`);
      if (!res.ok) return;
      const j = await res.json();
      const full = `${j.first_name ?? ""} ${j.last_name ?? ""}`.trim() || `Patient #${patientId}`;
      setPatientNames((m) => ({ ...m, [patientId]: full }));
    } catch {}
  };

  const prefetchPatientNames = (rows: ClaimItem[]) => {
    const unique = Array.from(new Set(rows.map((r) => r.patient_id)));
    unique.forEach((pid) => { if (!patientNames[pid]) fetchPatientName(pid); });
  };

  return (
    <div className="max-w-full">
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle>Upload & Verify External Claims</CardTitle>
          <CardDescription>
            Documents not issued on this platform. Generate AI score (0-100), compare with thresholds, and take action.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-sm text-muted-foreground">
              Showing {start}-{end} of {total}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Input placeholder="Search by URL" value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} className="w-56" />
              <Select value={String(pageSize)} onValueChange={(v) => { setPage(1); setPageSize(Number(v)); }}>
                <SelectTrigger className="w-[100px]"><SelectValue placeholder="Page size" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-3 rounded-md border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-foreground/5 text-xs">
                <tr>
                  <th className="p-2 w-10 text-left"><Checkbox checked={allOnPageChecked} onCheckedChange={(c) => handleToggleAll(!!c)} /></th>
                  <th className="p-2 text-left">S.No.</th>
                  <th className="p-2 text-left">Patient</th>
                  <th className="p-2 text-left">Report URL</th>
                  <th className="p-2 text-left">AI Score</th>
                  <th className="p-2 text-left">Bucket</th>
                  <th className="p-2 text-left">Created</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={7} className="p-3">Loading...</td></tr>
                )}
                {!loading && items.length === 0 && (
                  <tr><td colSpan={7} className="p-3 text-muted-foreground">No records</td></tr>
                )}
                {!loading && filteredItems.map((r, idx) => {
                  const score = aiScores[r.claim_id];
                  const b = bucket(score);
                  const name = patientNames[r.patient_id] ?? `Patient #${r.patient_id}`;
                  return (
                    <tr key={r.claim_id} className={`${idx % 2 ? "bg-foreground/5/20" : ""} hover:bg-foreground/5`}>
                      <td className="p-2 align-top"><Checkbox checked={!!selected[r.claim_id]} onCheckedChange={(c) => handleToggle(r.claim_id, !!c)} /></td>
                      <td className="p-2 align-top">{(page - 1) * pageSize + idx + 1}</td>
                      <td className="p-2 align-top">{name}</td>
                      <td className="p-2 align-top"><a href={r.report_url} target="_blank" className="text-primary underline">Open</a></td>
                      <td className="p-2 align-top">{score == null ? "-" : score}</td>
                      <td className="p-2 align-top">
                        {score == null ? (
                          <Badge variant="secondary">unscored</Badge>
                        ) : b === "auto" ? (
                          <Badge className="bg-emerald-600 hover:bg-emerald-600">auto</Badge>
                        ) : b === "reject" ? (
                          <Badge variant="destructive">reject</Badge>
                        ) : (
                          <Badge className="bg-amber-500 hover:bg-amber-500">manual</Badge>
                        )}
                      </td>
                      <td className="p-2 align-top whitespace-nowrap">{new Date(r.created_at).toLocaleString("en-US")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)); }} />
                </PaginationItem>
                {pageNumbers.map((p, i) => (
                  <PaginationItem key={`${p}-${i}`}>
                    {p === "..." ? (
                      <span className="px-3">...</span>
                    ) : (
                      <PaginationLink href="#" isActive={p === page} onClick={(e) => { e.preventDefault(); setPage(Number(p)); }}>{p}</PaginationLink>
                    )}
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(pageCount, p + 1)); }} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>

            <div className="ml-auto flex flex-wrap items-center gap-2">
              <Button variant="secondary" onClick={generateScores}>Generate AI Scores</Button>
              <Select value={bucketFilter} onValueChange={(v) => setBucketFilter(v as any)}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="Bucket" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="reject">Reject</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={applyBucketAction} disabled={bucketFilter === "all" || bucketFilter === "manual" || loading}>Apply</Button>
            </div>
          </div>

          {thresholds && (
            <div className="mt-4 text-xs text-muted-foreground">
              Thresholds — Auto: {thresholds.auto_approval_threshold ?? "-"}, Manual: {thresholds.manual_review_threshold ?? "-"}, Reject: {thresholds.rejection_threshold ?? "-"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
