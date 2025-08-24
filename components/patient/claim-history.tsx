"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShieldCheck } from "lucide-react";
import { config } from "@/lib/config";

export type Claim = {
  claim_id: number;
  patient_id: number;
  insurance_id: number;
  report_url: string;
  is_verified: boolean;
  issued_by: number | null;
  status: string;
  created_at: string;
};

export default function ClaimHistory({ patientId }: { patientId: number }) {
  const api = useMemo(() => (config.apiBaseUrl || "http://127.0.0.1:8000") + "/api", []);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!patientId) return;
    let ignore = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${api}/claims/by-patient/${patientId}`);
        if (!res.ok) throw new Error(`failed claims: ${res.status}`);
        const data = await res.json();
        if (!ignore) setClaims(data.items || []);
      } catch (e) {
        console.error(e);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => { ignore = true; };
  }, [patientId, api]);

  const refresh = async () => {
    if (!patientId) return;
    setRefreshing(true);
    try {
      const res = await fetch(`${api}/claims/by-patient/${patientId}`);
      if (!res.ok) throw new Error(`failed claims: ${res.status}`);
      const data = await res.json();
      setClaims(data.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  const prettyDate = (iso: string) => {
    try { return new Date(iso).toLocaleString(); } catch { return iso; }
  };

  const approved = claims.filter(c => c.status?.toLowerCase() === "approved");

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Claims History</CardTitle>
        <CardDescription>Approved claims</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-muted-foreground">Patient ID: {patientId}</div>
          <Button size="sm" variant="outline" onClick={refresh} disabled={refreshing || loading}>
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full bg-foreground/10" />
            <Skeleton className="h-10 w-11/12 bg-foreground/10" />
            <Skeleton className="h-10 w-10/12 bg-foreground/10" />
          </div>
        ) : approved.length === 0 ? (
          <div className="text-sm text-muted-foreground">No approved claims yet.</div>
        ) : (
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[90px]">Claim #</TableHead>
                  <TableHead>Insurance</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Report</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approved.map((c) => (
                  <TableRow key={c.claim_id} className="hover:bg-foreground/5">
                    <TableCell className="font-medium">{c.claim_id}</TableCell>
                    <TableCell>#{c.insurance_id}</TableCell>
                    <TableCell>
                      <Badge variant={c.is_verified ? "secondary" : "outline"}>{c.is_verified ? "Verified" : "Unverified"}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">Approved</Badge>
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
