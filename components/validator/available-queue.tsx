"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { config } from "@/lib/config";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { CONTRACT_ABI } from "@/lib/contracts/documentValidationBounty";

// Displays tasks available for validators. Uses backend verification-queue endpoint filtered by insurance (required by backend).
// Shows: Insurance name, report URL, required validators, reward POL, status, created date. Includes search and pagination.

type QueueItem = {
  claim_id: number;
  patient_id: number;
  insurance_id: number;
  report_url: string;
  is_verified: boolean;
  task_row_id: number;
  task_id: number;
  status: string | null;
  required_validators?: number | null;
  tx_hash?: string | null;
  reward_pol?: string | null;
  contract_address?: string | null;
  created_at: string;
};

type InsuranceListItem = { insurance_id: number; company_name: string };

export default function AvailableQueue() {
  const api = useMemo(() => (config.apiBaseUrl || "http://127.0.0.1:8000") + "/api", []);
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<QueueItem[]>([]);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const [insurances, setInsurances] = useState<InsuranceListItem[]>([]);
  const [insuranceId, setInsuranceId] = useState<string>("");

  const [insuranceMap, setInsuranceMap] = useState<Record<number, string>>({});
  const [submissionCounts, setSubmissionCounts] = useState<Record<number, number>>({});
  // Cookie-based session will identify the validator; no wallet needed for filtering

  // Submit Result modal state
  const [openSubmit, setOpenSubmit] = useState(false);
  const [activeTask, setActiveTask] = useState<QueueItem | null>(null);
  const [resultCid, setResultCid] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);

  const loadInsurances = async () => {
    try {
      const res = await fetch(`${api}/insurance/list`);
      if (!res.ok) throw new Error(`insurance list failed ${res.status}`);
      const j = await res.json();
      const list = (j.items || []) as InsuranceListItem[];
      setInsurances(list);
      const map: Record<number, string> = {};
      list.forEach((it) => (map[it.insurance_id] = it.company_name));
      setInsuranceMap(map);
      if (list.length && !insuranceId) setInsuranceId(String(list[0].insurance_id));
    } catch (e: any) {
      console.error(e);
      toast({ title: "Failed to load insurances", description: e?.message || "Error", variant: "destructive" });
    }
  };

  const load = async () => {
    if (!insuranceId) return;
    setLoading(true);
    try {
      // Cross-site cookie fallback: include validator_user_id if available
      const getCookie = (name: string) =>
        typeof document === "undefined"
          ? ""
          : (document.cookie.split("; ").find((row) => row.startsWith(name + "="))?.split("=")[1] || "");
      const uidFromCookie = getCookie("user_id") || getCookie("validator_user_id");
      const uidFromStorage = typeof window !== "undefined" ? (localStorage.getItem("user_id") || localStorage.getItem("validator_user_id") || "") : "";
      const validatorId = uidFromCookie || uidFromStorage || "";

      const qs = new URLSearchParams({
        insurance_id: insuranceId,
        page: String(page),
        page_size: String(pageSize),
      });
      if (search.trim()) qs.set("search", search.trim());
      if (validatorId) qs.set("validator_user_id", validatorId);
      const resp = await fetch(`${api}/verification-queue?${qs.toString()}`, { credentials: 'include' });
      if (!resp.ok) throw new Error(`fetch queue failed ${resp.status}`);
      const j = await resp.json();
      const rows: QueueItem[] = j.items || [];
      setItems(rows);
      setTotal(j.total ?? rows.length ?? 0);
    } catch (e: any) {
      console.error(e);
      toast({ title: "Load failed", description: e?.message || "Error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInsurances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // No wallet detection; backend uses session cookie user_id

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [insuranceId, page, pageSize, search]);

  // Fetch on-chain submission counts per task to show progress (x/y validators)
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const rows = items || [];
        if (!rows.length) { setSubmissionCounts({}); return; }
        const { ethers } = await import("ethers");
        // Default to Polygon Amoy public RPC for read-only
        const rpc = "https://rpc-amoy.polygon.technology";
        const provider = new ethers.JsonRpcProvider(rpc);
        const res: Record<number, number> = {};
        await Promise.all(rows.map(async (r) => {
          try {
            const addr = (r.contract_address || "").trim();
            if (!addr || !/^0x[a-fA-F0-9]{40}$/.test(addr)) return;
            const contract = new ethers.Contract(ethers.getAddress(addr), CONTRACT_ABI as any, provider);
            const cnt = await contract.getSubmissionCount(r.task_id);
            res[r.task_id] = Number(cnt);
          } catch { /* ignore per-row errors */ }
        }));
        setSubmissionCounts(res);
      } catch { /* ignore global errors */ }
    };
    fetchCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const pageNumbers = (() => {
    const maxButtons = 5;
    const pages: (number | string)[] = [];
    if (pageCount <= maxButtons) {
      for (let p = 1; p <= pageCount; p++) pages.push(p);
      return pages;
    }
    const half = Math.floor(maxButtons / 2);
    let startP = Math.max(1, page - half);
    let endP = Math.min(pageCount, startP + maxButtons - 1);
    if (endP - startP + 1 < maxButtons) startP = Math.max(1, endP - maxButtons + 1);
    if (startP > 1) pages.push(1, "...");
    for (let p = startP; p <= endP; p++) pages.push(p);
    if (endP < pageCount) pages.push("...", pageCount);
    return pages;
  })();

  const formatReward = (v?: string | null) => {
    if (!v) return "-";
    const num = Number(v);
    if (Number.isNaN(num)) return v;
    const net = num * 0.9; // show 90% net (10% platform fee)
    return net.toFixed(3);
  };

  const openSubmitFor = (task: QueueItem) => {
    setActiveTask(task);
    setResultCid("");
    setOpenSubmit(true);
  };

  // Normalize user-provided input into a bare CID string
  const normalizeCid = (input: string): string => {
    let v = (input || "").trim();
    if (!v) return "";
    // Strip ipfs:// prefix
    if (v.startsWith("ipfs://")) v = v.replace(/^ipfs:\/\//, "");
    // Extract from common gateway URLs (e.g., https://ipfs.io/ipfs/<CID>/..., https://gateway.pinata.cloud/ipfs/<CID>)
    const m = v.match(/\/ipfs\/([a-zA-Z0-9]+)(?:[/?].*)?$/);
    if (m && m[1]) return m[1];
    // If looks like a raw CID (v0 or v1 base32/base58), accept as-is
    // Basic heuristic: alphanumeric, length >= 46
    if (/^[a-zA-Z0-9]+$/.test(v) && v.length >= 46) return v;
    return v; // fallback
  };

  const handleSubmitOnChain = async () => {
    if (!activeTask) return;
    const rawAddr = (activeTask.contract_address || "").trim();
    if (!rawAddr || !/^0x[a-fA-F0-9]{40}$/.test(rawAddr)) {
      toast({ title: "Missing contract address", description: "Task is missing a valid contract address.", variant: "destructive" });
      return;
    }
    if (!resultCid.trim()) {
      toast({ title: "Result CID required", description: "Paste the uploaded result CID (e.g., IPFS CID).", variant: "destructive" });
      return;
    }
    const cid = normalizeCid(resultCid);
    setSubmitting(true);
    try {
      const { ethers } = await import("ethers");
      // @ts-ignore
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      try { await provider.send("eth_requestAccounts", []); } catch { throw new Error("Wallet access rejected"); }
      const targetChains = new Set([0x13882, 0x89]); // Polygon Amoy or Mainnet
      let network = await provider.getNetwork();
      if (!targetChains.has(Number(network.chainId))) {
        try {
          await (window as any).ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: "0x13882" }] });
          network = await provider.getNetwork();
        } catch (switchErr) {
          try {
            await (window as any).ethereum.request({
              method: "wallet_addEthereumChain",
              params: [{
                chainId: "0x13882",
                chainName: "Polygon Amoy",
                nativeCurrency: { name: "POL", symbol: "POL", decimals: 18 },
                rpcUrls: ["https://rpc-amoy.polygon.technology"],
                blockExplorerUrls: ["https://www.oklink.com/amoy"],
              }],
            });
            network = await provider.getNetwork();
          } catch {
            throw new Error("Please switch to Polygon Amoy/Mainnet in MetaMask");
          }
        }
      }
      const signer = await provider.getSigner();
      // Basic wallet balance check (avoid silent RPC failures when out of gas funds)
      try {
        const bal = await provider.getBalance(await signer.getAddress());
        if (bal && bal.toString() === "0") {
          throw new Error("Wallet has 0 POL on this network. Please fund to cover gas.");
        }
      } catch (_) { /* ignore balance read errors */ }

      // Normalize address (checksummed), verify contract code exists, and instantiate
      let contractAddress: string;
      try { contractAddress = ethers.getAddress(rawAddr); } catch { throw new Error("Invalid contract address"); }
      const code = await provider.getCode(contractAddress);
      if (!code || code === "0x") throw new Error("No contract found at provided address on this network");
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI as any, signer);

      // Optional read: prevent obvious finalized task submissions
      try {
        const info = await contract.getTaskInfo(activeTask.task_id);
        if (info?.finalized) {
          throw new Error("Task already finalized on-chain");
        }
      } catch (_) { /* ignore read errors; continue */ }

      // Prepare function handle (ethers v6)
      const submitFn = contract.getFunction("submitResult");
      // Simulate to surface revert reason before sending a tx
      try {
        await submitFn.staticCall(activeTask.task_id, cid);
      } catch (simErr: any) {
        const msg = simErr?.shortMessage || simErr?.reason || simErr?.error?.message || simErr?.message || "Simulation failed";
        throw new Error(`Transaction would revert: ${msg}`);
      }

      // Send transaction (let wallet/provider estimate gas)
      const tx = await submitFn.send(activeTask.task_id, cid);
      const rec = await tx.wait();

      // Record validator submission in backend (multi-validator aware)
      try {
        const txHash = tx.hash || rec?.hash || undefined;
        await fetch(`${api}/validator/submissions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: 'include',
          body: JSON.stringify({ task_id: activeTask.task_id, result_cid: cid, tx_hash: txHash }),
        }).catch(() => {});
      } catch {}

      toast({ title: "Submitted on-chain", description: `Tx: ${tx.hash || rec?.hash || "unknown"}` });
      setOpenSubmit(false);
      // Refresh queue after a short delay
      setTimeout(() => load(), 500);
    } catch (e: any) {
      console.error(e);
      // Try to present a clearer, decoded error message
      const raw = e?.shortMessage || e?.reason || e?.info?.error?.message || e?.data?.message || e?.message || "Unknown error";
      const isMM = e?.code === -32603 || /Internal JSON-RPC error/i.test(String(raw));
      const msg = isMM ? `Wallet RPC error: ${raw}. Please ensure network is Polygon Amoy/Mainnet and try again.` : raw;
      toast({ title: "On-chain submission failed", description: msg, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-full">
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle>Available Queue</CardTitle>
          <CardDescription>
            Pending validation tasks. Filter by insurance and search by URL or Claim ID.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Insurance</span>
              <Select value={insuranceId} onValueChange={(v) => { setPage(1); setInsuranceId(v); }}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select insurance" />
                </SelectTrigger>
                <SelectContent>
                  {insurances.map((i) => (
                    <SelectItem key={i.insurance_id} value={String(i.insurance_id)}>
                      {i.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Input placeholder="Search by URL or Claim ID" value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} className="w-56" />
            </div>
          </div>

          <div className="mt-3 rounded-md border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-foreground/5 text-xs">
                <tr>
                  <th className="p-2 text-left">S.No.</th>
                  <th className="p-2 text-left">Insurance</th>
                  <th className="p-2 text-left">Report URL</th>
                  <th className="p-2 text-left">Task ID</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Required Validators</th>
                  <th className="p-2 text-left">Reward (POL, 90% net)</th>
                  <th className="p-2 text-left">Created</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={8} className="p-3">Loading...</td></tr>
                )}
                {!loading && items.length === 0 && (
                  <tr><td colSpan={8} className="p-3 text-muted-foreground">No records</td></tr>
                )}
                {!loading && items.map((r, idx) => (
                  <tr key={`${r.claim_id}-${r.task_id}`} className={`${idx % 2 ? "bg-foreground/5/20" : ""} hover:bg-foreground/5`}>
                    <td className="p-2 align-top">{(page - 1) * pageSize + idx + 1}</td>
                    <td className="p-2 align-top">{insuranceMap[r.insurance_id] ?? `Insurance #${r.insurance_id}`}</td>
                    <td className="p-2 align-top"><a href={r.report_url} target="_blank" className="text-primary underline">Open</a></td>
                    <td className="p-2 align-top">{r.task_id}</td>
                    <td className="p-2 align-top"><Badge variant="outline">{r.status ?? '-'}</Badge></td>
                    <td className="p-2 align-top">
                      {typeof r.required_validators === 'number'
                        ? `${submissionCounts[r.task_id] ?? 0}/${r.required_validators}`
                        : '-'}
                    </td>
                    <td className="p-2 align-top">{formatReward(r.reward_pol)}</td>
                    <td className="p-2 align-top whitespace-nowrap">{new Date(r.created_at).toLocaleString("en-US")}</td>
                    <td className="p-2 align-top">
                      <Button size="sm" onClick={() => openSubmitFor(r)}>Submit Result</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)); }} />
                </PaginationItem>
                {pageNumbers.map((p, i) => (
                  <PaginationItem key={`${p}-${i}`}>
                    {p === "..." ? (
                      <span className="px-3">...</span>
                    ) : (
                      <PaginationLink href="#" isActive={p === page} onClick={(e) => { e.preventDefault(); setPage(Number(p)); }}>{p}</PaginationLink>
                    )}
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(pageCount, p + 1)); }} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>

      {/* Submit Result Dialog */}
      <Dialog open={openSubmit} onOpenChange={setOpenSubmit}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Submit Validation Result</DialogTitle>
            <DialogDescription>
              Task #{activeTask?.task_id} — Paste your result CID (supports ipfs:// or gateway URLs). We'll normalize it and submit on-chain.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="resultCid">Result CID</Label>
              <Input id="resultCid" placeholder="bafy... or ipfs://bafy..." value={resultCid} onChange={(e) => setResultCid(e.target.value)} />
              <p className="text-xs text-muted-foreground">Paste your IPFS CID or ipfs:// URL. We'll extract the CID and submit it on-chain.</p>
              {activeTask?.contract_address && (
                <p className="text-xs text-muted-foreground">Using contract: {activeTask.contract_address}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenSubmit(false)} disabled={submitting}>Cancel</Button>
            <Button onClick={handleSubmitOnChain} disabled={submitting}>{submitting ? "Submitting..." : "Submit On-Chain"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
