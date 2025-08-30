"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
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
import { formatIST } from "@/lib/date";

export type IssuedDoc = {
  id: number;
  patient_id: number;
  report_type: string;
  document_url: string;
  issuer_id?: number | null;
  created_at: string;
  is_active: boolean;
};

export default function MedicalReports({ patientId }: { patientId: number }) {
  const api = useMemo(() => (config.apiBaseUrl || "http://127.0.0.1:8000") + "/api", []);
  const [docs, setDocs] = useState<IssuedDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [issuerMap, setIssuerMap] = useState<Record<number, string>>({});
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "locked">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    if (!patientId) return;
    let ignore = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${api}/issuer/issued-docs/by-patient/${patientId}`);
        if (!res.ok) throw new Error(`Failed to load docs: ${res.status}`);
        const data = await res.json();
        if (!ignore) setDocs(data.items || []);
      } catch (e) {
        console.error(e);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => { ignore = true; };
  }, [patientId, api]);

  // Fetch issuer organization names for displayed docs
  useEffect(() => {
    const missing = Array.from(new Set(docs.map(d => d.issuer_id).filter((id): id is number => !!id && !(id in issuerMap))));
    if (missing.length === 0) return;
    let cancelled = false;
    (async () => {
      try {
        const entries = await Promise.all(missing.map(async (id) => {
          try {
            const r = await fetch(`${api}/issuer/${id}/basic-info`);
            if (!r.ok) throw new Error(String(r.status));
            const j = await r.json();
            return [id, j.organization_name as string] as const;
          } catch {
            return [id, `#${id}`] as const;
          }
        }));
        if (!cancelled) {
          setIssuerMap(prev => {
            const next = { ...prev } as Record<number, string>;
            for (const [id, name] of entries) next[id] = name;
            return next;
          });
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [docs, api, issuerMap]);

  const filtered = useMemo(() => {
    let arr = docs.slice();
    if (statusFilter !== "all") {
      const active = statusFilter === "active";
      arr = arr.filter(d => d.is_active === active);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter(d =>
        d.report_type.toLowerCase().includes(q) ||
        (d.issuer_id ? (issuerMap[d.issuer_id]?.toLowerCase() || `#${d.issuer_id}`).includes(q) : false)
      );
    }
    return arr;
  }, [docs, statusFilter, search, issuerMap]);

  // Reset page on filter/search change
  useEffect(() => { setPage(1); }, [statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const pageNumbers = useMemo(() => {
    const pages: (number | "ellipsis")[] = [];
    const add = (p: number) => { if (!pages.includes(p)) pages.push(p); };
    add(1);
    for (let p = currentPage - 2; p <= currentPage + 2; p++) {
      if (p > 1 && p < totalPages) add(p);
    }
    if (totalPages > 1) add(totalPages);
    const normalized: (number | "ellipsis")[] = [];
    for (let i = 0; i < pages.length; i++) {
      normalized.push(pages[i]!);
      if (i < pages.length - 1 && (pages[i + 1] as number) - (pages[i] as number) > 1) {
        normalized.push("ellipsis");
      }
    }
    return normalized;
  }, [currentPage, totalPages]);

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>My Medical Reports</CardTitle>
        <CardDescription>All documents issued to you</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-3">
          <div className="text-sm text-muted-foreground">Patient ID: {patientId}</div>
          <div className="flex flex-wrap gap-2 items-center">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="locked">Used/Locked</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Search report or issuer" className="w-[220px]" value={search} onChange={(e) => setSearch(e.target.value)} />
            <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
              <SelectTrigger className="w-[120px]"><SelectValue placeholder="Rows/page" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 / page</SelectItem>
                <SelectItem value="10">10 / page</SelectItem>
                <SelectItem value="20">20 / page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="overflow-x-auto rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[90px]">S.No.</TableHead>
                <TableHead>Report Type</TableHead>
                <TableHead>Document</TableHead>
                <TableHead>Issued By</TableHead>
                <TableHead>Issued At</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow><TableCell colSpan={6}><Skeleton className="h-4 w-1/2 bg-foreground/10" /></TableCell></TableRow>
              )}
              {!loading && filtered.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-muted-foreground">No reports found</TableCell></TableRow>
              )}
              {!loading && paged.map((d, idx) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{(currentPage - 1) * pageSize + idx + 1}</TableCell>
                  <TableCell className="font-medium">{d.report_type}</TableCell>
                  <TableCell>
                    <a href={d.document_url} target="_blank" className="text-primary underline">Open</a>
                  </TableCell>
                  <TableCell>{d.issuer_id ? (issuerMap[d.issuer_id] || `#${d.issuer_id}`) : "—"}</TableCell>
                  <TableCell className="whitespace-nowrap">{formatIST(d.created_at)}</TableCell>
                  <TableCell className={d.is_active ? "text-green-600" : "text-muted-foreground"}>
                    {d.is_active ? "Active" : "Used/Locked"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-muted-foreground">
            Showing {(filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1)}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setPage(Math.max(1, currentPage - 1)); }} />
              </PaginationItem>
              {pageNumbers.map((p, i) => (
                p === "ellipsis" ? (
                  <PaginationItem key={`e-${i}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={p}>
                    <PaginationLink href="#" isActive={p === currentPage} onClick={(e) => { e.preventDefault(); setPage(p as number); }}>
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                )
              ))}
              <PaginationItem>
                <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setPage(Math.min(totalPages, currentPage + 1)); }} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </CardContent>
    </Card>
  );
}
