"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
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

export default function ActiveClaims({ insuranceId }: { insuranceId: number }) {
  const api = useMemo(() => (config.apiBaseUrl || "http://127.0.0.1:8000") + "/api", []);
  const [data, setData] = useState<InsuranceClaim[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  // Patient name cache
  const [nameMap, setNameMap] = useState<Record<number, string>>({});
  // Issuer name cache
  const [issuerMap, setIssuerMap] = useState<Record<number, string>>({});

  // Filters and selection
  const [verifiedFilter, setVerifiedFilter] = useState<"all" | "verified" | "unverified">("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${api}/claims/by-insurance/${insuranceId}?status=pending`);
      if (!res.ok) throw new Error(`failed claims: ${res.status}`);
      const j = await res.json();
      const items: InsuranceClaim[] = j.items || [];
      setData(items);
      // fetch missing names
      const uniqPatientIds = Array.from(new Set(items.map((i) => i.patient_id)));
      const toFetch = uniqPatientIds.filter((pid) => !(pid in nameMap));
      if (toFetch.length) {
        await Promise.all(
          toFetch.map(async (pid) => {
            try {
              const r = await fetch(`${api}/patient/${pid}/basic-info`);
              if (r.ok) {
                const pj = await r.json();
                const full = `${pj.first_name || ""} ${pj.last_name || ""}`.trim() || `#${pid}`;
                setNameMap((m) => ({ ...m, [pid]: full }));
              }
            } catch {}
          })
        );
      }
      // fetch missing issuers
      const uniqIssuerIds = Array.from(new Set(items.map((i) => i.issued_by).filter((v) => v != null))) as number[];
      const toFetchIss = uniqIssuerIds.filter((iid) => !(iid in issuerMap));
      if (toFetchIss.length) {
        await Promise.all(
          toFetchIss.map(async (iid) => {
            try {
              const r = await fetch(`${api}/issuer/${iid}/basic-info`);
              if (r.ok) {
                const ij = await r.json();
                const nm = ij.organization_name || `Issuer #${iid}`;
                setIssuerMap((m) => ({ ...m, [iid]: nm }));
              }
            } catch {}
          })
        );
      }
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
      const res = await fetch(`${api}/claims/by-insurance/${insuranceId}?status=pending`);
      const j = await res.json();
      const items: InsuranceClaim[] = j.items || [];
      setData(items);
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

  const allVisibleSelected = filtered.length > 0 && filtered.every((d) => selected[d.claim_id]);
  const someVisibleSelected = filtered.some((d) => selected[d.claim_id]) && !allVisibleSelected;

  // Selection aggregations for enabling/disabling bulk actions
  const selectedVisible = useMemo(() => filtered.filter((d) => selected[d.claim_id]), [filtered, selected]);
  const anySelected = selectedVisible.length > 0;
  const anyVerifiedSelected = selectedVisible.some((d) => d.is_verified);
  const anyUnverifiedSelected = selectedVisible.some((d) => !d.is_verified);

  const toggleSelectAllVisible = () => {
    const next: Record<number, boolean> = { ...selected };
    if (allVisibleSelected) {
      filtered.forEach((d) => { delete next[d.claim_id]; });
    } else {
      filtered.forEach((d) => { next[d.claim_id] = true; });
    }
    setSelected(next);
  };

  const approveSingle = async (id: number) => {
    try {
      const res = await fetch(`${api}/claims/${id}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "approved" }) });
      if (!res.ok) throw new Error("approve failed");
      setData((arr) => arr.filter((c) => c.claim_id !== id));
      toast({ title: "Approved", description: `Claim #${id} approved`, variant: "default" });
    } catch (e) {
      toast({ title: "Error", description: "Failed to approve claim", variant: "destructive" });
    }
  };

  const rejectSingle = async (id: number) => {
    try {
      const res = await fetch(`${api}/claims/${id}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "rejected" }) });
      if (!res.ok) throw new Error("reject failed");
      setData((arr) => arr.filter((c) => c.claim_id !== id));
      toast({ title: "Rejected", description: `Claim #${id} rejected`, variant: "default" });
    } catch (e) {
      toast({ title: "Error", description: "Failed to reject claim", variant: "destructive" });
    }
  };

  const bulkUpdate = async (status: "approved" | "rejected") => {
    const ids = Object.keys(selected).filter((k) => selected[Number(k)]).map((k) => Number(k));
    if (ids.length === 0) return;
    try {
      const res = await fetch(`${api}/claims/bulk-status`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ claim_ids: ids, status }) });
      if (!res.ok) throw new Error("bulk failed");
      setData((arr) => arr.filter((c) => !ids.includes(c.claim_id)));
      setSelected({});
      toast({ title: status === "approved" ? "Approved" : "Rejected", description: `${ids.length} claim(s) ${status}`, variant: "default" });
    } catch (e) {
      toast({ title: "Error", description: "Bulk update failed", variant: "destructive" });
    }
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Active Claims</CardTitle>
        <CardDescription>All pending claims</CardDescription>
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

        <div className="flex flex-wrap gap-2 mb-3">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => bulkUpdate("approved")}
            disabled={!anyVerifiedSelected || anyUnverifiedSelected}
            title={!anyVerifiedSelected ? "Select at least one verified claim" : anyUnverifiedSelected ? "Unverified claims cannot be approved" : undefined}
          >
            Approve Selected
          </Button>
          <Button size="sm" variant="outline" onClick={() => bulkUpdate("rejected")} disabled={!anySelected}>Reject Selected</Button>
        </div>

        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full bg-foreground/10" />
            <Skeleton className="h-10 w-11/12 bg-foreground/10" />
            <Skeleton className="h-10 w-10/12 bg-foreground/10" />
          </div>
        ) : data.length === 0 ? (
          <div className="text-sm text-muted-foreground">No active (pending) claims.</div>
        ) : (
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={allVisibleSelected ? true : someVisibleSelected ? ("indeterminate" as any) : false}
                      onCheckedChange={toggleSelectAllVisible}
                    />
                  </TableHead>
                  <TableHead className="w-[70px]">S.No.</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Issuer</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Report</TableHead>
                  <TableHead className="w-[160px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((c, idx) => (
                  <TableRow key={c.claim_id} className="hover:bg-foreground/5">
                    <TableCell>
                      <Checkbox checked={!!selected[c.claim_id]} onCheckedChange={(v) => setSelected((s) => ({ ...s, [c.claim_id]: Boolean(v) }))} />
                    </TableCell>
                    <TableCell className="font-medium">{(currentPage - 1) * pageSize + idx + 1}</TableCell>
                    <TableCell>{nameMap[c.patient_id] || `#${c.patient_id}`}</TableCell>
                    <TableCell>{c.issued_by ? (issuerMap[c.issued_by] || `#${c.issued_by}`) : "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant={c.is_verified ? "secondary" : "outline"}>{c.is_verified ? "Verified" : "Unverified"}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge>{c.status}</Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{prettyDate(c.created_at)}</TableCell>
                    <TableCell className="max-w-[280px] truncate">
                      {c.report_url ? (
                        <a className="text-primary hover:underline" href={c.report_url} target="_blank" rel="noopener noreferrer">Preview</a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="secondary" onClick={() => approveSingle(c.claim_id)} disabled={!c.is_verified} title={!c.is_verified ? "Only verified claims can be approved" : undefined}>Approve</Button>
                        <Button size="sm" variant="outline" onClick={() => rejectSingle(c.claim_id)}>Reject</Button>
                      </div>
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
