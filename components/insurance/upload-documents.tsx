"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { config } from "@/lib/config";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AI_PAYMENT_ABI, AI_PAYMENT_BYTECODE } from "@/lib/contracts/ai_payment_contract";

export type UploadDocumentsProps = { insuranceId: number };

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

type PaginatedClaimsResponse = {
  items: ClaimItem[];
  total: number;
  page: number;
  page_size: number;
};

type Thresholds = {
  insurance_id: number;
  auto_approval_threshold: number | null;
  manual_review_threshold: number | null;
  rejection_threshold: number | null;
};

export default function UploadDocuments({ insuranceId }: UploadDocumentsProps) {
  const api = useMemo(() => (config.apiBaseUrl || "http://127.0.0.1:8000") + "/api", []);
  const { toast } = useToast();

  // data
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ClaimItem[]>([]);
  const [total, setTotal] = useState(0);

  // filters/pagination
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // thresholds
  const [thresholds, setThresholds] = useState<Thresholds | null>(null);

  // selection and AI scores
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [aiScores, setAiScores] = useState<Record<number, number>>({});
  const [patientNames, setPatientNames] = useState<Record<number, string>>({});
  const [bucketFilter, setBucketFilter] = useState<"all" | "auto" | "manual" | "reject">("all");

  // web3 + contract setup state
  const [userId, setUserId] = useState<number | null>(null);
  const [userWallet, setUserWallet] = useState<string | null>(null);
  const [aiContractAddress, setAiContractAddress] = useState<string | null>(null);
  const [openDeploy, setOpenDeploy] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [loadingWeb3, setLoadingWeb3] = useState(false);

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);

  useEffect(() => {
    // fetch thresholds
    const loadThresholds = async () => {
      try {
        const res = await fetch(`${api}/insurance/contact-tech/${insuranceId}`);
        if (res.ok) {
          const j: Thresholds = await res.json();
          setThresholds(j);
        }
      } catch (e) {
        console.error("threshold fetch failed", e);
      }
    };

    if (insuranceId) loadThresholds();
  }, [api, insuranceId]);

  // Deploy or set AI Payment contract (only once per insurance wallet)
  const handleDeployAIContract = async () => {
    if (!userId) return toast({ title: "Not logged in", description: "Missing user id", variant: "destructive" });
    if (!userWallet) return toast({ title: "No wallet on profile", description: "Add your wallet to profile first.", variant: "destructive" });
    setLoadingWeb3(true);
    try {
      // short-circuit if contract already exists
      try {
        const chk = await fetch(`${api}/web3/contracts/by-wallet/${encodeURIComponent(userWallet)}`);
        if (chk.ok) {
          const jc = await chk.json();
          const addr = jc?.contract?.ai_contract;
          if (addr) {
            setAiContractAddress(addr);
            setOpenDeploy(false);
            toast({ title: "AI Contract", description: `Using ${addr}` });
            return;
          }
        }
      } catch {}

      let deployedAddress = "";
      {
        if (!Array.isArray(AI_PAYMENT_ABI) || AI_PAYMENT_ABI.length === 0 || typeof AI_PAYMENT_BYTECODE !== "string" || AI_PAYMENT_BYTECODE.length < 10) {
          toast({ title: "Missing artifacts", description: "Set ABI/Bytecode in ai_payment_contract.ts", variant: "destructive" });
          return;
        }
        const { ethers } = await import("ethers");
        // @ts-ignore
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        // Ensure wallet access
        try { await provider.send("eth_requestAccounts", []); } catch (reqErr) {
          throw new Error("Wallet access rejected");
        }
        // Ensure on Polygon Amoy (testnet) or Polygon mainnet
        const targetChains = new Set([0x13882, 0x89]); // Amoy, Mainnet
        let network = await provider.getNetwork();
        if (!targetChains.has(Number(network.chainId))) {
          try {
            await (window as any).ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: "0x13882" }], // default to Amoy
            });
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
        const factory = new ethers.ContractFactory(AI_PAYMENT_ABI as any, AI_PAYMENT_BYTECODE, signer);
        // Build deploy tx and estimate gas via signer
        const deployTx = await factory.getDeployTransaction();
        const gasLimit = await signer.estimateGas(deployTx as any).catch(() => undefined);
        if (!gasLimit) throw new Error("Gas estimation failed. Ensure you have test POL and correct network.");
        // Simple balance preflight
        const fromAddr = await signer.getAddress();
        const balance = await provider.getBalance(fromAddr);
        if (String(balance) === "0") throw new Error("Insufficient POL to pay gas");
        // Deploy with explicit gasLimit only (let wallet fill fees)
        try {
          const contract = await factory.deploy({ gasLimit } as any);
          await contract.waitForDeployment();
          deployedAddress = await contract.getAddress();
        } catch (e: any) {
          // Fallback: construct raw tx with explicit EIP-1559 fees to avoid -32603 from some RPCs
          const fee = await provider.getFeeData();
          const maxFeePerGas = fee.maxFeePerGas ? (fee.maxFeePerGas * BigInt(120)) / BigInt(100) : undefined;
          const maxPriorityFeePerGas = fee.maxPriorityFeePerGas ? (fee.maxPriorityFeePerGas * BigInt(120)) / BigInt(100) : undefined;
          const bufferedGas = gasLimit ? (gasLimit * BigInt(120)) / BigInt(100) : undefined;
          const deployTx = await factory.getDeployTransaction();
          const raw = {
            data: deployTx.data,
            gasLimit: bufferedGas ?? gasLimit,
            ...(maxFeePerGas ? { maxFeePerGas } : {}),
            ...(maxPriorityFeePerGas ? { maxPriorityFeePerGas } : {}),
          } as any;
          const sent = await signer.sendTransaction(raw);
          const rec = await sent.wait();
          if (!rec?.contractAddress) throw e;
          deployedAddress = rec.contractAddress;
        }

        // Persist once via unified contracts endpoint (upsert ai_contract)
        const r2 = await fetch(`${api}/web3/contracts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, wallet_address: userWallet, ai_contract: deployedAddress })
        });
        if (!r2.ok) {
          const j = await r2.json().catch(() => ({} as any));
          throw new Error(j?.detail || "save_ai_contract failed");
        }
      }
      setAiContractAddress(deployedAddress);
      setOpenDeploy(false);
      toast({ title: "AI Contract ready", description: `Using ${deployedAddress}` });
    } catch (e: any) {
      console.error(e);
      toast({ title: "Contract setup failed", description: e?.message || "Error", variant: "destructive" });
    } finally {
      setLoadingWeb3(false);
    }
  };

  // Resolve user_id and wallet + try fetch existing AI contract address
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
      let resolvedWallet: string | null = null;
      try {
        // fetch wallet from users table
        if (!Number.isNaN(uid)) {
          const u = await fetch(`${api}/users/${uid}`);
          if (u.ok) {
            const ju = await u.json();
            resolvedWallet = (ju?.wallet_address || "").trim() || null;
            setUserWallet(resolvedWallet);
          }
        }
      } catch {}
      // Resolve existing AI contract from unified by-wallet lookup only (use freshly fetched wallet if available)
      try {
        const w = resolvedWallet || userWallet;
        if (w) {
          const r2 = await fetch(`${api}/web3/contracts/by-wallet/${encodeURIComponent(w)}`);
          if (r2.ok) {
            const j2 = await r2.json();
            const addr = j2?.contract?.ai_contract || null;
            if (addr) setAiContractAddress(addr);
          }
        }
      } catch {}
    };
    fetchUserAndContract();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, insuranceId]);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
      if (search.trim()) params.set("search", search.trim());
      const res = await fetch(`${api}/claims/unverified-external/by-insurance/${insuranceId}?${params.toString()}`);
      if (!res.ok) throw new Error(`fetch failed ${res.status}`);
      const j: PaginatedClaimsResponse = await res.json();
      setItems(j.items || []);
      setTotal(j.total || 0);
      // clear selection for non-visible
      setSelected({});
      // prefetch patient names for current page
      prefetchPatientNames(j.items || []);
      // preload existing AI evaluations for current page
      await loadAIEvals(j.items || []);
    } catch (e) {
      console.error(e);
      toast({ title: "Could not load claims", description: "Please retry in a moment.", /* neutral styling */ variant: "default", className: "bg-muted text-foreground" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!insuranceId) return;
    fetchClaims();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [insuranceId, page, pageSize, search]);

  // hoisted bucket helper so it's available before useMemo below
  function bucket(score: number | undefined) {
    if (!thresholds || score == null) return "unscored" as const;
    const { auto_approval_threshold: autoT, manual_review_threshold: manualT, rejection_threshold: rejectT } = thresholds;
    // Treat undefined thresholds safely; fall back to typical ordering: reject < manual < auto.
    const r = rejectT ?? 30;
    const m = manualT ?? 60;
    const a = autoT ?? 80;
    if (score >= a) return "auto" as const;
    if (score < r) return "reject" as const;
    if (score >= r && score < m) return "manual" as const;
    return "manual" as const; // between manual and auto -> manual
  }

  // filter rows per selected bucket (placed before references)
  const filteredItems = useMemo(() => {
    if (bucketFilter === "all") return items;
    return items.filter((r) => {
      const s = aiScores[r.claim_id];
      const b = bucket(s);
      return b === bucketFilter;
    });
  }, [items, aiScores, bucketFilter, thresholds]);

  const handleToggleAll = (checked: boolean) => {
    const pageIds = filteredItems.map((i) => i.claim_id);
    const next: Record<number, boolean> = { ...selected };
    pageIds.forEach((id) => (next[id] = checked));
    setSelected(next);
  };

  const handleToggle = (id: number, checked: boolean) => setSelected((s) => ({ ...s, [id]: checked }));

  // Load AI evals for current rows from backend so refresh preserves scores
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

  const generateScores = async () => {
    // Require AI payment contract once
    if (!aiContractAddress) {
      setOpenDeploy(true);
      toast({ title: "AI Contract required", description: "Please deploy the AI Payment contract once before generating scores.", variant: "default", className: "bg-muted text-foreground" });
      return;
    }
    const selIds = Object.entries(selected).filter(([, v]) => v).map(([k]) => Number(k));
    if (selIds.length === 0) {
      toast({ title: "Select claims first", description: "Pick one or more rows to score.", variant: "default", className: "bg-muted text-foreground" });
      return;
    }
    // Only generate for claims that don't already have a saved score
    const toGenerate = selIds.filter((id) => aiScores[id] == null);
    if (toGenerate.length === 0) {
      toast({ title: "Already scored", description: "Selected claims already have AI scores.", variant: "default", className: "bg-muted text-foreground" });
      return;
    }

    // 1) Enforce payment to issuers via AI contract (batch)
    try {
      // Build issuer wallets, userIds and pre-check payment existence
      const issuerUsers: Record<number, { user_id: number; wallet: string }> = {};
      const toCheck: Array<{ claimId: number; issuerUserId: number }> = [];
      for (const id of toGenerate) {
        const claim = items.find((i) => i.claim_id === id);
        const issuerId = claim?.issued_by;
        if (!issuerId) throw new Error(`Claim ${id} missing issuer (issued_by)`);
        const r = await fetch(`${api}/issuer/${issuerId}/wallet`);
        if (!r.ok) throw new Error(`Issuer wallet lookup failed for ${issuerId}`);
        const jw = await r.json();
        const wallet = (jw.wallet_address || "").trim();
        if (!wallet) throw new Error(`Issuer ${issuerId} has no wallet`);
        issuerUsers[issuerId] = { user_id: jw.user_id, wallet };
        toCheck.push({ claimId: id, issuerUserId: jw.user_id });
      }

      // Check existing payments for these claimIds
      const existenceReq = {
        queries: toCheck.map((e) => ({ sender_user_id: userId!, receiver_user_id: e.issuerUserId, claim_id: e.claimId, payment_type: "ai_score" })),
      };
      const exRes = await fetch(`${api}/payments/existence`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(existenceReq) });
      if (!exRes.ok) throw new Error("payment existence check failed");
      const exJson = await exRes.json();
      const unpaidClaims: number[] = [];
      for (const row of exJson.items as Array<{ claim_id: number; exists: boolean; receiver_user_id: number }>) {
        if (!row.exists) unpaidClaims.push(row.claim_id);
      }

      // If some claims are unpaid, pay only those
      if (unpaidClaims.length > 0) {
        const { ethers } = await import("ethers");
        // @ts-ignore
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        try { await provider.send("eth_requestAccounts", []); } catch { throw new Error("Wallet access rejected"); }
        const targetChains = new Set([0x13882, 0x89]);
        let network = await provider.getNetwork();
        if (!targetChains.has(Number(network.chainId))) {
          try {
            await (window as any).ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: "0x13882" }] });
            network = await provider.getNetwork();
          } catch {}
        }
        const signer = await provider.getSigner();
        const fromAddr = await signer.getAddress();
        const contract = new ethers.Contract(aiContractAddress, AI_PAYMENT_ABI as any, signer);
        const price: bigint = await contract.PRICE();
        const issuers: string[] = [];
        const refs: string[] = [];
        for (const id of unpaidClaims) {
          const claim = items.find((i) => i.claim_id === id)!;
          const issuerId = claim.issued_by as number;
          issuers.push(issuerUsers[issuerId].wallet);
          refs.push(ethers.encodeBytes32String(`claim:${id}`));
        }
        const totalValue = price * BigInt(unpaidClaims.length);
        // Provide an explicit gasLimit to bypass MetaMask/provider estimation (-32603)
        // This should be safely high for small batches; wallet will handle fees.
        const tx = await contract.payMany(issuers, refs, { value: totalValue, gasLimit: 800000 } as any);
        const receipt = await tx.wait();
        const txHash: string = tx.hash || receipt?.hash;

        // Record payments with claim_id
        const amountPolEach = Number(ethers.formatEther(price));
        const payments = unpaidClaims.map((id, idx) => {
          const claim = items.find((i) => i.claim_id === id)!;
          const issuerId = claim.issued_by as number;
          const rec = issuerUsers[issuerId];
          return {
            sender_user_id: userId,
            receiver_user_id: rec.user_id,
            sender_wallet: fromAddr,
            receiver_wallet: rec.wallet,
            amount_pol: amountPolEach,
            tx_hash: txHash,
            payment_type: "ai_score",
            claim_id: id,
            task_id: null,
          };
        });
        const pr = await fetch(`${api}/payments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ payments }) });
        if (!pr.ok) throw new Error("payment record failed");
      }

      // Re-check to ensure all toGenerate are now paid
      const finalCheckReq = {
        queries: toGenerate.map((id) => {
          const claim = items.find((i) => i.claim_id === id)!;
          const issuerId = claim.issued_by as number;
          return { sender_user_id: userId!, receiver_user_id: issuerUsers[issuerId].user_id, claim_id: id, payment_type: "ai_score" };
        }),
      };
      const fc = await fetch(`${api}/payments/existence`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(finalCheckReq) });
      if (!fc.ok) throw new Error("final payment check failed");
      const fcj = await fc.json();
      const unpaidLeft = (fcj.items as any[]).filter((r) => !r.exists).map((r) => r.claim_id);
      if (unpaidLeft.length > 0) {
        throw new Error(`Payment missing for claims: ${unpaidLeft.join(", ")}`);
      }
    } catch (e: any) {
      console.error("payment step failed", e);
      toast({ title: "Payment required", description: e?.message || "On-chain payment failed.", variant: "destructive" });
      return;
    }

    // 3) Proceed to generate scores and persist
    const next: Record<number, number> = { ...aiScores };
    toGenerate.forEach((id) => (next[id] = Math.floor(Math.random() * 101)));
    setAiScores(next);
    try {
      const evaluations = toGenerate.map((id) => {
        const claim = items.find((i) => i.claim_id === id);
        const b = bucket(next[id]);
        return {
          claim_id: id,
          report_type: undefined,
          document_url: claim?.report_url,
          ai_score: next[id],
          bucket: b === "unscored" ? undefined : b,
        };
      });
      const res = await fetch(`${api}/claims/ai-evaluations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ evaluations }),
      });
      if (!res.ok) throw new Error("persist failed");
      toast({ title: "AI scores saved", description: `Generated and saved for ${toGenerate.length} claim(s).` });
    } catch (e) {
      console.error(e);
      toast({ title: "Save failed", description: "Scores generated locally but not saved.", variant: "destructive" });
    }
  };

  // bucket defined above as a function declaration

  const approveSelected = async () => {
    const ids = Object.entries(selected).filter(([, v]) => v).map(([k]) => Number(k));
    if (ids.length === 0) return toast({ title: "No selection", description: "Select claims to approve.", variant: "destructive" });
    try {
      const res = await fetch(`${api}/claims/bulk-set-verified`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim_ids: ids }),
      });
      if (!res.ok) throw new Error("approve failed");
      toast({ title: "Marked Verified", description: `Set verified for ${ids.length} claim(s)` });
      fetchClaims();
    } catch (e) {
      console.error(e);
      toast({ title: "Verification update failed", description: "Please try again.", variant: "destructive" });
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

  // Helpers used by Apply button for bucket actions
  const approveIds = async (ids: number[]) => {
    try {
      const res = await fetch(`${api}/claims/bulk-set-verified`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim_ids: ids }),
      });
      if (!res.ok) throw new Error("approve failed");
      toast({ title: "Marked Verified", description: `Set verified for ${ids.length} claim(s)` });
      fetchClaims();
    } catch (e) {
      console.error(e);
      toast({ title: "Verification update failed", description: "Please try again.", variant: "destructive" });
    }
  };

  const rejectIds = async (ids: number[]) => {
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

const allOnPageChecked = filteredItems.length > 0 && filteredItems.every((i) => selected[i.claim_id]);

// Apply action according to bucket filter
const applyBucketAction = async () => {
  if (bucketFilter === "all") {
    toast({ title: "Choose a bucket", description: "Select Auto, Manual, or Reject.", variant: "default", className: "bg-muted text-foreground" });
    return;
  }
  const ids = filteredItems.map((r) => r.claim_id);
  if (!ids.length) {
    toast({ title: "No items", description: "No claims in this bucket on this page.", variant: "default", className: "bg-muted text-foreground" });
    return;
  }
  if (bucketFilter === "auto") {
    await approveIds(ids);
    return;
  }
  if (bucketFilter === "reject") {
    await rejectIds(ids);
    return;
  }
  // manual bucket: inform only
  toast({ title: "Manual review", description: `${ids.length} claim(s) flagged for manual review.`, variant: "default", className: "bg-muted text-foreground" });
};

  // --- Patient name helpers ---
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

  return (
    <div className="max-w-full">
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle>Upload & Verify External Claims</CardTitle>
          <CardDescription>
            Documents not issued on this platform. Generate AI score (0-100), compare with thresholds, and take action.
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
                <Button variant="outline" size="sm">{aiContractAddress ? "Show AI Contract" : "Setup AI Contract"}</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>AI Payment Contract — One-time Setup</DialogTitle>
                  <DialogDescription>
                    Wallet: <span className="font-mono">{userWallet || "unknown"}</span>
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 py-2">
                  {!aiContractAddress && (
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p>
                        This AI Payment contract processes document issuer payments when you generate AI scores for external reports.
                        Each payment is 1.00 POL per document: 0.90 POL goes to the issuer, and 0.10 POL goes to the platform as a fee.
                      </p>
                      <p>
                        Deploy this once for your wallet and reuse it for future AI score payments.
                      </p>
                    </div>
                  )}
                  {aiContractAddress && (
                    <div className="text-xs text-muted-foreground break-all">
                      Current AI Contract: <span className="font-mono">{aiContractAddress}</span>
                    </div>
                  )}
                  {!aiContractAddress && (
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={consentChecked} onChange={(e) => setConsentChecked(e.target.checked)} />
                      <span>I understand and agree to deploy this AI Payment contract for one-time setup.</span>
                    </label>
                  )}
                </div>
                <DialogFooter>
                  {!aiContractAddress ? (
                    <Button onClick={handleDeployAIContract} disabled={loadingWeb3 || !consentChecked}>{loadingWeb3 ? "Deploying..." : "Deploy Contract"}</Button>
                  ) : (
                    <Button type="button" onClick={() => setOpenDeploy(false)}>Close</Button>
                  )}
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
                {!loading && filteredItems.map((r, idx) => {
                  const score = aiScores[r.claim_id];
                  const b = bucket(score);
                  const name = patientNames[r.patient_id] ?? `Patient #${r.patient_id}`;
                  return (
                    <tr key={r.claim_id} className={`${idx % 2 ? "bg-foreground/5/20" : ""} hover:bg-foreground/5`}>
                      <td className="p-2 align-top"><Checkbox checked={!!selected[r.claim_id]} onCheckedChange={(c) => handleToggle(r.claim_id, !!c)} /></td>
                      <td className="p-2 align-top">{(page - 1) * pageSize + idx + 1}</td>
                      <td className="p-2 align-top">{name}</td>
                      <td className="p-2 align-top"><a href={r.report_url} target="_blank" className="text-primary underline">Open</a></td>
                      <td className="p-2 align-top">{score == null ? "-" : score}</td>
                      <td className="p-2 align-top">
                        {score == null ? (
                          <Badge variant="secondary">unscored</Badge>
                        ) : b === "auto" ? (
                          <Badge className="bg-emerald-600 hover:bg-emerald-600">auto</Badge>
                        ) : b === "reject" ? (
                          <Badge variant="destructive">reject</Badge>
                        ) : (
                          <Badge className="bg-amber-500 hover:bg-amber-500">manual</Badge>
                        )}
                      </td>
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
              <Button variant="secondary" onClick={generateScores}>{aiContractAddress ? "Generate AI Scores" : "Generate AI Scores"}</Button>
              <Select value={bucketFilter} onValueChange={(v) => setBucketFilter(v as any)}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="Bucket" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="reject">Reject</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={applyBucketAction} disabled={bucketFilter === "all" || bucketFilter === "manual" || loading}>Apply</Button>
            </div>
          </div>

          {thresholds && (
            <div className="mt-4 text-xs text-muted-foreground">
              Thresholds — Auto: {thresholds.auto_approval_threshold ?? "-"}, Manual: {thresholds.manual_review_threshold ?? "-"}, Reject: {thresholds.rejection_threshold ?? "-"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
