"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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

export default function ClaimStatus({ patientId }: { patientId: number }) {
  const api = useMemo(() => (config.apiBaseUrl || "http://127.0.0.1:8000") + "/api", []);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(false);

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

  const pending = claims.filter(c => c.status !== "approved");

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Insurance Claim Status</CardTitle>
        <CardDescription>Real-time verification progress</CardDescription>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="space-y-2">
            <Skeleton className="h-14 w-full bg-foreground/10" />
            <Skeleton className="h-14 w-11/12 bg-foreground/10" />
          </div>
        )}
        {!loading && (
          <div className="space-y-3">
            {pending.length === 0 && (
              <div className="text-sm text-muted-foreground">No pending claims.</div>
            )}
            {pending.map((c) => (
              <div key={c.claim_id} className="rounded-lg border border-border p-3 bg-foreground/5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  <div className="font-medium">Claim #{c.claim_id}</div>
                  <Badge className="ml-auto" variant="secondary">{c.status}</Badge>
                </div>
                <div className="mt-1 text-xs text-muted-foreground break-all">{c.report_url}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
