"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { config } from "@/lib/config";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export type InsuranceClaim = {
  claim_id: number;
  patient_id: number;
  insurance_id: number;
  report_url: string;
  is_verified: boolean;
  issued_by: number | null;
  status: string;
  created_at: string;
};

export default function FraudAlerts({ insuranceId }: { insuranceId: number }) {
  const api = useMemo(() => (config.apiBaseUrl || "http://127.0.0.1:8000") + "/api", []);
  const [data, setData] = useState<InsuranceClaim[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [nameMap, setNameMap] = useState<Record<number, string>>({});
  const [issuerMap, setIssuerMap] = useState<Record<number, string>>({});
  const [verifiedFilter, setVerifiedFilter] = useState<"all" | "verified" | "unverified">("all");
  const [search, setSearch] = useState("");
  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${api}/claims/by-insurance/${insuranceId}?status=rejected`);
      if (!res.ok) throw new Error(`failed claims: ${res.status}`);
      const j = await res.json();
      const items: InsuranceClaim[] = j.items || [];
      setData(items);
      // names
      const uniqPatientIds = Array.from(new Set(items.map((i) => i.patient_id)));
      const toFetch = uniqPatientIds.filter((pid) => !(pid in nameMap));
      await Promise.all(toFetch.map(async (pid) => {
        try {
          const r = await fetch(`${api}/patient/${pid}/basic-info`);
          if (r.ok) {
            const pj = await r.json();
            const full = `${pj.first_name || ""} ${pj.last_name || ""}`.trim() || `#${pid}`;
            setNameMap((m) => ({ ...m, [pid]: full }));
          }
        } catch {}
      }));
      // issuers
      const uniqIssuerIds = Array.from(new Set(items.map((i) => i.issued_by).filter((v) => v != null))) as number[];
      const toFetchIss = uniqIssuerIds.filter((iid) => !(iid in issuerMap));
      await Promise.all(toFetchIss.map(async (iid) => {
        try {
          const r = await fetch(`${api}/issuer/${iid}/basic-info`);
          if (r.ok) {
            const ij = await r.json();
            setIssuerMap((m) => ({ ...m, [iid]: ij.organization_name || `Issuer #${iid}` }));
          }
        } catch {}
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!insuranceId) return;
    fetchClaims();
  }, [insuranceId]);

  const refresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`${api}/claims/by-insurance/${insuranceId}?status=rejected`);
      const j = await res.json();
      setData(j.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  const prettyDate = (iso: string) => { try { return new Date(iso).toLocaleString(); } catch { return iso; } };

  const filtered = useMemo(() => {
    let arr = data.slice();
    if (verifiedFilter !== "all") {
      const flag = verifiedFilter === "verified";
      arr = arr.filter((d) => d.is_verified === flag);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter((d) => (nameMap[d.patient_id]?.toLowerCase() || "").includes(q));
    }
    return arr;
  }, [data, verifiedFilter, search, nameMap]);

  // Reset page when filters/search change
  useEffect(() => { setPage(1); }, [verifiedFilter, search]);

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
        <CardTitle>Fraud Alerts</CardTitle>
        <CardDescription>Rejected claims requiring review</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-3">
          <div className="text-sm text-muted-foreground">Insurance ID: {insuranceId}</div>
          <div className="flex flex-wrap gap-2 items-center">
            <Select value={verifiedFilter} onValueChange={(v) => setVerifiedFilter(v as any)}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Verified filter" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="verified">Verified only</SelectItem>
                <SelectItem value="unverified">Unverified only</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Search patient" className="w-[200px]" value={search} onChange={(e) => setSearch(e.target.value)} />
            <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
              <SelectTrigger className="w-[120px]"><SelectValue placeholder="Rows/page" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 / page</SelectItem>
                <SelectItem value="10">10 / page</SelectItem>
                <SelectItem value="20">20 / page</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" onClick={refresh} disabled={refreshing || loading}>
              {refreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full bg-foreground/10" />
            <Skeleton className="h-10 w-11/12 bg-foreground/10" />
          </div>
        ) : data.length === 0 ? (
          <div className="text-sm text-muted-foreground">No rejected claims.</div>
        ) : (
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[70px]">S.No.</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Issuer</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Report</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((c, idx) => (
                  <TableRow key={c.claim_id} className="hover:bg-foreground/5">
                    <TableCell className="font-medium">{(currentPage - 1) * pageSize + idx + 1}</TableCell>
                    <TableCell>{nameMap[c.patient_id] || `#${c.patient_id}`}</TableCell>
                    <TableCell>{c.issued_by ? (issuerMap[c.issued_by] || `#${c.issued_by}`) : "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant={c.is_verified ? "secondary" : "outline"}>{c.is_verified ? "Verified" : "Unverified"}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">{c.status}</Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{prettyDate(c.created_at)}</TableCell>
                    <TableCell className="max-w-[280px] truncate">
                      {c.report_url ? (
                        <a className="text-primary hover:underline" href={c.report_url} target="_blank" rel="noopener noreferrer">Preview</a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
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
