"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FileUpload } from "@/components/ui/file-upload";
import { config } from "@/lib/config";
import { toast } from "@/hooks/use-toast";

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
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);

  const [selected, setSelected] = useState<Patient | null>(null);
  const [reportType, setReportType] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement | null>(null);
  const [issuerId, setIssuerId] = useState<number | null>(null);

  // Helpers to get/set user_id from storage/cookie
  const getStoredUserId = (): number | null => {
    try {
      const fromLs = typeof window !== "undefined" ? window.localStorage.getItem("user_id") : null;
      if (fromLs) return Number(fromLs);
      const cookie = typeof document !== "undefined" ? document.cookie.split("; ").find(r=>r.startsWith("user_id=")) : null;
      if (cookie) return Number(decodeURIComponent(cookie.split("=")[1]));
    } catch {}
    return null;
  };
  const setStoredUserId = (id: number) => {
    try { if (typeof window !== "undefined") window.localStorage.setItem("user_id", String(id)); } catch {}
    try { document.cookie = `user_id=${encodeURIComponent(String(id))}; path=/`; } catch {}
  };

  // Single fetch for all patients; filter and paginate client-side
  useEffect(() => {
    // Load any stored user id into state for immediate use
    const cached = getStoredUserId();
    if (cached) setIssuerId(cached);

    let ignore = false;
    const run = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiBase}/patients/fetch`);
        if (!res.ok) throw new Error(`Failed to fetch patients: ${res.status}`);
        const data = await res.json();
        const items: Patient[] = data.items || [];
        if (!ignore) {
          setAllPatients(items);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    run();
    return () => { ignore = true; };
  }, [apiBase]);

  // derive filtered + paginated patients on search/page change
  useEffect(() => {
    const filtered = allPatients.filter(p => {
      const term = search.trim().toLowerCase();
      if (!term) return true;
      return (
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(term) ||
        (p.email || "").toLowerCase().includes(term) ||
        (p.phone_number || "").includes(search.trim())
      );
    });
    const newTotal = filtered.length;
    const start = (page - 1) * pageSize;
    const pageItems = filtered.slice(start, start + pageSize);
    setPatients(pageItems);
    setTotal(newTotal);
  }, [allPatients, search, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Smooth scroll to the issue form after selecting a patient
  useEffect(() => {
    if (selected && formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selected]);

  // Removed mount-time issuer lookup; we'll fetch user id only at submit time.

  // Enable button when basic fields are set; issuer_id is validated in submit handler
  const isReady = Boolean(selected && reportType.trim() && file);

  const onSubmit = async () => {
    if (!isReady) {
      setToastMsg("Please select a patient, set report type, and choose a PDF file.");
      return;
    }
    setSubmitting(true);
    setToastMsg(null);
    try {
      // Use stored user_id only (no wallet-based API)
      let resolvedIssuerId = issuerId ?? getStoredUserId();
      const fd = new FormData();
      // selected and file are guaranteed by isReady check above
      fd.set("patient_id", String(selected!.patient_id));
      fd.set("report_type", reportType);
      if (!resolvedIssuerId) {
        throw new Error("Missing issuer_id. Please sign in again.");
      }
      fd.set("issuer_id", String(resolvedIssuerId));
      fd.set("file", file!);

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
      try {
        toast({
          title: "Report issued",
          description: `Report ID ${data.id} created successfully.`,
        });
      } catch {}
      // reset input and collapse form
      setReportType("");
      setFile(null);
      setSelected(null);
    } catch (e: any) {
      setToastMsg(e.message || "Failed to issue report");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle>Issue New Document</CardTitle>
          <CardDescription>Select a patient and upload a report PDF</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap items-center gap-3">
            <Input
              value={search}
              onChange={(e) => { setPage(1); setSearch(e.target.value); }}
              placeholder="Search by name, email, phone"
              className="w-full sm:w-80"
            />
            <div className="ml-auto text-xs sm:text-sm text-muted-foreground">
              Page {page} of {totalPages} • {total} patients
            </div>
          </div>

          <div className="mt-3 overflow-x-auto rounded-md border border-border">
            <table className="w-full text-sm">
              <thead className="bg-foreground/5 sticky top-0 z-10">
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
                {!loading && patients.map((p, idx) => (
                  <tr key={p.patient_id} className={`${idx % 2 ? "bg-foreground/5/20" : ""} ${selected?.patient_id === p.patient_id ? "bg-foreground/10" : ""}`}>
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
          <div ref={formRef} className="mt-5 rounded-lg border border-border p-4 sm:p-5 bg-foreground/5">
            <div className="text-sm font-semibold tracking-wide">Issue Report</div>
            {!selected && (
              <div className="mt-2 text-sm text-muted-foreground">Select a patient to continue</div>
            )}
            {selected && (
              <div className="mt-3 grid gap-5 sm:grid-cols-2">
                {/* Selected patient pill */}
                <div className="flex items-start gap-3">
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-background/40 px-3 py-2">
                    <Avatar>
                      <AvatarFallback>
                        {(selected.first_name?.[0] || "").toUpperCase()}
                        {(selected.last_name?.[0] || "").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="leading-tight">
                      <div className="text-sm font-medium">
                        {selected.first_name} {selected.last_name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {selected.email} • {selected.phone_number}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelected(null)}
                    className="ml-1"
                  >
                    Change
                  </Button>
                </div>

                {/* Form inputs */}
                <div className="grid gap-3">
                  <div className="grid gap-1.5">
                    <label className="text-xs text-muted-foreground" htmlFor="reportType">Report type</label>
                    <Input id="reportType" value={reportType} onChange={(e) => setReportType(e.target.value)} placeholder="e.g., Blood Test, MRI" />
                  </div>
                  <div className="grid gap-1.5">
                    <FileUpload
                      id="reportFile"
                      label="Attach PDF"
                      accept="application/pdf"
                      required
                      value={file}
                      onChange={(f) => setFile((Array.isArray(f) ? f[0] : f) || null)}
                      description="Only PDF up to 5MB"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <Button disabled={submitting} onClick={onSubmit}>
                      {submitting ? "Submitting..." : "Issue"}
                    </Button>
                    {!isReady && (
                      <div className="text-xs text-muted-foreground">Select patient, enter report type, and attach PDF</div>
                    )}
                    {isReady && (issuerId ?? getStoredUserId()) == null && (
                      <div className="text-xs text-amber-500">Issuer ID not found; please sign in</div>
                    )}
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
