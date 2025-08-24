"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { config } from "@/lib/config";
import { toast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/ui/file-upload";

export type IssuedDoc = {
  id: number;
  patient_id: number;
  report_type: string;
  document_url: string;
  issuer_id?: number | null;
  created_at: string;
  is_active: boolean;
};

export default function ClaimSubmit({ patientId }: { patientId: number }) {
  const api = useMemo(() => (config.apiBaseUrl || "http://127.0.0.1:8000") + "/api", []);

  const [insurers, setInsurers] = useState<Array<{
    insurance_id: number;
    company_name: string;
    company_type: string;
    website_url?: string | null;
    logo_url?: string | null;
    claim_settlement_ratio?: number | null;
    claims_email?: string | null;
    claims_phone?: string | null;
  }>>([]);
  const [insurersLoading, setInsurersLoading] = useState(false);
  const [docs, setDocs] = useState<IssuedDoc[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);

  const [selectedInsuranceId, setSelectedInsuranceId] = useState<number | "">("");
  const [selectedIssuedDocId, setSelectedIssuedDocId] = useState<number | "">("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [insurerQuery, setInsurerQuery] = useState("");
  const [sortByCsrDesc, setSortByCsrDesc] = useState(true);

  const hasActiveDocs = useMemo(() => docs.some(d => d.is_active), [docs]);

  useEffect(() => {
    let ignore = false;
    const loadInsurers = async () => {
      setInsurersLoading(true);
      try {
        const res = await fetch(`${api}/insurance/list`);
        if (!res.ok) throw new Error(`failed insurers: ${res.status}`);
        const data = await res.json();
        if (!ignore) setInsurers(data.items || []);
      } catch (e) {
        console.error(e);
      } finally {
        if (!ignore) setInsurersLoading(false);
      }
    };
    loadInsurers();
    return () => { ignore = true; };
  }, [api]);

  useEffect(() => {
    if (!patientId) return;
    let ignore = false;
    const loadDocs = async () => {
      setDocsLoading(true);
      try {
        const res = await fetch(`${api}/issuer/issued-docs/by-patient/${patientId}`);
        if (!res.ok) throw new Error(`Failed to load docs: ${res.status}`);
        const data = await res.json();
        if (!ignore) setDocs(data.items || []);
      } catch (e) {
        console.error(e);
      } finally {
        if (!ignore) setDocsLoading(false);
      }
    };
    loadDocs();
    return () => { ignore = true; };
  }, [patientId, api]);

  const submit = async () => {
    if (!patientId || !selectedInsuranceId) return;
    try {
      setSubmitting(true);
      const fd = new FormData();
      fd.append("patient_id", String(patientId));
      fd.append("insurance_id", String(selectedInsuranceId));
      // If user selected an issued doc, submit as verified; otherwise allow unverified upload
      const chosen = docs.find(d => d.id === Number(selectedIssuedDocId));
      if (chosen) {
        if (!chosen.is_active) { alert("Selected document is already used/inactive"); setSubmitting(false); return; }
        fd.append("is_verified", "true");
        fd.append("issued_doc_id", String(chosen.id));
        if (chosen.issuer_id != null) fd.append("issued_by", String(chosen.issuer_id));
      } else {
        if (!uploadFile) { setSubmitting(false); return; }
        fd.append("is_verified", "false");
        fd.append("file", uploadFile);
      }
      const res = await fetch(`${api}/claims`, { method: "POST", body: fd });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(`submit failed: ${res.status} ${msg}`);
      }
      try {
        toast({
          title: "Claim submitted",
          description: "Your claim has been submitted successfully.",
          duration: 3500,
        });
      } catch {}
      // Refresh issued docs to reflect lock state
      try {
        const r2 = await fetch(`${api}/issuer/issued-docs/by-patient/${patientId}`);
        if (r2.ok) {
          const data2 = await r2.json();
          setDocs(data2.items || []);
        }
      } catch {}
      // Reset
      setSelectedInsuranceId("");
      setSelectedIssuedDocId("");
      setUploadFile(null);
      // Optionally emit an event or callback to refresh lists elsewhere
    } catch (e) {
      console.error(e);
      const desc = e instanceof Error ? e.message : "Failed to submit claim";
      try {
        toast({
          title: "Submission failed",
          description: desc,
          duration: 4000,
        });
      } catch {}
    } finally {
      setSubmitting(false);
    }
  };

  const filteredInsurers = useMemo(() => {
    const q = insurerQuery.trim().toLowerCase();
    let list = insurers.filter((i) =>
      !q || i.company_name.toLowerCase().includes(q)
    );
    list = list.sort((a, b) => {
      const av = a.claim_settlement_ratio ?? -1;
      const bv = b.claim_settlement_ratio ?? -1;
      return sortByCsrDesc ? (bv - av) : (av - bv);
    });
    return list;
  }, [insurers, insurerQuery, sortByCsrDesc]);

  const selectedInsurer = useMemo(() => (
    filteredInsurers.find(i => i.insurance_id === Number(selectedInsuranceId))
  ), [filteredInsurers, selectedInsuranceId]);

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Submit New Insurance Claim</CardTitle>
        <CardDescription>Select an insurance and attach your report</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          <div>
            <div className="text-sm mb-1">Select Insurance</div>
            {insurersLoading ? (
              <Skeleton className="h-9 w-64 bg-foreground/10" />
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Search insurance..."
                    className="h-9 w-full sm:w-64 border border-border rounded px-2 bg-background"
                    value={insurerQuery}
                    onChange={(e) => setInsurerQuery(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setSortByCsrDesc(!sortByCsrDesc)}
                    className="h-9 whitespace-nowrap rounded border border-border px-3 text-sm hover:bg-foreground/5"
                    title="Toggle sort by CSR"
                  >
                    Sort CSR {sortByCsrDesc ? "↓" : "↑"}
                  </button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {filteredInsurers.map((ins) => {
                  const selected = Number(selectedInsuranceId) === ins.insurance_id;
                  const initials = ins.company_name
                    .split(" ")
                    .map((p) => p[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();
                  return (
                    <button
                      key={ins.insurance_id}
                      type="button"
                      onClick={() => setSelectedInsuranceId(ins.insurance_id)}
                      className={`text-left rounded-lg border p-3 transition ${selected ? "border-primary ring-2 ring-primary/30" : "border-border hover:bg-foreground/5"}`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border">
                          <AvatarImage src={ins.logo_url || undefined} alt={ins.company_name} />
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {ins.website_url ? (
                              <a
                                href={ins.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {ins.company_name}
                              </a>
                            ) : (
                              ins.company_name
                            )}
                          </div>
                        </div>
                        <div className="ml-auto flex items-center gap-1">
                          {ins.claim_settlement_ratio != null && (
                            <span className={`text-[10px] rounded px-1.5 py-0.5 whitespace-nowrap ${ins.claim_settlement_ratio >= 90 ? "bg-green-100 text-green-700" : "bg-foreground/10 text-foreground"}`}>
                              CSR {ins.claim_settlement_ratio}%
                            </span>
                          )}
                          <span className="text-[10px] rounded bg-foreground/10 px-1.5 py-0.5 text-foreground whitespace-nowrap">{ins.company_type}</span>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {ins.claims_email && <span>{ins.claims_email}</span>}
                        {ins.claims_phone && <span>{ins.claims_phone}</span>}
                      </div>
                    </button>
                  );
                })}
                </div>

                {selectedInsurer && (
                  <div className="mt-2 rounded-md border border-dashed border-border p-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border">
                        <AvatarImage src={selectedInsurer.logo_url || undefined} alt={selectedInsurer.company_name} />
                        <AvatarFallback>
                          {selectedInsurer.company_name.split(" ").map(p=>p[0]).join("").slice(0,2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {selectedInsurer.website_url ? (
                            <a
                              href={selectedInsurer.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {selectedInsurer.company_name}
                            </a>
                          ) : (
                            selectedInsurer.company_name
                          )}
                        </div>
                      </div>
                      <div className="ml-auto flex items-center gap-1">
                        {selectedInsurer.claim_settlement_ratio != null && (
                          <span className={`text-[10px] rounded px-1.5 py-0.5 whitespace-nowrap ${selectedInsurer.claim_settlement_ratio >= 90 ? "bg-green-100 text-green-700" : "bg-foreground/10 text-foreground"}`}>
                            CSR {selectedInsurer.claim_settlement_ratio}%
                          </span>
                        )}
                        <span className="text-[10px] rounded bg-foreground/10 px-1.5 py-0.5 text-foreground whitespace-nowrap">{selectedInsurer.company_type}</span>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                      {selectedInsurer.claims_email && <span>{selectedInsurer.claims_email}</span>}
                      {selectedInsurer.claims_phone && <span>{selectedInsurer.claims_phone}</span>}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {docsLoading ? (
            <Skeleton className="h-9 w-64 bg-foreground/10" />
          ) : docs.length > 0 ? (
            <div>
              <div className="text-sm mb-1">Select an issued document</div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {docs.map((d) => {
                  const selected = Number(selectedIssuedDocId) === d.id;
                  const disabled = !d.is_active;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => !disabled && setSelectedIssuedDocId(d.id)}
                      className={`rounded-lg border p-3 text-left transition ${
                        selected ? "border-primary ring-2 ring-primary/30" : "border-border hover:bg-foreground/5"
                      } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
                      disabled={disabled}
                      title={disabled ? "This document is already used/locked" : "Select document"}
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{d.report_type}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(d.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <span className={`text-[10px] rounded px-1.5 py-0.5 whitespace-nowrap ${
                          d.is_active ? "bg-green-100 text-green-700" : "bg-foreground/10 text-foreground"
                        }`}>
                          {d.is_active ? "Active" : "Used/Locked"}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-3 text-xs">
                        <a
                          href={d.document_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Preview
                        </a>
                      </div>
                    </button>
                  );
                })}
              </div>
              {/* If no active docs, allow unverified upload below */}
              {!hasActiveDocs && (
                <div className="mt-3">
                  <FileUpload
                    id="claim-upload-locked"
                    label="Or upload an unverified report"
                    accept=".pdf,.jpg,.jpeg,.png"
                    value={uploadFile}
                    onChange={(f) => setUploadFile((f as File) || null)}
                    maxSize={10}
                    description="PDF or Image up to 10MB"
                  />
                  <div className="text-xs text-muted-foreground mt-1">All issued documents are locked; you can upload a new report to submit as unverified.</div>
                </div>
              )}
              {hasActiveDocs && (
                <div className="mt-3">
                  <div className="text-xs text-muted-foreground mb-1">Prefer uploading instead? Leave the selection empty and attach a file below.</div>
                  <FileUpload
                    id="claim-upload-alt"
                    label="Upload report instead of selecting"
                    accept=".pdf,.jpg,.jpeg,.png"
                    value={uploadFile}
                    onChange={(f) => setUploadFile((f as File) || null)}
                    maxSize={10}
                    description="PDF or Image up to 10MB"
                  />
                </div>
              )}
            </div>
          ) : (
            <div>
              <FileUpload
                id="claim-upload-empty"
                label="Upload your report (no issued documents found)"
                accept=".pdf,.jpg,.jpeg,.png"
                value={uploadFile}
                onChange={(f) => setUploadFile((f as File) || null)}
                maxSize={10}
                description="PDF or Image up to 10MB"
              />
            </div>
          )}

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={submit}
              disabled={
                submitting ||
                !selectedInsuranceId ||
                (!selectedIssuedDocId && !uploadFile)
              }
            >
              {submitting ? "Submitting..." : "Submit Claim"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
