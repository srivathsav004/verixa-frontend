"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { config } from "@/lib/config";

type IssuedDoc = {
  id: number;
  patient_id: number;
  report_type: string;
  document_url: string;
  issuer_user_id?: number | null;
  created_at: string;
};

export default function ReportsHistory() {
  const api = useMemo(() => (config.apiBaseUrl || "http://127.0.0.1:8000") + "/api", []);
  const [items, setItems] = useState<IssuedDoc[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [patientId, setPatientId] = useState<string>("");
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    let ignore = false;
    const run = async () => {
      setLoading(true);
      try {
        const qp = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
        if (search.trim()) qp.set("search", search.trim());
        if (patientId.trim()) qp.set("patient_id", patientId.trim());
        const res = await fetch(`${api}/issuer/issued-docs?${qp.toString()}`);
        if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
        const data = await res.json();
        if (!ignore) {
          setItems(data.items || []);
          setTotal(data.total || 0);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    run();
    return () => { ignore = true; };
  }, [api, page, pageSize, search, patientId]);

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
            <div className="ml-auto text-xs sm:text-sm text-muted-foreground">Page {page} of {totalPages} • {total} records</div>
          </div>

          <div className="mt-3 overflow-x-auto rounded-md border border-border">
            <table className="w-full text-sm">
              <thead className="bg-foreground/5 sticky top-0 z-10">
                <tr>
                  <th className="text-left p-2">ID</th>
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
                    <td className="p-2 align-top">{r.id}</td>
                    <td className="p-2 align-top">{r.patient_id}</td>
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

          <div className="mt-3 flex items-center gap-2">
            <Button size="sm" variant="outline" disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Prev</Button>
            <Button size="sm" variant="outline" disabled={page>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>Next</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
