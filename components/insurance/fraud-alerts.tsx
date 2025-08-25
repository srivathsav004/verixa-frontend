"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
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

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${api}/claims/by-insurance/${insuranceId}?status=rejected`);
      if (!res.ok) throw new Error(`failed claims: ${res.status}`);
      const j = await res.json();
      setData(j.items || []);
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

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Fraud Alerts</CardTitle>
        <CardDescription>Rejected claims requiring review</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-muted-foreground">Insurance ID: {insuranceId}</div>
          <Button size="sm" variant="outline" onClick={refresh} disabled={refreshing || loading}>
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
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
                  <TableHead className="w-[90px]">Claim #</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Report</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((c) => (
                  <TableRow key={c.claim_id} className="hover:bg-foreground/5">
                    <TableCell className="font-medium">{c.claim_id}</TableCell>
                    <TableCell>#{c.patient_id}</TableCell>
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
