"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { config } from "@/lib/config";

// Shows tasks this validator has submitted to but are not yet completed (awaiting more validators)

type ActiveItem = {
  task_id: number;
  claim_id?: number | null;
  required_validators: number;
  current_submissions: number;
  contract_address?: string | null;
  reward_pol?: string | null; // total pool in POL
  status: string;
  created_at: string;
  report_url?: string | null;
  company_name?: string | null;
  my_submission_created_at?: string | null;
  my_submission_result_cid?: string | null;
  my_submission_tx_hash?: string | null;
};

export default function ActiveValidations() {
  const api = useMemo(() => (config.apiBaseUrl || "http://127.0.0.1:8000") + "/api", []);
  const { toast } = useToast();

  const [items, setItems] = useState<ActiveItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");

  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  const short = (s?: string | null) => {
    if (!s) return "-";
    if (s.length <= 12) return s;
    return `${s.slice(0, 6)}…${s.slice(-4)}`;
  };

  const formatRewardNet = (v?: string | null) => {
    if (!v) return "-";
    const num = Number(v);
    if (Number.isNaN(num)) return v;
    return (num * 0.9).toFixed(3);
  };

  const load = async () => {
    setLoading(true);
    try {
      const getCookie = (name: string) =>
        typeof document === "undefined"
          ? ""
          : (document.cookie.split("; ").find((row) => row.startsWith(name + "="))?.split("=")[1] || "");
      const uidFromCookie = getCookie("user_id") || getCookie("validator_user_id");
      const uidFromStorage = typeof window !== "undefined" ? (localStorage.getItem("user_id") || localStorage.getItem("validator_user_id") || "") : "";
      const validatorId = uidFromCookie || uidFromStorage || "";

      const qs = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
      if (validatorId) qs.set("validator_user_id", validatorId);

      const resp = await fetch(`${api}/validator/active?${qs.toString()}`, { credentials: 'include' });
      if (!resp.ok) throw new Error(`fetch active failed ${resp.status}`);
      const j = await resp.json();
      let rows: ActiveItem[] = j.items || [];
      if (search.trim()) {
        const s = search.trim().toLowerCase();
        rows = rows.filter(
          (r) => String(r.claim_id || "").includes(s) || String(r.task_id).includes(s) || (r.report_url || "").toLowerCase().includes(s)
        );
      }
      setItems(rows);
      setTotal(j.total ?? rows.length ?? 0);
    } catch (e: any) {
      console.error(e);
      toast({ title: "Load failed", description: e?.message || "Error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, pageSize, search]);

  const pageNumbers = (() => {
    const maxButtons = 5;
    const pages: (number | string)[] = [];
    if (pageCount <= maxButtons) { for (let p = 1; p <= pageCount; p++) pages.push(p); return pages; }
    const half = Math.floor(maxButtons / 2);
    let startP = Math.max(1, page - half);
    let endP = Math.min(pageCount, startP + maxButtons - 1);
    if (endP - startP + 1 < maxButtons) startP = Math.max(1, endP - maxButtons + 1);
    if (startP > 1) pages.push(1, "...");
    for (let p = startP; p <= endP; p++) pages.push(p);
    if (endP < pageCount) pages.push("...", pageCount);
    return pages;
  })();

  return (
    <div className="max-w-full">
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle>Active Validations</CardTitle>
          <CardDescription>Tasks you submitted that are awaiting more validator submissions to complete.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            <div className="ml-auto flex items-center gap-2">
              <Input placeholder="Search task/claim/url" value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} className="w-56" />
            </div>
          </div>

          <div className="mt-3 rounded-md border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-foreground/5 text-xs">
                <tr>
                  <th className="p-2 text-left">S.No.</th>
                  <th className="p-2 text-left">Company</th>
                  <th className="p-2 text-left">Claim ID</th>
                  <th className="p-2 text-left">Report URL</th>
                  <th className="p-2 text-left">Task ID</th>
                  <th className="p-2 text-left">Progress</th>
                  <th className="p-2 text-left">Reward (POL, 90% net)</th>
                  <th className="p-2 text-left">Created</th>
                  <th className="p-2 text-left">My Submission Time</th>
                  <th className="p-2 text-left">My Submitted Report</th>
                  <th className="p-2 text-left">My Submission Tx</th>
                  <th className="p-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading && (<tr><td colSpan={12} className="p-3">Loading...</td></tr>)}
                {!loading && items.length === 0 && (<tr><td colSpan={12} className="p-3 text-muted-foreground">No active validations</td></tr>)}
                {!loading && items.map((r, idx) => (
                  <tr key={r.task_id} className={`${idx % 2 ? "bg-foreground/5/20" : ""} hover:bg-foreground/5`}>
                    <td className="p-2 align-top">{(page - 1) * pageSize + idx + 1}</td>
                    <td className="p-2 align-top">{r.company_name || '-'}</td>
                    <td className="p-2 align-top">{r.claim_id ?? '-'}</td>
                    <td className="p-2 align-top">{r.report_url ? (<a href={r.report_url} target="_blank" className="text-primary underline">Open</a>) : '-'}</td>
                    <td className="p-2 align-top">{r.task_id}</td>
                    <td className="p-2 align-top">{r.current_submissions}/{r.required_validators}</td>
                    <td className="p-2 align-top">{formatRewardNet(r.reward_pol)}</td>
                    <td className="p-2 align-top whitespace-nowrap">{new Date(r.created_at).toLocaleString("en-US")}</td>
                    <td className="p-2 align-top whitespace-nowrap">{r.my_submission_created_at ? new Date(r.my_submission_created_at as any).toLocaleString("en-US") : '-'}</td>
                    <td className="p-2 align-top">{r.my_submission_result_cid ? (<a href={`https://ipfs.io/ipfs/${r.my_submission_result_cid}`} className="text-primary underline" target="_blank">Open</a>) : '-'}</td>
                    <td className="p-2 align-top">{r.my_submission_tx_hash ? (<a href={`https://amoy.polygonscan.com/tx/${r.my_submission_tx_hash}`} target="_blank" className="text-primary underline">{r.my_submission_tx_hash.length > 12 ? `${r.my_submission_tx_hash.slice(0,6)}…${r.my_submission_tx_hash.slice(-4)}` : r.my_submission_tx_hash}</a>) : '-'}</td>
                    <td className="p-2 align-top"><Badge variant="outline">{r.status}</Badge></td>
                  </tr>
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
    </div>
  );
}
