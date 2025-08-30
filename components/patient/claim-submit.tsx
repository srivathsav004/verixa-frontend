"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { config } from "@/lib/config";
import { toast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/ui/file-upload";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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
  // Issuers (hospitals/labs) list for unverified uploads
  const [issuers, setIssuers] = useState<Array<{ issuer_id: number; organization_name: string }>>([]);
  const [issuersLoading, setIssuersLoading] = useState(false);

  const [selectedInsuranceId, setSelectedInsuranceId] = useState<number | "">("");
  const [selectedIssuedDocId, setSelectedIssuedDocId] = useState<number | "">("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [selectedIssuerId, setSelectedIssuerId] = useState<number | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [insurerQuery, setInsurerQuery] = useState("");
  const [sortByCsrDesc, setSortByCsrDesc] = useState(true);
  // Force-remount upload inputs after a successful submit to allow selecting the same file again
  const [uploadKey, setUploadKey] = useState(0);
  // Insurer pagination
  const [insPage, setInsPage] = useState(1);
  const [insPageSize, setInsPageSize] = useState(6);
  // Docs pagination
  const [docPage, setDocPage] = useState(1);
  const [docPageSize, setDocPageSize] = useState(6);

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
    const loadIssuers = async () => {
      setIssuersLoading(true);
      try {
        const res = await fetch(`${api}/issuer/list`);
        if (!res.ok) throw new Error(`failed issuers: ${res.status}`);
        const data = await res.json();
        if (!ignore) setIssuers(data.items || []);
      } catch (e) {
        console.error(e);
      } finally {
        if (!ignore) setIssuersLoading(false);
      }
    };
    loadInsurers();
    loadIssuers();
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
        if (!selectedIssuerId) { alert("Please select the hospital/issuer where you got this report."); setSubmitting(false); return; }
        fd.append("is_verified", "false");
        fd.append("file", uploadFile);
        fd.append("issued_by", String(selectedIssuerId));
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
      setSelectedIssuerId("");
      setUploadKey((k) => k + 1);
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

  // Reset insurer page when filters change
  useEffect(() => { setInsPage(1); }, [insurerQuery, sortByCsrDesc]);

  const insTotalPages = Math.max(1, Math.ceil(filteredInsurers.length / insPageSize));
  const insCurrentPage = Math.min(insPage, insTotalPages);
  const pagedInsurers = useMemo(() => {
    const start = (insCurrentPage - 1) * insPageSize;
    return filteredInsurers.slice(start, start + insPageSize);
  }, [filteredInsurers, insCurrentPage, insPageSize]);
  const insPageNumbers = useMemo(() => {
    const pages: (number | "ellipsis")[] = [];
    const add = (p: number) => { if (!pages.includes(p)) pages.push(p); };
    add(1);
    for (let p = insCurrentPage - 2; p <= insCurrentPage + 2; p++) {
      if (p > 1 && p < insTotalPages) add(p);
    }
    if (insTotalPages > 1) add(insTotalPages);
    const normalized: (number | "ellipsis")[] = [];
    for (let i = 0; i < pages.length; i++) {
      normalized.push(pages[i]!);
      if (i < pages.length - 1 && (pages[i + 1] as number) - (pages[i] as number) > 1) normalized.push("ellipsis");
    }
    return normalized;
  }, [insCurrentPage, insTotalPages]);

  // Docs pagination derived
  useEffect(() => { setDocPage(1); }, [docs]);
  const docTotalPages = Math.max(1, Math.ceil(docs.length / docPageSize));
  const docCurrentPage = Math.min(docPage, docTotalPages);
  const pagedDocs = useMemo(() => {
    const start = (docCurrentPage - 1) * docPageSize;
    return docs.slice(start, start + docPageSize);
  }, [docs, docCurrentPage, docPageSize]);
  const docPageNumbers = useMemo(() => {
    const pages: (number | "ellipsis")[] = [];
    const add = (p: number) => { if (!pages.includes(p)) pages.push(p); };
    add(1);
    for (let p = docCurrentPage - 2; p <= docCurrentPage + 2; p++) {
      if (p > 1 && p < docTotalPages) add(p);
    }
    if (docTotalPages > 1) add(docTotalPages);
    const normalized: (number | "ellipsis")[] = [];
    for (let i = 0; i < pages.length; i++) {
      normalized.push(pages[i]!);
      if (i < pages.length - 1 && (pages[i + 1] as number) - (pages[i] as number) > 1) normalized.push("ellipsis");
    }
    return normalized;
  }, [docCurrentPage, docTotalPages]);

  const selectedInsurer = useMemo(() => (
    filteredInsurers.find(i => i.insurance_id === Number(selectedInsuranceId))
  ), [filteredInsurers, selectedInsuranceId]);

  const needIssuerSelection = useMemo(() => {
    // If no issued doc selected (unverified path), require issuer selection when there's an upload
    return !selectedIssuedDocId && !!uploadFile;
  }, [selectedIssuedDocId, uploadFile]);

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
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-1">
                  <div className="text-xs text-muted-foreground">
                    Showing {(filteredInsurers.length === 0 ? 0 : (insCurrentPage - 1) * insPageSize + 1)}–{Math.min(insCurrentPage * insPageSize, filteredInsurers.length)} of {filteredInsurers.length} insurers
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={String(insPageSize)} onValueChange={(v) => { setInsPageSize(Number(v)); setInsPage(1); }}>
                      <SelectTrigger className="h-8 w-[120px]"><SelectValue placeholder="Rows/page" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">6 / page</SelectItem>
                        <SelectItem value="9">9 / page</SelectItem>
                        <SelectItem value="12">12 / page</SelectItem>
                      </SelectContent>
                    </Select>
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setInsPage(Math.max(1, insCurrentPage - 1)); }} />
                        </PaginationItem>
                        {insPageNumbers.map((p, i) => (
                          p === "ellipsis" ? (
                            <PaginationItem key={`ie-${i}`}><PaginationEllipsis /></PaginationItem>
                          ) : (
                            <PaginationItem key={p}>
                              <PaginationLink href="#" isActive={p === insCurrentPage} onClick={(e) => { e.preventDefault(); setInsPage(p as number); }}>{p}</PaginationLink>
                            </PaginationItem>
                          )
                        ))}
                        <PaginationItem>
                          <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setInsPage(Math.min(insTotalPages, insCurrentPage + 1)); }} />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {pagedInsurers.map((ins) => {
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
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-1">
                <div className="text-xs text-muted-foreground">
                  Showing {(docs.length === 0 ? 0 : (docCurrentPage - 1) * docPageSize + 1)}–{Math.min(docCurrentPage * docPageSize, docs.length)} of {docs.length} documents
                </div>
                <div className="flex items-center gap-2">
                  <Select value={String(docPageSize)} onValueChange={(v) => { setDocPageSize(Number(v)); setDocPage(1); }}>
                    <SelectTrigger className="h-8 w-[120px]"><SelectValue placeholder="Rows/page" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6 / page</SelectItem>
                      <SelectItem value="9">9 / page</SelectItem>
                      <SelectItem value="12">12 / page</SelectItem>
                    </SelectContent>
                  </Select>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setDocPage(Math.max(1, docCurrentPage - 1)); }} />
                      </PaginationItem>
                      {docPageNumbers.map((p, i) => (
                        p === "ellipsis" ? (
                          <PaginationItem key={`de-${i}`}><PaginationEllipsis /></PaginationItem>
                        ) : (
                          <PaginationItem key={p}>
                            <PaginationLink href="#" isActive={p === docCurrentPage} onClick={(e) => { e.preventDefault(); setDocPage(p as number); }}>{p}</PaginationLink>
                          </PaginationItem>
                        )
                      ))}
                      <PaginationItem>
                        <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setDocPage(Math.min(docTotalPages, docCurrentPage + 1)); }} />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {pagedDocs.map((d) => {
                  const selected = Number(selectedIssuedDocId) === d.id;
                  const disabled = !d.is_active;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => {
                        if (disabled) return;
                        setSelectedIssuedDocId(d.id);
                        // Clear any uploaded file when choosing an issued doc
                        setUploadFile(null);
                        setSelectedIssuerId("");
                      }}
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
                            {new Date(d.created_at).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}
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
                    key={`upload-${uploadKey}-locked`}
                    id="claim-upload-locked"
                    label="Or upload an unverified report"
                    accept=".pdf,.jpg,.jpeg,.png"
                    value={uploadFile}
                    onChange={(f) => {
                      const file = (f as File) || null;
                      setUploadFile(file);
                      if (file) {
                        // Clear issued doc selection when uploading a file
                        setSelectedIssuedDocId("");
                      }
                    }}
                    maxSize={1}
                    description="PDF or Image up to 1MB"
                    disabled={submitting}
                  />
                  {/* Issuer selection for unverified report */}
                  <div className="mt-2">
                    <div className="text-sm mb-1">Select Hospital/Issuer</div>
                    {issuersLoading ? (
                      <Skeleton className="h-9 w-64 bg-foreground/10" />
                    ) : (
                      <Select value={selectedIssuerId ? String(selectedIssuerId) : ""} onValueChange={(v) => setSelectedIssuerId(Number(v))}>
                        <SelectTrigger className="w-full sm:w-64">
                          <SelectValue placeholder="Choose issuer" />
                        </SelectTrigger>
                        <SelectContent>
                          {issuers.map((it) => (
                            <SelectItem key={it.issuer_id} value={String(it.issuer_id)}>
                              {it.organization_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">Required when submitting an unverified report.</div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">All issued documents are locked; you can upload a new report to submit as unverified.</div>
                </div>
              )}
              {hasActiveDocs && (
                <div className="mt-3">
                  <div className="text-xs text-muted-foreground mb-1">Prefer uploading instead? Leave the selection empty and attach a file below.</div>
                  <FileUpload
                    key={`upload-${uploadKey}-alt`}
                    id="claim-upload-alt"
                    label="Upload report instead of selecting"
                    accept=".pdf,.jpg,.jpeg,.png"
                    value={uploadFile}
                    onChange={(f) => {
                      const file = (f as File) || null;
                      setUploadFile(file);
                      if (file) {
                        setSelectedIssuedDocId("");
                      }
                    }}
                    maxSize={1}
                    description="PDF or Image up to 1MB"
                    disabled={submitting}
                  />
                  {needIssuerSelection && (
                    <div className="mt-2">
                      <div className="text-sm mb-1">Select Hospital/Issuer</div>
                      {issuersLoading ? (
                        <Skeleton className="h-9 w-64 bg-foreground/10" />
                      ) : (
                        <Select value={selectedIssuerId ? String(selectedIssuerId) : ""} onValueChange={(v) => setSelectedIssuerId(Number(v))}>
                          <SelectTrigger className="w-full sm:w-64">
                            <SelectValue placeholder="Choose issuer" />
                          </SelectTrigger>
                          <SelectContent>
                            {issuers.map((it) => (
                              <SelectItem key={it.issuer_id} value={String(it.issuer_id)}>
                                {it.organization_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      <div className="text-xs text-muted-foreground mt-1">Required when submitting an unverified report.</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div>
              <FileUpload
                key={`upload-${uploadKey}-empty`}
                id="claim-upload-empty"
                label="Upload your report (no issued documents found)"
                accept=".pdf,.jpg,.jpeg,.png"
                value={uploadFile}
                onChange={(f) => {
                  const file = (f as File) || null;
                  setUploadFile(file);
                  if (file) {
                    setSelectedIssuedDocId("");
                  }
                }}
                maxSize={1}
                description="PDF or Image up to 1MB"
                disabled={submitting}
              />
              {/* Issuer selection for unverified report when no issued docs exist */}
              <div className="mt-2">
                <div className="text-sm mb-1">Select Hospital/Issuer</div>
                {issuersLoading ? (
                  <Skeleton className="h-9 w-64 bg-foreground/10" />
                ) : (
                  <Select value={selectedIssuerId ? String(selectedIssuerId) : ""} onValueChange={(v) => setSelectedIssuerId(Number(v))}>
                    <SelectTrigger className="w-full sm:w-64">
                      <SelectValue placeholder="Choose issuer" />
                    </SelectTrigger>
                    <SelectContent>
                      {issuers.map((it) => (
                        <SelectItem key={it.issuer_id} value={String(it.issuer_id)}>
                          {it.organization_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <div className="text-xs text-muted-foreground mt-1">Required when submitting an unverified report.</div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={submit}
              disabled={
                submitting ||
                !selectedInsuranceId ||
                (!selectedIssuedDocId && !uploadFile) ||
                // If unverified flow, ensure issuer is selected
                ((!selectedIssuedDocId && !!uploadFile) && !selectedIssuerId)
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
