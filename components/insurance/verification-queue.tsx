"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

export type VerificationQueueProps = { insuranceId: number };

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
      if (search.trim()) qs.set("search", search.trim());
      const resp = await fetch(`${api}/verification-queue?${qs.toString()}`);
      if (!resp.ok) throw new Error(`fetch queue failed ${resp.status}`);
      const j = await resp.json();
      const rows: QueueItem[] = j.items || [];
      setItems(rows);
      setTotal(j.total ?? rows.length ?? 0);
      prefetchPatientNames(rows);
    } catch (e: any) {
      console.error(e);
      toast({ title: "Load failed", description: e?.message || "Error", variant: "destructive" });
    } finally {
      setLoading(false);
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
                  <th className="p-2 text-left">S.No.</th>
                  <th className="p-2 text-left">Patient</th>
                  <th className="p-2 text-left">Report URL</th>
                  <th className="p-2 text-left">Task ID</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Required Validators</th>
                  <th className="p-2 text-left">Tx Hash</th>
                  <th className="p-2 text-left">Reward (POL)</th>
                  <th className="p-2 text-left">Created</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={9} className="p-3">Loading...</td></tr>
                )}
                {!loading && items.length === 0 && (
                  <tr><td colSpan={9} className="p-3 text-muted-foreground">No records</td></tr>
                )}
                {!loading && items.map((r, idx) => (
                  <tr key={`${r.claim_id}-${r.task_id}`} className={`${idx % 2 ? "bg-foreground/5/20" : ""} hover:bg-foreground/5`}>
                    <td className="p-2 align-top">{(page - 1) * pageSize + idx + 1}</td>
                    <td className="p-2 align-top">{patientNames[r.patient_id] ?? `Patient #${r.patient_id}`}</td>
                    <td className="p-2 align-top"><a href={r.report_url} target="_blank" className="text-primary underline">Open</a></td>
                    <td className="p-2 align-top">{r.task_id}</td>
                    <td className="p-2 align-top"><Badge variant="outline">{r.status ?? '-'}</Badge></td>
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
                    <td className="p-2 align-top whitespace-nowrap">{new Date(r.created_at).toLocaleString("en-US")}</td>
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
