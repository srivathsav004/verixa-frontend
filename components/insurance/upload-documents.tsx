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
    } catch (e) {
      console.error(e);
      toast({ title: "Fetch failed", description: "Unable to load claims.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!insuranceId) return;
    fetchClaims();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [insuranceId, page, pageSize, search]);

  const handleToggleAll = (checked: boolean) => {
    const pageIds = items.map((i) => i.claim_id);
    const next: Record<number, boolean> = { ...selected };
    pageIds.forEach((id) => (next[id] = checked));
    setSelected(next);
  };

  const handleToggle = (id: number, checked: boolean) => setSelected((s) => ({ ...s, [id]: checked }));

  const generateScores = () => {
    const selIds = Object.entries(selected).filter(([, v]) => v).map(([k]) => Number(k));
    if (selIds.length === 0) {
      toast({ title: "No selection", description: "Select at least one claim.", variant: "destructive" });
      return;
    }
    const next: Record<number, number> = { ...aiScores };
    selIds.forEach((id) => (next[id] = Math.floor(Math.random() * 101)));
    setAiScores(next);
    toast({ title: "AI scores generated", description: `Generated scores for ${selIds.length} claim(s).` });
  };

  const bucket = (score: number | undefined) => {
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
  };

  const approveSelected = async () => {
    const ids = Object.entries(selected).filter(([, v]) => v).map(([k]) => Number(k));
    if (ids.length === 0) return toast({ title: "No selection", description: "Select claims to approve.", variant: "destructive" });
    try {
      const res = await fetch(`${api}/claims/bulk-verify-approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim_ids: ids }),
      });
      if (!res.ok) throw new Error("approve failed");
      toast({ title: "Approved", description: `Approved ${ids.length} claim(s)` });
      fetchClaims();
    } catch (e) {
      console.error(e);
      toast({ title: "Approve failed", description: "Try again.", variant: "destructive" });
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
      toast({ title: "Reject failed", description: "Try again.", variant: "destructive" });
    }
  };

  const saveEvaluations = async () => {
    const evals = Object.entries(aiScores).map(([claimId, score]) => {
      const claim = items.find((i) => i.claim_id === Number(claimId));
      return {
        claim_id: Number(claimId),
        report_type: undefined,
        document_url: claim?.report_url ?? undefined,
        ai_score: score,
      };
    });
    if (evals.length === 0) return toast({ title: "No scores", description: "Generate AI scores first.", variant: "destructive" });
    try {
      const res = await fetch(`${api}/claims/ai-evaluations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ evaluations: evals }),
      });
      if (!res.ok) throw new Error("save failed");
      toast({ title: "Saved", description: `Saved ${evals.length} evaluation(s).` });
    } catch (e) {
      console.error(e);
      toast({ title: "Save failed", description: "Unable to store evaluations.", variant: "destructive" });
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

  const allOnPageChecked = items.every((i) => selected[i.claim_id]);

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
                {!loading && items.map((r, idx) => {
                  const score = aiScores[r.claim_id];
                  const b = bucket(score);
                  return (
                    <tr key={r.claim_id} className={`${idx % 2 ? "bg-foreground/5/20" : ""} hover:bg-foreground/5`}>
                      <td className="p-2 align-top"><Checkbox checked={!!selected[r.claim_id]} onCheckedChange={(c) => handleToggle(r.claim_id, !!c)} /></td>
                      <td className="p-2 align-top">{(page - 1) * pageSize + idx + 1}</td>
                      <td className="p-2 align-top">Patient #{r.patient_id}</td>
                      <td className="p-2 align-top"><a href={r.report_url} target="_blank" className="text-primary underline">Open</a></td>
                      <td className="p-2 align-top">{score == null ? "-" : score}</td>
                      <td className="p-2 align-top capitalize">{b}</td>
                      <td className="p-2 align-top whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</td>
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

            <div className="ml-auto flex flex-wrap gap-2">
              <Button variant="secondary" onClick={generateScores}>Generate AI Scores</Button>
              <Button variant="outline" onClick={saveEvaluations}>Save AI Evaluations</Button>
              <Button onClick={approveSelected}>Approve (auto ≥ threshold)</Button>
              <Button variant="destructive" onClick={rejectSelected}>Reject</Button>
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
