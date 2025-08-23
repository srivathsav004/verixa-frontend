"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { config } from "@/lib/config";

// Types aligned with backend /patients response
type Patient = {
  user_id: number;
  patient_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  gender?: string | null;
};

export default function IssueNewDocument() {
  const apiBase = useMemo(() => (config.apiBaseUrl || "http://127.0.0.1:8000") + "/api", []);

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [patients, setPatients] = useState<Patient[]>([]);

  const [selected, setSelected] = useState<Patient | null>(null);
  const [reportType, setReportType] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    const fetchPatients = async () => {
      setLoading(true);
      try {
        const qp = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
        if (search.trim()) qp.set("search", search.trim());
        const res = await fetch(`${apiBase}/patients?${qp.toString()}`);
        if (!res.ok) throw new Error(`Failed to fetch patients: ${res.status}`);
        const data = await res.json();
        if (!ignore) {
          setPatients(data.items || []);
          setTotal(data.total || 0);
        }
      } catch (e: any) {
        console.error(e);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchPatients();
    return () => {
      ignore = true;
    };
  }, [apiBase, page, pageSize, search]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const onSubmit = async () => {
    if (!selected || !reportType || !file) {
      setToastMsg("Please select a patient, set report type, and choose a PDF file.");
      return;
    }
    setSubmitting(true);
    setToastMsg(null);
    try {
      const fd = new FormData();
      fd.set("patient_id", String(selected.patient_id));
      fd.set("report_type", reportType);
      // TODO: replace with real issuer user id from auth/session
      // For now leaving optional or example  issuer id
      // fd.set("issuer_user_id", String(currentIssuerUserId));
      fd.set("file", file);

      const res = await fetch(`${apiBase}/issuer/issued-docs`, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Issue report failed: ${res.status} ${t}`);
      }
      const data = await res.json();
      setToastMsg(`Report issued successfully (ID ${data.id}).`);
      // reset input
      setReportType("");
      setFile(null);
    } catch (e: any) {
      setToastMsg(e.message || "Failed to issue report");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-6 space-y-4">
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Issue New Document</CardTitle>
          <CardDescription>Select a patient and upload a report PDF</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            <Input
              value={search}
              onChange={(e) => { setPage(1); setSearch(e.target.value); }}
              placeholder="Search by name, email, phone"
              className="w-72"
            />
            <div className="ml-auto text-sm text-muted-foreground">
              Page {page} of {totalPages} • {total} patients
            </div>
          </div>

          <div className="mt-4 overflow-x-auto rounded-md border border-border">
            <table className="w-full text-sm">
              <thead className="bg-foreground/5">
                <tr>
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Phone</th>
                  <th className="text-left p-2">Gender</th>
                  <th className="text-left p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={5} className="p-3 text-muted-foreground">Loading...</td>
                  </tr>
                )}
                {!loading && patients.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-3 text-muted-foreground">No patients found</td>
                  </tr>
                )}
                {!loading && patients.map((p) => (
                  <tr key={p.patient_id} className={selected?.patient_id === p.patient_id ? "bg-foreground/5" : undefined}>
                    <td className="p-2 font-medium">{p.first_name} {p.last_name}</td>
                    <td className="p-2">{p.email}</td>
                    <td className="p-2">{p.phone_number}</td>
                    <td className="p-2">
                      {p.gender ? <Badge variant="secondary">{p.gender}</Badge> : <span className="text-muted-foreground">-</span>}
                    </td>
                    <td className="p-2">
                      <Button size="sm" variant={selected?.patient_id === p.patient_id ? "secondary" : "outline"} onClick={() => setSelected(p)}>
                        {selected?.patient_id === p.patient_id ? "Selected" : "Select"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
            <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
          </div>

          {/* Issue form */}
          <div className="mt-6 rounded-md border border-border p-3 bg-foreground/5">
            <div className="text-sm font-medium">Issue Report</div>
            {!selected && (
              <div className="mt-2 text-sm text-muted-foreground">Select a patient to continue</div>
            )}
            {selected && (
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <div>
                  <div className="text-xs text-muted-foreground">Selected patient</div>
                  <div className="mt-1 text-sm font-medium">{selected.first_name} {selected.last_name}</div>
                  <div className="text-xs text-muted-foreground">{selected.email} • {selected.phone_number}</div>
                </div>
                <div className="grid gap-2">
                  <Input value={reportType} onChange={(e) => setReportType(e.target.value)} placeholder="Report type (e.g., Blood Test, MRI)" />
                  <Input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  <div className="flex items-center gap-2">
                    <Button disabled={submitting} onClick={onSubmit}> {submitting ? "Submitting..." : "Issue / Submit"} </Button>
                    {toastMsg && <div className="text-xs text-muted-foreground">{toastMsg}</div>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
