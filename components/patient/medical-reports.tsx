"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { config } from "@/lib/config";

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

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>My Medical Reports</CardTitle>
        <CardDescription>All documents issued to you</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
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
              {!loading && docs.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-muted-foreground">No reports found</TableCell></TableRow>
              )}
              {!loading && docs.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>{d.id}</TableCell>
                  <TableCell className="font-medium">{d.report_type}</TableCell>
                  <TableCell>
                    <a href={d.document_url} target="_blank" className="text-primary underline">Open</a>
                  </TableCell>
                  <TableCell>{d.issuer_id ?? "—"}</TableCell>
                  <TableCell className="whitespace-nowrap">{new Date(d.created_at).toLocaleString()}</TableCell>
                  <TableCell className={d.is_active ? "text-green-600" : "text-muted-foreground"}>
                    {d.is_active ? "Active" : "Used/Locked"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
