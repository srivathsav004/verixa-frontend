"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { config } from "@/lib/config";

type IssuedDoc = {
  id: number;
  patient_id: number;
  report_type: string;
  document_url: string;
  issuer_id?: number | null;
  created_at: string;
};

export default function ReportsHistory() {
  const api = useMemo(() => (config.apiBaseUrl || "http://127.0.0.1:8000") + "/api", []);
  const [allItems, setAllItems] = useState<IssuedDoc[]>([]);
  const [items, setItems] = useState<IssuedDoc[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [patientId, setPatientId] = useState<string>("");
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageNumbers = useMemo(() => {
    const current = Math.min(page, totalPages);
    const pages: (number | "ellipsis")[] = [];
    const add = (p: number) => { if (!pages.includes(p)) pages.push(p); };
    add(1);
    for (let p = current - 2; p <= current + 2; p++) {
      if (p > 1 && p < totalPages) add(p);
    }
    if (totalPages > 1) add(totalPages);
    const normalized: (number | "ellipsis")[] = [];
    for (let i = 0; i < pages.length; i++) {
      normalized.push(pages[i]!);
      if (i < pages.length - 1 && (pages[i + 1] as number) - (pages[i] as number) > 1) normalized.push("ellipsis");
    }
    return normalized;
  }, [page, totalPages]);

  // Map patient_id -> full name
  const [patientMap, setPatientMap] = useState<Record<number, string>>({});
  // Single fetch of all issued docs
  useEffect(() => {
    let ignore = false;
    const run = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${api}/issuer/issued-docs/fetch`);
        if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
        const data = await res.json();
        if (!ignore) setAllItems(data.items || []);
      } catch (e) {
        console.error(e);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    run();
    return () => { ignore = true; };
  }, [api]);

  // Resolve patient names when IDs are present and unknown
  useEffect(() => {
    const missing = Array.from(new Set(allItems.map(r => r.patient_id).filter(id => !(id in patientMap))));
    if (missing.length === 0) return;
    let cancelled = false;
    (async () => {
      try {
        const entries = await Promise.all(missing.map(async (id) => {
          try {
            const r = await fetch(`${api}/patient/${id}/basic-info`);
            if (!r.ok) throw new Error(String(r.status));
            const j = await r.json();
            return [id, `${j.first_name} ${j.last_name}`.trim()] as const;
          } catch {
            return [id, `Patient #${id}`] as const;
          }
        }));
        if (!cancelled) {
          setPatientMap(prev => {
            const next = { ...prev } as Record<number, string>;
            for (const [id, name] of entries) next[id] = name;
            return next;
          });
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [allItems, api, patientMap]);

  // Client-side filter + paginate
  useEffect(() => {
    const term = search.trim().toLowerCase();
    const pid = patientId.trim();
    const filtered = allItems.filter(r => {
      const matchesType = term ? r.report_type.toLowerCase().includes(term) : true;
      const matchesPid = pid ? String(r.patient_id) === pid : true;
      return matchesType && matchesPid;
    });
    const newTotal = filtered.length;
    const start = (page - 1) * pageSize;
    const pageItems = filtered.slice(start, start + pageSize);
    setItems(pageItems);
    setTotal(newTotal);
  }, [allItems, search, patientId, page, pageSize]);

  return (
    <div className="w-full">
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle>Reports History</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-3 items-center">
            <Input value={search} onChange={(e)=>{ setPage(1); setSearch(e.target.value); }} placeholder="Search by report type" className="w-full sm:w-72" />
            <Input value={patientId} onChange={(e)=>{ setPage(1); setPatientId(e.target.value); }} placeholder="Filter by patient ID" className="w-full sm:w-56" />
            <div className="ml-auto text-xs sm:text-sm text-muted-foreground">Showing {(total === 0 ? 0 : (page - 1) * pageSize + 1)}–{Math.min(page * pageSize, total)} of {total}</div>
          </div>

          <div className="mt-3 overflow-x-auto rounded-md border border-border">
            <table className="w-full text-sm">
              <thead className="bg-foreground/5 sticky top-0 z-10">
                <tr>
                  <th className="text-left p-2 w-[80px]">S.No.</th>
                  <th className="text-left p-2">Patient</th>
                  <th className="text-left p-2">Report Type</th>
                  <th className="text-left p-2">Document</th>
                  <th className="text-left p-2">Issued At</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={5} className="p-3 text-muted-foreground">Loading...</td></tr>
                )}
                {!loading && items.length === 0 && (
                  <tr><td colSpan={5} className="p-3 text-muted-foreground">No records</td></tr>
                )}
                {!loading && items.map((r, idx) => (
                  <tr key={r.id} className={`${idx % 2 ? "bg-foreground/5/20" : ""} hover:bg-foreground/5`}>
                    <td className="p-2 align-top">{(page - 1) * pageSize + idx + 1}</td>
                    <td className="p-2 align-top">
                      <div className="leading-tight">
                        <div className="font-medium">{patientMap[r.patient_id] || `Patient #${r.patient_id}`}</div>
                      </div>
                    </td>
                    <td className="p-2 align-top">{r.report_type}</td>
                    <td className="p-2 align-top">
                      <a href={r.document_url} target="_blank" className="text-primary underline">Open</a>
                    </td>
                    <td className="p-2 align-top whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
              <SelectTrigger className="h-8 w-[120px]"><SelectValue placeholder="Rows/page" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 / page</SelectItem>
                <SelectItem value="10">10 / page</SelectItem>
                <SelectItem value="20">20 / page</SelectItem>
              </SelectContent>
            </Select>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setPage(p=>Math.max(1,p-1)); }} />
                </PaginationItem>
                {pageNumbers.map((p, i) => (
                  p === "ellipsis" ? (
                    <PaginationItem key={`e-${i}`}><PaginationEllipsis /></PaginationItem>
                  ) : (
                    <PaginationItem key={p}>
                      <PaginationLink href="#" isActive={p === page} onClick={(e) => { e.preventDefault(); setPage(p as number); }}>{p}</PaginationLink>
                    </PaginationItem>
                  )
                ))}
                <PaginationItem>
                  <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setPage(p=>Math.min(totalPages,p+1)); }} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
