"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { config } from "@/lib/config";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export type VerificationQueueProps = { insuranceId: number };

type SubmissionItem = {
  id: number;
  task_id: number;
  validator_user_id: number;
  result_cid: string;
  tx_hash?: string | null;
  status: string;
  created_at: string;
  wallet_address?: string | null;
};

type QueueItem = {
  claim_id: number;
  patient_id: number;
  insurance_id: number;
  report_url: string;
  is_verified: boolean;
  task_row_id: number;
  task_id: number;
  status: string | null;
  required_validators?: number | null;
  tx_hash?: string | null;
  reward_pol?: string | null;
  created_at: string;
};

export default function VerificationQueue({ insuranceId }: VerificationQueueProps) {
  const api = useMemo(() => (config.apiBaseUrl || "http://127.0.0.1:8000") + "/api", []);
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<QueueItem[]>([]);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [patientNames, setPatientNames] = useState<Record<number, string>>({});
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [aiScores, setAiScores] = useState<Record<number, number>>({});

  // Responses preview dialog state and cache
  const [respOpen, setRespOpen] = useState(false);
  const [respTaskId, setRespTaskId] = useState<number | null>(null);
  const [respLoading, setRespLoading] = useState(false);
  const [subsByTask, setSubsByTask] = useState<Record<number, SubmissionItem[]>>({});

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);

  const load = async () => {
    if (!insuranceId) return;
    setLoading(true);
    try {
      const qs = new URLSearchParams({
        insurance_id: String(insuranceId),
        page: String(page),
        page_size: String(pageSize),
      });
      // For insurance view: include tasks with both pending and completed statuses, while backend still checks claims.status
      qs.set("include_completed", "true");
      if (search.trim()) qs.set("search", search.trim());
      const resp = await fetch(`${api}/verification-queue?${qs.toString()}`);
      if (!resp.ok) throw new Error(`fetch queue failed ${resp.status}`);
      const j = await resp.json();
      const rows: QueueItem[] = j.items || [];
      setItems(rows);
      setTotal(j.total ?? rows.length ?? 0);
      // prune selections for rows no longer visible
      setSelected((prev) => {
        const next: Record<number, boolean> = {};
        const ids = new Set(rows.filter(r => (r.status || "").toLowerCase() === "completed").map(r => r.claim_id));
        Object.entries(prev).forEach(([k, v]) => { const id = Number(k); if (ids.has(id) && v) next[id] = true; });
        return next;
      });
      prefetchPatientNames(rows);
      loadAIEvals(rows);
    } catch (e: any) {
      console.error(e);
      toast({ title: "Load failed", description: e?.message || "Error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const cidToUrl = (cid?: string | null) => (cid ? `https://ipfs.io/ipfs/${cid}` : undefined);

  const shortAddr = (w?: string | null) => {
    if (!w) return undefined;
    const s = w.startsWith("0x") ? w.slice(2) : w;
    return (w.startsWith("0x") ? "0x" : "") + s.slice(0, 6) + "…" + s.slice(-4);
  };

  const openResponses = async (taskId: number) => {
    setRespTaskId(taskId);
    setRespOpen(true);
    if (!subsByTask[taskId]) {
      setRespLoading(true);
      try {
        const res = await fetch(`${api}/validator/submissions/by-task/${taskId}` , { credentials: "include" });
        if (res.ok) {
          const j = await res.json();
          const list: SubmissionItem[] = j.items || [];
          setSubsByTask((m) => ({ ...m, [taskId]: list }));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setRespLoading(false);
      }
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [insuranceId, page, pageSize, search]);

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

  const prefetchPatientNames = (rows: QueueItem[]) => {
    const unique = Array.from(new Set(rows.map((r) => r.patient_id)));
    unique.forEach((pid) => { if (!patientNames[pid]) fetchPatientName(pid); });
  };

  const pageNumbers = (() => {
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
  })();

  const loadAIEvals = async (rows: QueueItem[]) => {
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
    } catch {}
  };

  const selectableIdsOnPage = items.filter(r => (r.status || "").toLowerCase() === "completed").map(r => r.claim_id);
  const allOnPageChecked = selectableIdsOnPage.length > 0 && selectableIdsOnPage.every((id) => selected[id]);
  const selectedIds = Object.entries(selected).filter(([, v]) => v).map(([k]) => Number(k));

  const handleToggleAll = (checked: boolean) => {
    const next: Record<number, boolean> = { ...selected };
    selectableIdsOnPage.forEach((id) => { next[id] = checked; });
    setSelected(next);
  };

  const handleToggle = (id: number, checked: boolean) => setSelected((s) => ({ ...s, [id]: checked }));

  const approveSelected = async () => {
    const ids = selectedIds;
    if (ids.length === 0) return toast({ title: "No selection", description: "Select completed claims to approve.", variant: "destructive" });
    try {
      const res = await fetch(`${api}/claims/bulk-verify-approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim_ids: ids }),
      });
      if (!res.ok) throw new Error("approve failed");
      toast({ title: "Approved", description: `Approved ${ids.length} claim(s)` });
      await load();
    } catch (e: any) {
      console.error(e);
      toast({ title: "Approve failed", description: e?.message || "Please try again.", variant: "destructive" });
    }
  };

  const rejectSelected = async () => {
    const ids = selectedIds;
    if (ids.length === 0) return toast({ title: "No selection", description: "Select completed claims to reject.", variant: "destructive" });
    try {
      const res = await fetch(`${api}/claims/bulk-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim_ids: ids, status: "rejected" }),
      });
      if (!res.ok) throw new Error("reject failed");
      toast({ title: "Rejected", description: `Rejected ${ids.length} claim(s)` });
      await load();
    } catch (e: any) {
      console.error(e);
      toast({ title: "Reject failed", description: e?.message || "Please try again.", variant: "destructive" });
    }
  };

  const shortHash = (h?: string | null) => {
    if (!h) return "-";
    const s = h.startsWith("0x") ? h.slice(2) : h;
    return (h.startsWith("0x") ? "0x" : "") + s.slice(0, 6) + "…";
  };

  const txExplorerUrl = (h?: string | null) => {
    if (!h) return undefined;
    // Polygon Amoy testnet
    return `https://amoy.polygonscan.com/tx/${h}`;
  };

  const formatReward = (v?: string | null) => {
    if (!v) return "-";
    const num = Number(v);
    if (Number.isNaN(num)) return v;
    return num.toFixed(3);
  };

  return (
    <div className="max-w-full">
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle>Verification Queue</CardTitle>
          <CardDescription>
            Pending tasks for unverified claims. Shows on-chain Task ID and current task status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-sm text-muted-foreground">
              Showing {start}-{end} of {total}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Input placeholder="Search by URL or Claim ID" value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} className="w-56" />
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
                  <th className="p-2 text-left">Task ID</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">AI Score</th>
                  <th className="p-2 text-left">Required Validators</th>
                  <th className="p-2 text-left">Tx Hash</th>
                  <th className="p-2 text-left">Reward (POL)</th>
                  <th className="p-2 text-left">Responses</th>
                  <th className="p-2 text-left">Created</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={12} className="p-3">Loading...</td></tr>
                )}
                {!loading && items.length === 0 && (
                  <tr><td colSpan={12} className="p-3 text-muted-foreground">No records</td></tr>
                )}
                {!loading && items.map((r, idx) => (
                  <tr key={`${r.claim_id}-${r.task_id}`} className={`${idx % 2 ? "bg-foreground/5/20" : ""} hover:bg-foreground/5`}>
                    <td className="p-2 align-top">
                      {(r.status || "").toLowerCase() === "completed" ? (
                        <Checkbox checked={!!selected[r.claim_id]} onCheckedChange={(c) => handleToggle(r.claim_id, !!c)} />
                      ) : null}
                    </td>
                    <td className="p-2 align-top">{(page - 1) * pageSize + idx + 1}</td>
                    <td className="p-2 align-top">{patientNames[r.patient_id] ?? `Patient #${r.patient_id}`}</td>
                    <td className="p-2 align-top"><a href={r.report_url} target="_blank" className="text-primary underline">Open</a></td>
                    <td className="p-2 align-top">{r.task_id}</td>
                    <td className="p-2 align-top"><Badge variant="outline">{r.status ?? '-'}</Badge></td>
                    <td className="p-2 align-top">{aiScores[r.claim_id] != null ? aiScores[r.claim_id].toFixed(2) : '-'}</td>
                    <td className="p-2 align-top">{r.required_validators ?? '-'}</td>
                    <td className="p-2 align-top">
                      {r.tx_hash ? (
                        <a href={txExplorerUrl(r.tx_hash)} target="_blank" className="text-primary underline font-mono text-xs">
                          {shortHash(r.tx_hash)}
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="p-2 align-top">{formatReward(r.reward_pol)}</td>
                    <td className="p-2 align-top">
                      <Button variant="link" className="px-0" onClick={() => openResponses(r.task_id)}>Preview</Button>
                    </td>
                    <td className="p-2 align-top whitespace-nowrap">{new Date(r.created_at).toLocaleString("en-US")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div className="ml-auto flex items-center gap-2">
              <Button variant="secondary" onClick={approveSelected} disabled={loading || selectedIds.length === 0}>Approve Selected</Button>
              <Button variant="destructive" onClick={rejectSelected} disabled={loading || selectedIds.length === 0}>Reject Selected</Button>
            </div>
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
          </div>
        </CardContent>
      </Card>

      <Dialog open={respOpen} onOpenChange={(o) => { setRespOpen(o); if (!o) setRespTaskId(null); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Validator Responses {respTaskId != null ? `· Task ${respTaskId}` : ""}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {respLoading && <div className="text-sm">Loading...</div>}
            {!respLoading && respTaskId != null && (subsByTask[respTaskId]?.length || 0) === 0 && (
              <div className="text-sm text-muted-foreground">No submissions yet.</div>
            )}
            {!respLoading && respTaskId != null && (subsByTask[respTaskId]?.length || 0) === 1 && (
              (() => { const s = subsByTask[respTaskId][0]; return (
                <div className="text-sm flex flex-wrap items-center gap-3">
                  <Badge variant="outline">{s.wallet_address ? shortAddr(s.wallet_address) : `User #${s.validator_user_id}`}</Badge>
                  <span className="text-xs text-muted-foreground">{new Date(s.created_at as any).toLocaleString("en-US")}</span>
                  <a href={cidToUrl(s.result_cid)} target="_blank" className="text-primary underline">Open submitted report</a>
                  {s.tx_hash && <a href={txExplorerUrl(s.tx_hash)} target="_blank" className="text-primary underline">Tx {shortHash(s.tx_hash)}</a>}
                </div>
              ); })()
            )}
            {!respLoading && respTaskId != null && (subsByTask[respTaskId]?.length || 0) > 1 && (
              <ul className="space-y-2">
                {subsByTask[respTaskId].map((s, i) => (
                  <li key={`${s.id}-${i}`} className="text-sm flex flex-wrap items-center gap-3">
                    <Badge variant="outline">{s.wallet_address ? shortAddr(s.wallet_address) : `User #${s.validator_user_id}`}</Badge>
                    <span className="text-xs text-muted-foreground">{new Date(s.created_at as any).toLocaleString("en-US")}</span>
                    <a href={cidToUrl(s.result_cid)} target="_blank" className="text-primary underline">Open</a>
                    {s.tx_hash && <a href={txExplorerUrl(s.tx_hash)} target="_blank" className="text-primary underline">Tx {shortHash(s.tx_hash)}</a>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
