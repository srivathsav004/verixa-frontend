"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { config } from "@/lib/config";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { CONTRACT_ABI, CONTRACT_BYTECODE, hasContractArtifacts } from "@/lib/contracts/documentValidationBounty";

export type ValidateDocumentsProps = { insuranceId: number };

type ClaimItem = {
  claim_id: number;
  patient_id: number;
  insurance_id: number;
  report_url: string;
  is_verified: boolean;
  issued_by?: number | null;
  status: string;
  created_at: string;
};

type QueueItem = {
  claim_id: number;
  patient_id: number;
  insurance_id: number;
  report_url: string;
  is_verified: boolean;
  task_row_id: number;
  task_id: number;
  contract_address: string;
  task_status: string | null;
  created_at: string;
};

type PaginatedClaimsResponse = {
  items: (ClaimItem | QueueItem)[];
  total: number;
  page: number;
  page_size: number;
};

export default function ValidateDocuments({ insuranceId }: ValidateDocumentsProps) {
  const api = useMemo(() => (config.apiBaseUrl || "http://127.0.0.1:8000") + "/api", []);
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ClaimItem[]>([]);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [aiScores, setAiScores] = useState<Record<number, number>>({});
  const [patientNames, setPatientNames] = useState<Record<number, string>>({});

  // Web3 state
  const [userId, setUserId] = useState<number | null>(null);
  const [userWallet, setUserWallet] = useState<string | null>(null);
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  const [loadingWeb3, setLoadingWeb3] = useState(false);

  // Deploy modal state
  const [openDeploy, setOpenDeploy] = useState(false);
  const [existingAddress, setExistingAddress] = useState<string>("");

  // Create task modal state
  const [openTask, setOpenTask] = useState(false);
  const [selectedDocCid, setSelectedDocCid] = useState<string>("");
  const [selectedClaimId, setSelectedClaimId] = useState<number | null>(null);
  const [requiredValidators, setRequiredValidators] = useState<number>(1);
  const [rewardPol, setRewardPol] = useState<string>("0");
  const [issuerWallet, setIssuerWallet] = useState<string>("");

  // View mode: 'unassigned' (no task yet) or 'queue' (has task)
  const [viewMode, setViewMode] = useState<'unassigned' | 'queue'>('unassigned');

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({
        page: String(page),
        page_size: String(pageSize),
      });
      if (search.trim()) qs.set("search", search.trim());
      const resp = await fetch(`${api}/claims/manual-review/by-insurance/${insuranceId}?${qs.toString()}`);
      if (!resp.ok) throw new Error(`fetch failed ${resp.status}`);
      const j = await resp.json();
      setItems(j.items || []);
      setTotal(j.total || 0);
      // preload AI evals and patient names for current page
      loadAIEvals(j.items || []);
      prefetchPatientNames(j.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!insuranceId) return;
    fetchClaims();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [insuranceId, page, pageSize, search]);

  const loadAIEvals = async (rows: ClaimItem[]) => {
    const ids = rows.map((r) => r.claim_id);
    if (!ids.length) return;
    try {
      const res = await fetch(`${api}/claims/ai-evaluations/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim_ids: ids }),
      });
      if (!res.ok) return;
      const evals: Array<{ claim_id: number; ai_score: number; bucket?: string; evaluated_at: string }> = await res.json();
      const map: Record<number, number> = {};
      evals.forEach((e) => { map[e.claim_id] = e.ai_score; });
      setAiScores((prev) => ({ ...prev, ...map }));
    } catch (err) {
      console.warn("ai eval preload failed", err);
    }
  };

  const approveSelected = async () => {
    const ids = Object.entries(selected).filter(([, v]) => v).map(([k]) => Number(k));
    if (ids.length === 0) return toast({ title: "No selection", description: "Select claims to approve.", variant: "destructive" });
    try {
      const res = await fetch(`${api}/claims/bulk-verify-approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim_ids: ids }),
      });
      if (!res.ok) throw new Error("approve failed");
      toast({ title: "Approved", description: `Approved ${ids.length} claim(s)` });
      fetchClaims();
    } catch (e) {
      console.error(e);
      toast({ title: "Approve failed", description: "Please try again.", variant: "destructive" });
    }
  };

  const rejectSelected = async () => {
    const ids = Object.entries(selected).filter(([, v]) => v).map(([k]) => Number(k));
    if (ids.length === 0) return toast({ title: "No selection", description: "Select claims to reject.", variant: "destructive" });
    try {
      const res = await fetch(`${api}/claims/bulk-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim_ids: ids, status: "rejected" }),
      });
      if (!res.ok) throw new Error("reject failed");
      toast({ title: "Rejected", description: `Rejected ${ids.length} claim(s)` });
      fetchClaims();
    } catch (e) {
      console.error(e);
      toast({ title: "Reject failed", description: "Please try again.", variant: "destructive" });
    }
  };

  const fetchPatientName = async (patientId: number) => {
    if (patientNames[patientId]) return;
    try {
      const res = await fetch(`${api}/patient/${patientId}/basic-info`);
      if (!res.ok) return;
      const j = await res.json();
      const full = `${j.first_name ?? ""} ${j.last_name ?? ""}`.trim() || `Patient #${patientId}`;
      setPatientNames((m) => ({ ...m, [patientId]: full }));
    } catch {}
  };

  const prefetchPatientNames = (rows: ClaimItem[]) => {
    const unique = Array.from(new Set(rows.map((r) => r.patient_id)));
    unique.forEach((pid) => { if (!patientNames[pid]) fetchPatientName(pid); });
  };

  const platformFeeBps = 1000; // 10%
  const issuerFeePol = 0.01;
  const totalSendPol = useMemo(() => {
    const r = parseFloat(rewardPol || "0");
    if (Number.isNaN(r)) return 0;
    return Math.max(0, r) + issuerFeePol;
  }, [rewardPol]);

  // Deploy or set existing contract
  const handleDeployOrSet = async () => {
    if (!userId) return toast({ title: "Not logged in", description: "Missing user id", variant: "destructive" });
    if (!userWallet) return toast({ title: "No wallet on profile", description: "Add your wallet to profile first.", variant: "destructive" });
    setLoadingWeb3(true);
    try {
      // Enforce single contract per wallet: check backend first
      try {
        const chk = await fetch(`${api}/web3/contracts/by-wallet/${encodeURIComponent(userWallet)}`);
        const jc = await chk.json();
        const addr = jc?.contract?.contract_address;
        if (addr && !existingAddress?.trim()) {
          setContractAddress(addr);
          setOpenDeploy(false);
          toast({ title: "Contract already exists", description: `Using ${addr}` });
          return;
        }
      } catch {}

      let deployedAddress = existingAddress?.trim();
      if (!deployedAddress) {
        // Deploy
        if (!hasContractArtifacts()) {
          toast({ title: "Missing artifacts", description: "ABI/Bytecode not set in documentValidationBounty.ts", variant: "destructive" });
          return;
        }
        const { ethers } = await import("ethers");
        // @ts-ignore
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const signer = await provider.getSigner();
        const factory = new ethers.ContractFactory(CONTRACT_ABI, CONTRACT_BYTECODE, signer);
        const contract = await factory.deploy();
        await contract.waitForDeployment();
        deployedAddress = await contract.getAddress();
      }

      // Persist
      const resp = await fetch(`${api}/web3/contracts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, wallet_address: userWallet, contract_address: deployedAddress })
      });
      if (!resp.ok) {
        const j = await resp.json().catch(() => ({} as any));
        if (resp.status === 409) {
          // Someone tried to deploy again; use existing by wallet
          try {
            const chk = await fetch(`${api}/web3/contracts/by-wallet/${encodeURIComponent(userWallet)}`);
            const jc = await chk.json();
            const addr = jc?.contract?.contract_address;
            if (addr) {
              setContractAddress(addr);
              setOpenDeploy(false);
              toast({ title: "Contract exists", description: `Using ${addr}` });
              return;
            }
          } catch {}
        }
        throw new Error(j?.detail || "save_contract failed");
      }
      setContractAddress(deployedAddress);
      setOpenDeploy(false);
      toast({ title: "Contract ready", description: `Using ${deployedAddress}` });
    } catch (e: any) {
      console.error(e);
      toast({ title: "Contract setup failed", description: e?.message || "Error", variant: "destructive" });
    } finally {
      setLoadingWeb3(false);
    }
  };

  const handleOpenCreateTask = () => {
    const ids = Object.keys(selected).filter((k) => selected[Number(k)]).map(Number);
    if (ids.length !== 1) return toast({ title: "Select one document", description: "Select exactly one row to create a task.", variant: "destructive" });
    const id = ids[0];
    const row = items.find((i) => i.claim_id === id);
    if (!row) return toast({ title: "Invalid selection", description: "Row not found", variant: "destructive" });
    if (!contractAddress) return toast({ title: "No contract", description: "Deploy or set a contract first.", variant: "destructive" });
    // Use report_url as docCid for now (or you can transform to IPFS CID upstream)
    setSelectedDocCid(row?.report_url || "");
    setSelectedClaimId(row?.claim_id || null);
    setOpenTask(true);
  };

  const handleCreateTask = async () => {
    if (!userId) return toast({ title: "Not logged in", description: "Missing user id", variant: "destructive" });
    if (!contractAddress) return toast({ title: "No contract", description: "Deploy or set a contract first.", variant: "destructive" });
    if (!issuerWallet || !selectedDocCid || requiredValidators <= 0) return toast({ title: "Missing fields", description: "Provide issuer wallet, validators and doc CID.", variant: "destructive" });
    setLoadingWeb3(true);
    try {
      const { ethers } = await import("ethers");
      // @ts-ignore
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();

      // Use centralized ABI
      if (!Array.isArray(CONTRACT_ABI) || CONTRACT_ABI.length === 0) {
        toast({ title: "ABI missing", description: "Set ABI in documentValidationBounty.ts", variant: "destructive" });
        return;
      }
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
      let valueWei: bigint;
      try {
        valueWei = ethers.parseEther(totalSendPol.toString());
      } catch {
        throw new Error("Invalid reward amount");
      }

      // Preflight: try static call and gas estimate to surface revert reasons early
      try {
        // staticCall in ethers v6
        await contract.createTask.staticCall(
          selectedDocCid,
          BigInt(requiredValidators),
          issuerWallet,
          { value: valueWei }
        );
        await contract.createTask.estimateGas(
          selectedDocCid,
          BigInt(requiredValidators),
          issuerWallet,
          { value: valueWei }
        );
      } catch (err: any) {
        const msg = err?.shortMessage || err?.reason || err?.message || "Transaction would fail (revert)";
        throw new Error(`Preflight failed: ${msg}`);
      }

      // Send tx
      const tx = await contract.createTask(
        selectedDocCid,
        BigInt(requiredValidators),
        issuerWallet,
        { value: valueWei }
      );
      const rc = await tx.wait();

      // Parse TaskCreated event to get taskId and rewardWei
      // Fallback: try reading nextTaskId-1
      let onchainTaskId: number | null = null;
      let rewardWeiNum: number | null = null;
      try {
        for (const lg of rc.logs || []) {
          try {
            const parsed = contract.interface.parseLog({ topics: lg.topics, data: lg.data });
            if (parsed?.name === "TaskCreated") {
              onchainTaskId = Number(parsed.args?.taskId);
              rewardWeiNum = Number(parsed.args?.rewardWei);
              break;
            }
          } catch {}
        }
      } catch {}
      if (onchainTaskId == null) {
        // Try reading last taskId via nextTaskId - 1
        try {
          const next = await contract.nextTaskId();
          onchainTaskId = Number(next) - 1;
        } catch {}
      }

      // Persist task
      const persist = await fetch(`${api}/web3/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          contract_address: contractAddress,
          task_id: onchainTaskId ?? -1,
          doc_cid: selectedDocCid,
          required_validators: requiredValidators,
          reward_wei: Number(rewardWeiNum?.toString?.() || 0),
          issuer_wallet: issuerWallet,
          tx_hash: tx.hash,
          claim_id: selectedClaimId,
          task_status: "pending",
        })
      });
      if (!persist.ok) throw new Error("save_task failed");

      setOpenTask(false);
      toast({ title: "Task created", description: `Task #${onchainTaskId ?? "?"} created` });
    } catch (e: any) {
      console.error(e);
      let desc = e?.message || "Error";
      // Surface common MetaMask JSON-RPC error details if available
      const info = (e?.info || {}) as any;
      const errObj = info?.error || e?.error || {};
      if (errObj?.message && !desc.includes(errObj.message)) desc = `${desc} — ${errObj.message}`;
      toast({ title: "Create task failed", description: desc, variant: "destructive" });
    } finally {
      setLoadingWeb3(false);
    }
  };

  const pageNumbers = useMemo(() => {
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
  }, [page, pageCount]);

  const allOnPageChecked = items.length > 0 && items.every((i) => selected[i.claim_id]);

  const handleToggleAll = (checked: boolean) => {
    const pageIds = items.map((i) => i.claim_id);
    const next: Record<number, boolean> = { ...selected };
    pageIds.forEach((id) => (next[id] = checked));
    setSelected(next);
  };

  const handleToggle = (id: number, checked: boolean) => setSelected((s) => ({ ...s, [id]: checked }));

  return (
    <div className="max-w-full">
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle>Validate Documents</CardTitle>
          <CardDescription>
            Manual review queue. Pending, external claims bucketed as manual.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-sm text-muted-foreground">
              Showing {start}-{end} of {total}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Input placeholder="Search by URL" value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} className="w-56" />
              <Select value={String(pageSize)} onValueChange={(v) => { setPage(1); setPageSize(Number(v)); }}>
                <SelectTrigger className="w-[100px]"><SelectValue placeholder="Page size" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                </SelectContent>
              </Select>
              <Dialog open={openDeploy} onOpenChange={setOpenDeploy}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">{contractAddress ? "View Contract" : "Setup Contract"}</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Contract Setup</DialogTitle>
                    <DialogDescription>
                      Use an existing contract address or deploy a new one (only once per wallet). Your wallet: {userWallet || "unknown"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-3 py-2">
                    <div className="grid gap-1">
                      <Label>Existing Contract Address (optional)</Label>
                      <Input value={existingAddress} onChange={(e) => setExistingAddress(e.target.value)} placeholder="0x..." />
                    </div>
                    <div className="text-xs text-muted-foreground">ABI/Bytecode are read from <code>lib/contracts/documentValidationBounty.ts</code>.</div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleDeployOrSet} disabled={loadingWeb3}>{loadingWeb3 ? "Please wait..." : "Use / Deploy"}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="mt-3 rounded-md border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-foreground/5 text-xs">
                <tr>
                  <th className="p-2 w-10 text-left"><Checkbox checked={allOnPageChecked} onCheckedChange={(c) => handleToggleAll(!!c)} /></th>
                  <th className="p-2 text-left">S.No.</th>
                  <th className="p-2 text-left">Patient</th>
                  <th className="p-2 text-left">Report URL</th>
                  <th className="p-2 text-left">AI Score</th>
                  <th className="p-2 text-left">Bucket</th>
                  <th className="p-2 text-left">Created</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={7} className="p-3">Loading...</td></tr>
                )}
                {!loading && items.length === 0 && (
                  <tr><td colSpan={7} className="p-3 text-muted-foreground">No records</td></tr>
                )}
                {!loading && items.map((r, idx) => {
                  const score = aiScores[r.claim_id];
                  return (
                    <tr key={r.claim_id} className={`${idx % 2 ? "bg-foreground/5/20" : ""} hover:bg-foreground/5`}>
                      <td className="p-2 align-top"><Checkbox checked={!!selected[r.claim_id]} onCheckedChange={(c) => handleToggle(r.claim_id, !!c)} /></td>
                      <td className="p-2 align-top">{(page - 1) * pageSize + idx + 1}</td>
                      <td className="p-2 align-top">{patientNames[r.patient_id] ?? `Patient #${r.patient_id}`}</td>
                      <td className="p-2 align-top"><a href={r.report_url} target="_blank" className="text-primary underline">Open</a></td>
                      <td className="p-2 align-top">{score == null ? "-" : score}</td>
                      <td className="p-2 align-top"><Badge className="bg-amber-500 hover:bg-amber-500">manual</Badge></td>
                      <td className="p-2 align-top whitespace-nowrap">{new Date(r.created_at).toLocaleString("en-US")}</td>
                    </tr>
                  );
                })}
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

            <div className="ml-auto flex flex-wrap items-center gap-2">
              <Button variant="secondary" onClick={approveSelected} disabled={loading}>Approve Selected</Button>
              <Button variant="destructive" onClick={rejectSelected} disabled={loading}>Reject Selected</Button>
              <Button onClick={handleOpenCreateTask} disabled={loading || !contractAddress}>Create Task</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Task Modal */}
      <Dialog open={openTask} onOpenChange={setOpenTask}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Create Validation Task</DialogTitle>
            <DialogDescription>
              Platform fee: 10% of reward pool. Issuer fee: 0.01 POL added on top. Total to send = reward + 0.01 POL.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid gap-1">
              <Label>Document CID / URL</Label>
              <Input value={selectedDocCid} onChange={(e) => setSelectedDocCid(e.target.value)} placeholder="ipfs://... or https://..." />
            </div>
            <div className="grid gap-1">
              <Label>Required Validators</Label>
              <Input type="number" min={1} value={requiredValidators} onChange={(e) => setRequiredValidators(Number(e.target.value))} />
            </div>
            <div className="grid gap-1">
              <Label>Reward (POL) — platform takes 10% on finalize</Label>
              <Input type="number" min={0} step="0.0001" value={rewardPol} onChange={(e) => setRewardPol(e.target.value)} />
              <div className="text-xs text-muted-foreground">Issuer fee fixed at 0.01 POL. Total to send now: {totalSendPol.toFixed(4)} POL</div>
            </div>
            <div className="grid gap-1">
              <Label>Issuer Wallet Address</Label>
              <Input value={issuerWallet} onChange={(e) => setIssuerWallet(e.target.value)} placeholder="0x..." />
            </div>
            <div className="text-xs text-muted-foreground">Contract ABI loaded from <code>lib/contracts/documentValidationBounty.ts</code>.</div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateTask} disabled={loadingWeb3 || !contractAddress}>{loadingWeb3 ? "Creating..." : "Create Task"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
