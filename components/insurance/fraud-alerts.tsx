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
                {filtered.map((c, idx) => (
                  <TableRow key={c.claim_id} className="hover:bg-foreground/5">
                    <TableCell className="font-medium">{idx + 1}</TableCell>
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
      </CardContent>
    </Card>
  );
}
