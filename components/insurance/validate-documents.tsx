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
  status: string | null;
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

  // Unassigned (no task yet) state
  const [loadingUnassigned, setLoadingUnassigned] = useState(false);
  const [unassignedItems, setUnassignedItems] = useState<ClaimItem[]>([]);
  const [unassignedTotal, setUnassignedTotal] = useState(0);

  // Queue (has tasks) state
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [queueTotal, setQueueTotal] = useState(0);

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
  const [contractLoading, setContractLoading] = useState<boolean>(true);
  const [loadingWeb3, setLoadingWeb3] = useState(false);

  // Deploy modal state
  const [openDeploy, setOpenDeploy] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);

  // Create task modal state
  const [openTask, setOpenTask] = useState(false);
  const [selectedDocCid, setSelectedDocCid] = useState<string>("");
  const [selectedClaimId, setSelectedClaimId] = useState<number | null>(null);
  const [requiredValidators, setRequiredValidators] = useState<number>(1);
  const [rewardPol, setRewardPol] = useState<string>("0");
  // issuer wallet removed
  // Batch selection state for multi-create
  const [batchDocs, setBatchDocs] = useState<Array<{ claim_id: number; docCid: string }>>([]);
  const [batchProgress, setBatchProgress] = useState<{ done: number; total: number }>({ done: 0, total: 0 });
  const [estimatingGas, setEstimatingGas] = useState(false);
  const [estGasPerTaskWei, setEstGasPerTaskWei] = useState<bigint | null>(null);
  const [estGasPriceWei, setEstGasPriceWei] = useState<bigint | null>(null);

  // View mode: 'unassigned' (no task yet) or 'queue' (has task)
  const [viewMode, setViewMode] = useState<'unassigned' | 'queue'>('unassigned');

  const currentTotal = viewMode === 'unassigned' ? unassignedTotal : queueTotal;
  const pageCount = Math.max(1, Math.ceil(currentTotal / pageSize));
  const start = currentTotal === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(currentTotal, page * pageSize);

  const fetchUnassigned = async () => {
    setLoadingUnassigned(true);
    try {
      const qs = new URLSearchParams({
        page: String(page),
        page_size: String(pageSize),
      });
      if (search.trim()) qs.set("search", search.trim());
      // Only manual bucket and WITHOUT tasks
      const resp = await fetch(`${api}/claims/manual-review-without-task/by-insurance/${insuranceId}?${qs.toString()}`);
      if (!resp.ok) throw new Error(`fetch failed ${resp.status}`);
      const j = await resp.json();
      setUnassignedItems(j.items || []);
      setUnassignedTotal(j.total || 0);
      // preload AI evals and patient names for current page
      loadAIEvals(j.items || []);
      prefetchPatientNames(j.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingUnassigned(false);
    }
  };

  const fetchQueue = async () => {
    setLoadingQueue(true);
    try {
      const qs = new URLSearchParams({
        insurance_id: String(insuranceId),
        page: String(page),
        page_size: String(pageSize),
      });
      if (search.trim()) qs.set("search", search.trim());
      const resp = await fetch(`${api}/verification-queue?${qs.toString()}`);
      if (!resp.ok) throw new Error(`fetch queue failed ${resp.status}`);
      const j = await resp.json();
      setQueueItems(j.items || []);
      setQueueTotal(j.total || 0);
      prefetchPatientNames((j.items || []) as ClaimItem[]);
      // Optionally load AI scores for queue as well (not strictly needed, bucket may vary)
      loadAIEvals((j.items || []) as ClaimItem[]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingQueue(false);
    }
  };

  useEffect(() => {
    if (!insuranceId) return;
    if (viewMode === 'unassigned') fetchUnassigned();
    else fetchQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [insuranceId, page, pageSize, search, viewMode]);

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
  const totalSendPol = useMemo(() => {
    const r = parseFloat(rewardPol || "0");
    if (Number.isNaN(r)) return 0;
    return Math.max(0, r);
  }, [rewardPol]);

  // Resolve user_id and wallet, and prefetch existing validation contract
  useEffect(() => {
    const getCookie = (name: string) => {
      if (typeof document === "undefined") return null;
      const match = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([.$?*|{}()\[\\]\\\/\+^])/g, "\\$1") + "=([^;]*)"));
      return match ? decodeURIComponent(match[1]) : null;
    };
    const userIdStr = (typeof window !== "undefined" && window.localStorage.getItem("user_id")) || getCookie("user_id");
    const uid = userIdStr ? Number(userIdStr) : NaN;
    if (!Number.isNaN(uid)) setUserId(uid);

    const fetchUserAndContract = async () => {
      setContractLoading(true);
      let walletAddr: string | null = null;
      try {
        if (!Number.isNaN(uid)) {
          const u = await fetch(`${api}/users/${uid}`);
          if (u.ok) {
            const ju = await u.json();
            walletAddr = (ju?.wallet_address || null);
            setUserWallet(walletAddr);
          }
        }
      } catch {}
      // Fallback by wallet address to get existing validation contract
      try {
        const w = walletAddr || userWallet;
        if (w) {
          const r = await fetch(`${api}/web3/contracts/by-wallet/${encodeURIComponent(w)}`);
          if (r.ok) {
            const j = await r.json();
            const addr = j?.contract?.validate_contract || null;
            if (addr) setContractAddress(addr);
          }
        }
      } catch {}
      finally {
        setContractLoading(false);
      }
    };
    fetchUserAndContract();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, insuranceId]);

  // Deploy or set existing contract
  const handleDeployOrSet = async () => {
    if (!userId) return toast({ title: "Not logged in", description: "Missing user id", variant: "destructive" });
    if (!userWallet) return toast({ title: "No wallet on profile", description: "Add your wallet to profile first.", variant: "destructive" });
    setLoadingWeb3(true);
    try {
      // Enforce single contract per wallet: check backend first
      try {
        const chk = await fetch(`${api}/web3/contracts/by-wallet/${encodeURIComponent(userWallet)}`);
        if (chk.ok) {
          const jc = await chk.json();
          const addr = jc?.contract?.validate_contract;
          if (addr) {
            setContractAddress(addr);
            setOpenDeploy(false);
            toast({ title: "Validation Contract", description: `Using ${addr}` });
            return;
          }
        }
      } catch {}

      let deployedAddress = "";
      // Deploy
      if (!hasContractArtifacts()) {
        toast({ title: "Missing artifacts", description: "ABI/Bytecode not set in documentValidationBounty.ts", variant: "destructive" });
        return;
      }
      const { ethers } = await import("ethers");
      // @ts-ignore
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      // Ensure wallet access
      try { await provider.send("eth_requestAccounts", []); } catch { throw new Error("Wallet access rejected"); }
      // Ensure on Polygon Amoy (testnet) or Polygon mainnet
      const targetChains = new Set([0x13882, 0x89]);
      let network = await provider.getNetwork();
      if (!targetChains.has(Number(network.chainId))) {
        try {
          await (window as any).ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: "0x13882" }] });
          network = await provider.getNetwork();
        } catch (switchErr: any) {
          // Try add Amoy
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
      const factory = new ethers.ContractFactory(CONTRACT_ABI, CONTRACT_BYTECODE, signer);
      // Estimate gas and deploy with explicit gasLimit to avoid RPC errors
      const deployTx = await factory.getDeployTransaction();
      const gasLimit = await signer.estimateGas(deployTx as any).catch(() => undefined);
      if (!gasLimit) throw new Error("Gas estimation failed. Ensure you have POL and correct network.");
      const contract = await factory.deploy({ gasLimit } as any);
      await contract.waitForDeployment();
      deployedAddress = await contract.getAddress();

      // Persist once via unified contracts upsert (validate_contract)
      try {
        const resp = await fetch(`${api}/web3/contracts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, wallet_address: userWallet, validate_contract: deployedAddress })
        });
        if (!resp.ok) {
          const j = await resp.json().catch(() => ({} as any));
          console.warn("save_contract failed", j);
          toast({ title: "Saved locally only", description: `Deploy succeeded (${deployedAddress}) but backend save failed. You can still use this contract.`, variant: "destructive" });
        }
      } catch (err) {
        console.warn("save_contract error", err);
        toast({ title: "Saved locally only", description: `Deploy succeeded (${deployedAddress}) but backend save failed.`, variant: "destructive" });
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

  const handleOpenCreateTask = async () => {
    const ids = Object.keys(selected).filter((k) => selected[Number(k)]).map(Number);
    if (ids.length === 0) return toast({ title: "No selection", description: "Select one or more rows to create tasks.", variant: "destructive" });
    if (!contractAddress) return toast({ title: "No contract", description: "Deploy or set a contract first.", variant: "destructive" });
    const rows = unassignedItems.filter((i) => ids.includes(i.claim_id));
    if (rows.length === 0) return toast({ title: "Invalid selection", description: "Rows not found", variant: "destructive" });
    setBatchDocs(rows.map(r => ({ claim_id: r.claim_id, docCid: r.report_url })));
    if (rows.length === 1) {
      setSelectedDocCid(rows[0].report_url || "");
      setSelectedClaimId(rows[0].claim_id || null);
    } else {
      setSelectedDocCid("");
      setSelectedClaimId(null);
    }
    setOpenTask(true);
    // Try estimate gas once for user info
    try {
      setEstimatingGas(true);
      const sampleDoc = (rows[0]?.report_url || "");
      if (!sampleDoc) return;
      const { ethers } = await import("ethers");
      // @ts-ignore
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress!, CONTRACT_ABI, signer);
      // value based on current rewardPol input (default 0)
      const valueWei = (() => { try { return ethers.parseEther((rewardPol || "0").toString()); } catch { return BigInt(0); } })();
      const est = await contract.createTask.estimateGas(sampleDoc, BigInt(Math.max(1, requiredValidators || 1)), { value: valueWei });
      const feeData = await provider.getFeeData();
      const gp = (feeData.maxFeePerGas || feeData.gasPrice || BigInt(0));
      setEstGasPerTaskWei(est);
      setEstGasPriceWei(gp);
    } catch {
      setEstGasPerTaskWei(null);
      setEstGasPriceWei(null);
    } finally {
      setEstimatingGas(false);
    }
  };

  const handleCreateTask = async () => {
    if (!userId) return toast({ title: "Not logged in", description: "Missing user id", variant: "destructive" });
    if (!contractAddress) return toast({ title: "No contract", description: "Deploy or set a contract first.", variant: "destructive" });
    const count = batchDocs.length > 0 ? batchDocs.length : (selectedDocCid ? 1 : 0);
    if (count === 0 || requiredValidators <= 0) return toast({ title: "Missing fields", description: "Provide validators and select at least one document.", variant: "destructive" });
    // Enforce positive reward to avoid contract reverts on payable function
    try {
      const testReward = (await import("ethers")).ethers.parseEther((rewardPol || "0").toString());
      if (testReward <= BigInt(0)) {
        return toast({ title: "Reward must be > 0", description: "Enter a positive POL amount for the bounty.", variant: "destructive" });
      }
    } catch {
      return toast({ title: "Invalid reward", description: "Enter a valid number for POL amount.", variant: "destructive" });
    }
    setLoadingWeb3(true);
    setBatchProgress({ done: 0, total: count });
    try {
      const { ethers } = await import("ethers");
      // @ts-ignore
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      // Ensure wallet access and correct chain before proceeding
      try { await provider.send("eth_requestAccounts", []); } catch { throw new Error("Wallet access rejected"); }
      const targetChains = new Set([0x13882, 0x89]);
      let network = await provider.getNetwork();
      if (!targetChains.has(Number(network.chainId))) {
        try {
          await (window as any).ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: "0x13882" }] });
          network = await provider.getNetwork();
        } catch (switchErr: any) {
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
      if (!Array.isArray(CONTRACT_ABI) || CONTRACT_ABI.length === 0) {
        toast({ title: "ABI missing", description: "Set ABI in documentValidationBounty.ts", variant: "destructive" });
        return;
      }
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
      const docsToCreate: Array<{ claim_id: number | null; docCid: string }> = batchDocs.length > 0
        ? batchDocs.map(d => ({ claim_id: d.claim_id, docCid: d.docCid }))
        : [{ claim_id: selectedClaimId, docCid: selectedDocCid }];
      const rewardWeiPerTask = (() => { try { return ethers.parseEther((rewardPol || "0").toString()); } catch { throw new Error("Invalid reward amount"); } })();

      const successes: Array<{ taskId: number; claim_id: number | null; docCid: string; txHash: string; rewardWei: bigint }> = [];
      const failures: Array<{ claim_id: number | null; docCid: string; error: string }> = [];

      for (let i = 0; i < docsToCreate.length; i++) {
        const entry = docsToCreate[i];
        try {
          // Preflight and gas estimate
          await contract.createTask.staticCall(entry.docCid, BigInt(requiredValidators), { value: rewardWeiPerTask });
          const gasEst = await contract.createTask.estimateGas(entry.docCid, BigInt(requiredValidators), { value: rewardWeiPerTask });
          // Send with explicit gasLimit
          const tx = await contract.createTask(entry.docCid, BigInt(requiredValidators), { value: rewardWeiPerTask, gasLimit: gasEst });
          const rc = await tx.wait();
          let onchainTaskId: number | null = null;
          try {
            for (const lg of rc.logs || []) {
              try {
                const parsed = contract.interface.parseLog({ topics: lg.topics, data: lg.data });
                if (parsed?.name === "TaskCreated") {
                  onchainTaskId = Number(parsed.args?.taskId);
                  break;
                }
              } catch {}
            }
          } catch {}
          if (onchainTaskId == null) {
            try { const next = await contract.nextTaskId(); onchainTaskId = Number(next) - 1; } catch {}
          }
          const finalTaskId = onchainTaskId ?? -1;
          successes.push({ taskId: finalTaskId, claim_id: entry.claim_id, docCid: entry.docCid, txHash: tx.hash, rewardWei: rewardWeiPerTask });
          // Persist each
          try {
            const persist = await fetch(`${api}/web3/tasks`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: 'include',
              body: JSON.stringify({
                user_id: userId,
                contract_address: contractAddress,
                task_id: finalTaskId,
                doc_cid: entry.docCid,
                required_validators: requiredValidators,
                // send POL as string for NUMERIC(36,18)
                reward_pol: rewardPol || "0",
                tx_hash: tx.hash,
                claim_id: entry.claim_id,
                status: "pending",
              })
            });
            if (!persist.ok) console.warn("save_task failed for", finalTaskId, entry);
          } catch (perr) {
            console.warn("save_task error", perr);
          }
        } catch (err: any) {
          const inner = (err?.info?.error || err?.error || err?.data || {}) as any;
          const innerMsg = inner?.message || inner?.data || inner?.reason;
          const msg = innerMsg || err?.shortMessage || err?.reason || err?.message || "Error";
          failures.push({ claim_id: entry.claim_id, docCid: entry.docCid, error: msg });
        } finally {
          setBatchProgress((p) => ({ done: p.done + 1, total: p.total }));
        }
      }

      // Final toasts
      if (successes.length) {
        const ids = successes.map(s => s.taskId).filter((x) => x != null).join(", ");
        toast({ title: `Created ${successes.length} task(s)`, description: `Task IDs: ${ids}` });
      }
      if (failures.length) {
        toast({ title: `${failures.length} task(s) failed`, description: `Check console for details`, variant: "destructive" });
      }
      setOpenTask(false);
    } catch (e: any) {
      console.error(e);
      let desc = e?.message || "Error";
      const info = (e?.info || {}) as any;
      const errObj = info?.error || e?.error || {};
      if (errObj?.message && !desc.includes(errObj.message)) desc = `${desc} — ${errObj.message}`;
      toast({ title: "Create tasks failed", description: desc, variant: "destructive" });
    } finally {
      setLoadingWeb3(false);
      setBatchProgress({ done: 0, total: 0 });
      setBatchDocs([]);
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

  const displayItems: (ClaimItem | QueueItem)[] = viewMode === 'unassigned' ? unassignedItems : queueItems;
  const loading = viewMode === 'unassigned' ? loadingUnassigned : loadingQueue;
  const allOnPageChecked = viewMode === 'unassigned' && unassignedItems.length > 0 && unassignedItems.every((i) => selected[i.claim_id]);

  const handleToggleAll = (checked: boolean) => {
    if (viewMode !== 'unassigned') return; // only applicable for selection in unassigned view
    const pageIds = unassignedItems.map((i) => i.claim_id);
    const next: Record<number, boolean> = { ...selected };
    pageIds.forEach((id) => (next[id] = checked));
    setSelected(next);
  };

  const handleToggle = (id: number, checked: boolean) => setSelected((s) => ({ ...s, [id]: checked }));

  // Inline fee and gas summary component for the Create Task modal
  const FeeSummary = () => {
    const gasUnits = estGasPerTaskWei;
    const gasPrice = estGasPriceWei;
    const reward = parseFloat(rewardPol || "0");

    const fmtPol = (wei: bigint) => {
      const s = wei.toString();
      const pad = s.padStart(19, '0');
      const intPart = pad.slice(0, pad.length - 18).replace(/^0+/, '') || '0';
      const fracPart = pad.slice(-18).replace(/0+$/, '');
      return fracPart ? `${intPart}.${fracPart}` : intPart;
    };

    let feePolStr = "-";
    let gasPriceGweiStr = "-";
    if (gasUnits != null && gasPrice != null) {
      try {
        const totalWei = gasUnits * gasPrice; // BigInt * BigInt
        feePolStr = `${fmtPol(totalWei)} POL`;
        gasPriceGweiStr = `${(Number(gasPrice) / 1e9).toFixed(2)} gwei`;
      } catch {}
    }

    const platformFee = ((reward || 0) * platformFeeBps) / 10000;
    const validatorsShare = Math.max(0, (reward || 0) - platformFee);

    return (
      <div className="text-xs text-muted-foreground space-y-1">
        {estimatingGas ? (
          <div>Estimating gas...</div>
        ) : (
          <>
            <div>Estimated gas per task: {gasUnits != null ? gasUnits.toString() : '-'}</div>
            <div>Gas price: {gasPriceGweiStr}</div>
            <div>Est. network fee per task: {feePolStr}</div>
          </>
        )}
        <div>Reward per task: {Number.isFinite(reward) ? reward : 0} POL</div>
        <div>Platform fee (10%): {platformFee.toFixed(6)} POL</div>
        <div>Validators share (~90%): {validatorsShare.toFixed(6)} POL</div>
      </div>
    );
  };

  return (
    <div className="max-w-full">
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle>Validate Documents</CardTitle>
          <CardDescription>
            {viewMode === 'unassigned' ? 'Manual review queue: pending, external claims bucketed as manual and without tasks.' : 'Verification queue: pending, unverified claims with tasks.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-sm text-muted-foreground">
              Showing {start}-{end} of {currentTotal}
            </div>
            <div className="ml-auto flex items-center gap-2">
              {/* <Select value={viewMode} onValueChange={(v) => { setPage(1); setSelected({}); setViewMode(v as any); }}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="View" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">To Review (no task)</SelectItem>
                  <SelectItem value="queue">Verification Queue</SelectItem>
                </SelectContent>
              </Select> */}
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
                  <Button variant="outline" size="sm" disabled={contractLoading}>
                    {contractLoading ? "Loading..." : (contractAddress ? "Show Validation Contract" : "Setup Validation Contract")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Validation Contract — One-time Setup</DialogTitle>
                    <DialogDescription>
                      Wallet: <span className="font-mono">{userWallet || "unknown"}</span>
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-3 py-2">
                    {!contractAddress && (
                      <div className="text-sm text-muted-foreground space-y-2">
                        <p>
                          This Validation contract escrows your bounty and pays validators when the task is finalized.
                          A 10% platform fee is deducted internally from the bounty at finalize.
                        </p>
                      </div>
                    )}
                    {contractAddress && (
                      <div className="text-xs text-muted-foreground break-all">Current Validation Contract: <span className="font-mono">{contractAddress}</span></div>
                    )}
                    {!contractAddress && (
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={consentChecked} onChange={(e) => setConsentChecked(e.target.checked)} />
                        <span>I understand and agree to deploy this Validation contract for one-time setup.</span>
                      </label>
                    )}
                  </div>
                  <DialogFooter>
                    {!contractAddress ? (
                      <Button onClick={handleDeployOrSet} disabled={loadingWeb3 || !consentChecked}>{loadingWeb3 ? "Deploying..." : "Deploy Contract"}</Button>
                    ) : (
                      <Button type="button" onClick={() => setOpenDeploy(false)}>Close</Button>
                    )}
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="mt-3 rounded-md border border-border overflow-x-auto">
            {viewMode === 'unassigned' ? (
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
                  {!loading && unassignedItems.length === 0 && (
                    <tr><td colSpan={7} className="p-3 text-muted-foreground">No records</td></tr>
                  )}
                  {!loading && unassignedItems.map((r, idx) => {
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
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-foreground/5 text-xs">
                  <tr>
                    <th className="p-2 text-left">S.No.</th>
                    <th className="p-2 text-left">Patient</th>
                    <th className="p-2 text-left">Report URL</th>
                    <th className="p-2 text-left">Task ID</th>
                    <th className="p-2 text-left">Task Status</th>
                    <th className="p-2 text-left">Contract</th>
                    <th className="p-2 text-left">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr><td colSpan={7} className="p-3">Loading...</td></tr>
                  )}
                  {!loading && queueItems.length === 0 && (
                    <tr><td colSpan={7} className="p-3 text-muted-foreground">No records</td></tr>
                  )}
                  {!loading && queueItems.map((r, idx) => (
                    <tr key={r.claim_id} className={`${idx % 2 ? "bg-foreground/5/20" : ""} hover:bg-foreground/5`}>
                      <td className="p-2 align-top">{(page - 1) * pageSize + idx + 1}</td>
                      <td className="p-2 align-top">{patientNames[r.patient_id] ?? `Patient #${r.patient_id}`}</td>
                      <td className="p-2 align-top"><a href={r.report_url} target="_blank" className="text-primary underline">Open</a></td>
                      <td className="p-2 align-top">{r.task_id}</td>
                      <td className="p-2 align-top"><Badge variant="outline">{r.status ?? '-'}</Badge></td>
                      <td className="p-2 align-top"><span className="font-mono text-xs break-all">{r.contract_address}</span></td>
                      <td className="p-2 align-top whitespace-nowrap">{new Date(r.created_at).toLocaleString("en-US")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
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

            {viewMode === 'unassigned' ? (
              <div className="ml-auto flex flex-wrap items-center gap-2">
                <Button onClick={handleOpenCreateTask} disabled={loading || !contractAddress}>Create Task</Button>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Create Task Modal */}
      <Dialog open={openTask} onOpenChange={setOpenTask}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>{batchDocs.length > 1 ? `Create ${batchDocs.length} Validation Tasks` : 'Create Validation Task'}</DialogTitle>
            <DialogDescription>
              Platform fee: 10% of each task's reward pool is taken by the contract at finalize and paid to the platform.
              You fund the full reward now; validators share 90% equally on finalize.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            {batchDocs.length <= 1 ? (
              <div className="grid gap-1">
                <Label>Document CID / URL</Label>
                <Input value={selectedDocCid} onChange={(e) => setSelectedDocCid(e.target.value)} placeholder="ipfs://... or https://..." />
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                <div>Selected documents: {batchDocs.length}</div>
                <div className="mt-1 max-h-24 overflow-auto text-xs break-all border rounded p-2">
                  {batchDocs.slice(0, 5).map((d) => (<div key={d.claim_id}>{d.docCid}</div>))}
                  {batchDocs.length > 5 && <div>...and {batchDocs.length - 5} more</div>}
                </div>
              </div>
            )}
            <div className="grid gap-1">
              <Label>Required Validators</Label>
              <Input type="number" min={1} value={requiredValidators} onChange={(e) => setRequiredValidators(Number(e.target.value))} />
            </div>
            <div className="grid gap-1">
              <Label>Reward per Task (POL) — platform takes 10% on finalize</Label>
              <Input type="number" min={0} step="0.0001" value={rewardPol} onChange={(e) => setRewardPol(e.target.value)} />
              <FeeSummary />
            </div>
            <div className="text-xs text-muted-foreground">Contract ABI loaded from <code>lib/contracts/documentValidationBounty.ts</code>.</div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateTask} disabled={loadingWeb3 || !contractAddress}>
              {loadingWeb3
                ? (batchDocs.length > 1
                    ? `Creating ${batchProgress.done}/${batchProgress.total}...`
                    : "Creating...")
                : (batchDocs.length > 1 ? `Create ${batchDocs.length} Tasks` : 'Create Task')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
