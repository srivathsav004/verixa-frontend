"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { config } from "@/lib/config";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type CompletedItem = {
  task_id: number;
  claim_id: number;
  insurance_id?: number | null;
  company_name?: string | null;
  contract_address?: string | null;
  reward_pol?: string | null;
  tx_hash?: string | null;
  status?: string | null;
  created_at: string;
  report_url?: string | null;
  required_validators?: number | null;
  last_submission_created_at?: string | null;
  last_submission_result_cid?: string | null;
  last_submission_tx_hash?: string | null;
};

type InsuranceListItem = { insurance_id: number; company_name: string };

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

export default function CompletedHistory() {
  const api = useMemo(() => (config.apiBaseUrl || "http://127.0.0.1:8000") + "/api", []);
  const { toast } = useToast();

  const [items, setItems] = useState<CompletedItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [insurances, setInsurances] = useState<InsuranceListItem[]>([]);
  const [insuranceMap, setInsuranceMap] = useState<Record<number, string>>({});
  const [insuranceId, setInsuranceId] = useState<string>("");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // Submissions cache and UI expand state
  const [subsByTask, setSubsByTask] = useState<Record<number, SubmissionItem[]>>({});
  const [subsLoading, setSubsLoading] = useState<Record<number, boolean>>({});

  // Dialog state for responses preview
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTaskId, setModalTaskId] = useState<number | null>(null);

  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  const loadInsurances = async () => {
    try {
      const res = await fetch(`${api}/insurance/list`);
      if (!res.ok) throw new Error(`insurance list failed ${res.status}`);
      const j = await res.json();
      const list = (j.items || []) as InsuranceListItem[];
      setInsurances(list);
      const map: Record<number, string> = {};
      list.forEach((it) => (map[it.insurance_id] = it.company_name));
      setInsuranceMap(map);
      if (list.length && !insuranceId) setInsuranceId(String(list[0].insurance_id));
    } catch (e: any) {
      console.error(e);
      toast({ title: "Failed to load insurances", description: e?.message || "Error", variant: "destructive" });
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      // Cross-site cookie fallback: include validator_user_id if available
      const getCookie = (name: string) =>
        typeof document === "undefined"
          ? ""
          : (document.cookie.split("; ").find((row) => row.startsWith(name + "="))?.split("=")[1] || "");
      const uidFromCookie = getCookie("user_id") || getCookie("validator_user_id");
      const uidFromStorage = typeof window !== "undefined" ? (localStorage.getItem("user_id") || localStorage.getItem("validator_user_id") || "") : "";
      const validatorId = uidFromCookie || uidFromStorage || "";

      const qs = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
      if (insuranceId) qs.set("insurance_id", insuranceId);
      if (search.trim()) qs.set("search", search.trim());
      // Only fetch tasks completed by the current validator (resolved via cookie on backend)
      qs.set("only_mine", "1");
      if (validatorId) qs.set("validator_user_id", validatorId);
      const resp = await fetch(`${api}/tasks/completed?${qs.toString()}` , { credentials: "include" });
      if (!resp.ok) throw new Error(`fetch completed failed ${resp.status}`);
      const j = await resp.json();
      const rows: CompletedItem[] = j.items || [];
      setItems(rows);
      setTotal(j.total ?? rows.length ?? 0);

      // Prune submissions/expanded state for tasks no longer in view
      const visibleTaskIds = new Set(rows.map(r => r.task_id));
      setSubsByTask(prev => {
        const next: Record<number, SubmissionItem[]> = {};
        Object.keys(prev).forEach(k => { const id = Number(k); if (visibleTaskIds.has(id)) next[id] = prev[id]; });
        return next;
      });
    } catch (e: any) {
      console.error(e);
      toast({ title: "Load failed", description: e?.message || "Error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadInsurances(); }, []);
  useEffect(() => { load(); }, [insuranceId, page, pageSize, search]);

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

  const formatReward = (v?: string | null) => {
    if (!v) return "-";
    const num = Number(v);
    if (Number.isNaN(num)) return v;
    const net = num * 0.9; // show 90% net to validator
    return net.toFixed(3);
  };

  const short = (s?: string | null) => {
    if (!s) return "-";
    if (s.length <= 12) return s;
    return `${s.slice(0, 6)}…${s.slice(-4)}`;
  };

  const cidToUrl = (cid?: string | null) => {
    if (!cid) return undefined;
    // Prefer configurable gateway later; default to ipfs.io for now
    return `https://ipfs.io/ipfs/${cid}`;
  };

  const fetchSubmissions = async (taskId: number) => {
    // Avoid duplicate loads
    if (subsByTask[taskId] && subsByTask[taskId].length) return;
    setSubsLoading(prev => ({ ...prev, [taskId]: true }));
    try {
      const res = await fetch(`${api}/validator/submissions/by-task/${taskId}`);
      if (!res.ok) throw new Error(`submissions fetch failed ${res.status}`);
      const j = await res.json();
      const list: SubmissionItem[] = j.items || [];
      setSubsByTask(prev => ({ ...prev, [taskId]: list }));
    } catch (e: any) {
      console.error(e);
      toast({ title: "Load submissions failed", description: e?.message || "Error", variant: "destructive" });
    } finally {
      setSubsLoading(prev => ({ ...prev, [taskId]: false }));
    }
  };

  const openResponses = async (taskId: number) => {
    await fetchSubmissions(taskId);
    setModalTaskId(taskId);
    setModalOpen(true);
  };

  return (
    <div className="max-w-full">
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle>Completed History</CardTitle>
          <CardDescription>All completed validation tasks. Filter by insurance and search.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Insurance</span>
              <Select value={insuranceId} onValueChange={(v) => { setPage(1); setInsuranceId(v); }}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select insurance" />
                </SelectTrigger>
                <SelectContent>
                  {insurances.map((i) => (
                    <SelectItem key={i.insurance_id} value={String(i.insurance_id)}>
                      {i.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Input placeholder="Search by URL or Claim ID" value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} className="w-56" />
            </div>
          </div>

          <div className="mt-3 rounded-md border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-foreground/5 text-xs">
                <tr>
                  <th className="p-2 text-left">S.No.</th>
                  <th className="p-2 text-left">Company</th>
                  {/* <th className="p-2 text-left">Claim ID</th> */}
                  <th className="p-2 text-left">Report URL</th>
                  {/* <th className="p-2 text-left">Task ID</th> */}
                  <th className="p-2 text-left">Required</th>
                  <th className="p-2 text-left">Reward (POL, 90% net)</th>
                  <th className="p-2 text-left">Task Created</th>
                  <th className="p-2 text-left">Submission Time</th>
                  <th className="p-2 text-left">Submitted Report</th>
                  <th className="p-2 text-left">Submission Tx</th>
                  <th className="p-2 text-left">Responses</th>
                  <th className="p-2 text-left">Status</th>
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
                  <Fragment key={`row-group-${r.task_id}`}>
                    <tr key={`row-${r.task_id}-${idx}`} className={`${idx % 2 ? "bg-foreground/5/20" : ""} hover:bg-foreground/5`}>
                      <td className="p-2 align-top">{(page - 1) * pageSize + idx + 1}</td>
                      <td className="p-2 align-top">{r.company_name || '-'}</td>
                      {/* <td className="p-2 align-top">{r.claim_id}</td> */}
                      <td className="p-2 align-top">{r.report_url ? (<a href={r.report_url} target="_blank" className="text-primary underline">Open</a>) : '-'}</td>
                      {/* <td className="p-2 align-top">{r.task_id}</td> */}
                      <td className="p-2 align-top">{r.required_validators ?? '-'}</td>
                      <td className="p-2 align-top">{formatReward(r.reward_pol)}</td>
                      <td className="p-2 align-top whitespace-nowrap">{new Date(r.created_at).toLocaleString("en-US")}</td>
                      <td className="p-2 align-top whitespace-nowrap">{r.last_submission_created_at ? new Date(r.last_submission_created_at as any).toLocaleString("en-US") : '-'}</td>
                      <td className="p-2 align-top">{
                        r.last_submission_result_cid ? (
                          <a href={cidToUrl(r.last_submission_result_cid)} target="_blank" className="text-primary underline">Open</a>
                        ) : '-'
                      }</td>
                      <td className="p-2 align-top">{r.last_submission_tx_hash ? (<a className="text-primary underline" href={`https://amoy.polygonscan.com/tx/${r.last_submission_tx_hash}`} target="_blank">{short(r.last_submission_tx_hash)}</a>) : '-'}</td>
                      <td className="p-2 align-top">
                        <button
                          className="text-primary underline disabled:opacity-50"
                          disabled={!!subsLoading[r.task_id]}
                          onClick={(e) => { e.preventDefault(); openResponses(r.task_id); }}
                        >
                          {subsByTask[r.task_id]?.length === 1 ? 'Open response' : 'Preview responses'}
                        </button>
                      </td>
                      <td className="p-2 align-top"><span className="px-2 py-1 rounded-md border border-border text-xs">{r.status}</span></td>
                    </tr>
                  </Fragment>
                ))}
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
          </div>
        </CardContent>
      </Card>

      {/* Responses Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submission responses</DialogTitle>
            <DialogDescription>Review all validator submissions for this task.</DialogDescription>
          </DialogHeader>
          {(() => {
            const taskId = modalTaskId ?? 0;
            const subs = taskId ? (subsByTask[taskId] || []) : [];
            const isLoading = !!(taskId && subsLoading[taskId]);
            const ctx = items.find(it => it.task_id === taskId);
            return (
              <div className="space-y-3">
                {ctx && (
                  <div className="text-xs text-muted-foreground flex flex-wrap gap-3">
                    <span className="rounded-md border border-border px-2 py-0.5">Task #{ctx.task_id}</span>
                    <span className="rounded-md border border-border px-2 py-0.5">Claim #{ctx.claim_id}</span>
                    {ctx.company_name && <span className="rounded-md border border-border px-2 py-0.5">{ctx.company_name}</span>}
                  </div>
                )}
                {isLoading && <div className="text-sm">Loading responses...</div>}
                {!isLoading && subs.length === 0 && (
                  <div className="text-sm text-muted-foreground">No submissions found.</div>
                )}
                {!isLoading && subs.length > 0 && (
                  <ul className="divide-y divide-border rounded-md border border-border">
                    {subs.map((s) => (
                      <li key={s.id} className="p-3 flex flex-wrap items-center gap-3">
                        <span className="text-xs rounded-md border border-border px-2 py-0.5">
                          Validator: {s.wallet_address ? short(s.wallet_address) : `#${s.validator_user_id}`}
                        </span>
                        <span className="text-xs text-muted-foreground">{new Date(s.created_at as any).toLocaleString("en-US")}</span>
                        <a href={cidToUrl(s.result_cid)} target="_blank" className="text-primary underline">Open report</a>
                        {s.tx_hash && (
                          <a className="text-primary underline" href={`https://amoy.polygonscan.com/tx/${s.tx_hash}`} target="_blank">Tx {short(s.tx_hash)}</a>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
