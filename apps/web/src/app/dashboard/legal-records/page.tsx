"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  Save,
  Loader2,
  RefreshCw,
  User,
  ShieldCheck,
  Search,
  RotateCcw,
  AlertTriangle,
  Globe,
  Filter,
  Layers,
  Download,
  FileCheck,
  X,
  FileSpreadsheet,
} from "lucide-react";

type VerificationStatus = "DRAFT" | "NEEDS_REVIEW" | "VERIFIED" | "REJECTED";
type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

interface Clause {
  section: string;
  title: string;
  status: "COMPLIANT" | "REVIEW_REQUIRED" | "NON_COMPLIANT";
  snippet: string;
}

interface DetectedIssue {
  id: string;
  issue: string;
  severity: RiskLevel;
  recommendation: string;
}

interface LegalRecord {
  id: string;
  title: string;
  description: string | null;
  documentType: string;
  jurisdiction: string;
  riskLevel: RiskLevel;
  patientId: string | null;
  status: VerificationStatus;
  reviewerNotes: string | null;
  clauses?: Clause[];
  detectedIssues?: DetectedIssue[];
  createdAt: string;
  updatedAt: string;
  patient?: {
    id: string;
    name: string;
  } | null;
}

const STATUS_CONFIG: Record<
  VerificationStatus,
  { label: string; badgeBg: string; badgeText: string; badgeBorder: string; icon: React.ReactNode }
> = {
  DRAFT: {
    label: "Draft",
    badgeBg: "bg-slate-500/10",
    badgeText: "text-slate-400",
    badgeBorder: "border-slate-500/20",
    icon: <Clock size={13} className="text-slate-400" />,
  },
  NEEDS_REVIEW: {
    label: "Needs Review",
    badgeBg: "bg-amber-500/10",
    badgeText: "text-amber-400",
    badgeBorder: "border-amber-500/20",
    icon: <AlertCircle size={13} className="text-amber-400" />,
  },
  VERIFIED: {
    label: "Verified",
    badgeBg: "bg-emerald-500/10",
    badgeText: "text-emerald-400",
    badgeBorder: "border-emerald-500/20",
    icon: <CheckCircle2 size={13} className="text-emerald-400" />,
  },
  REJECTED: {
    label: "Rejected",
    badgeBg: "bg-rose-500/10",
    badgeText: "text-rose-400",
    badgeBorder: "border-rose-500/20",
    icon: <XCircle size={13} className="text-rose-400" />,
  },
};

const RISK_CONFIG: Record<
  RiskLevel,
  { label: string; badgeBg: string; badgeText: string; badgeBorder: string }
> = {
  LOW: {
    label: "Low Risk",
    badgeBg: "bg-emerald-500/10",
    badgeText: "text-emerald-400",
    badgeBorder: "border-emerald-500/20",
  },
  MEDIUM: {
    label: "Med Risk",
    badgeBg: "bg-amber-500/10",
    badgeText: "text-amber-400",
    badgeBorder: "border-amber-500/20",
  },
  HIGH: {
    label: "High Risk",
    badgeBg: "bg-orange-500/10",
    badgeText: "text-orange-400",
    badgeBorder: "border-orange-500/20",
  },
  CRITICAL: {
    label: "Critical Risk",
    badgeBg: "bg-rose-500/10",
    badgeText: "text-rose-400",
    badgeBorder: "border-rose-500/20",
  },
};

export default function LegalRecordsPage() {
  const [records, setRecords] = useState<LegalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [saveSuccessId, setSaveSuccessId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Active brief modal state
  const [selectedBriefRecord, setSelectedBriefRecord] = useState<LegalRecord | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDocType, setSelectedDocType] = useState("ALL");
  const [selectedJurisdiction, setSelectedJurisdiction] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedRisk, setSelectedRisk] = useState("ALL");

  // Local editing state for status & notes
  const [editingState, setEditingState] = useState<
    Record<string, { status: VerificationStatus; notes: string }>
  >({});

  const fetchRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:4000/api/v1/legal-records");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setRecords(json.data);
        const initEditing: Record<string, { status: VerificationStatus; notes: string }> = {};
        json.data.forEach((rec: LegalRecord) => {
          initEditing[rec.id] = {
            status: rec.status,
            notes: rec.reviewerNotes || "",
          };
        });
        setEditingState(initEditing);
      } else {
        throw new Error(json.error?.message || "Failed to load legal records");
      }
    } catch (err: any) {
      setError(err.message || "Error fetching records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleStatusChange = (id: string, newStatus: VerificationStatus) => {
    setEditingState((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        status: newStatus,
      },
    }));
  };

  const handleNotesChange = (id: string, newNotes: string) => {
    setEditingState((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        notes: newNotes,
      },
    }));
  };

  const handleSaveUpdate = async (id: string) => {
    const edit = editingState[id];
    if (!edit) return;

    setSavingId(id);
    setSaveSuccessId(null);

    try {
      const res = await fetch(`http://localhost:4000/api/v1/legal-records/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: edit.status,
          reviewerNotes: edit.notes,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setRecords((prev) =>
          prev.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: edit.status,
                  reviewerNotes: edit.notes,
                  updatedAt: new Date().toISOString(),
                }
              : r
          )
        );
        if (selectedBriefRecord?.id === id) {
          setSelectedBriefRecord((prev) =>
            prev ? { ...prev, status: edit.status, reviewerNotes: edit.notes } : null
          );
        }
        setSaveSuccessId(id);
        setTimeout(() => setSaveSuccessId(null), 2500);
      } else {
        alert(json.error?.message || "Failed to save record update");
      }
    } catch (err: any) {
      alert("Error saving update: " + err.message);
    } finally {
      setSavingId(null);
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedDocType("ALL");
    setSelectedJurisdiction("ALL");
    setSelectedStatus("ALL");
    setSelectedRisk("ALL");
  };

  // Helper to generate markdown brief text for downloading
  const generateMarkdownBrief = (record: LegalRecord): string => {
    const currentNotes = editingState[record.id]?.notes || record.reviewerNotes || "No notes.";
    const currentStatus = editingState[record.id]?.status || record.status;

    let md = `# TrueState Legal & Compliance Audit Brief\n\n`;
    md += `**Document Title:** ${record.title}\n`;
    md += `**Document ID:** \`${record.id}\`  \n`;
    md += `**Generated Date:** ${new Date().toLocaleDateString()}\n`;
    md += `**Platform Version:** TrueState Clinical AI Integrity Middleware v2.0\n\n`;
    md += `---\n\n`;
    md += `## 1. Executive Summary & Metadata\n\n`;
    md += `| Metadata Field | Value |\n| :--- | :--- |\n`;
    md += `| **Document Type** | ${record.documentType} |\n`;
    md += `| **Jurisdiction / Category** | ${record.jurisdiction} |\n`;
    md += `| **Risk Level** | \`${record.riskLevel}\` |\n`;
    md += `| **Verification Status** | \`${currentStatus}\` |\n`;
    md += `| **Associated Patient** | ${record.patient?.name || "N/A"} |\n\n`;
    md += `---\n\n`;
    md += `## 2. Description & Clinical Scope\n\n${record.description || "No description provided."}\n\n`;
    md += `---\n\n`;

    if (record.clauses && record.clauses.length > 0) {
      md += `## 3. Key Clauses & Audit Verification\n\n`;
      record.clauses.forEach((c) => {
        md += `### ${c.section} — ${c.title}\n`;
        md += `* **Status:** \`${c.status}\`  \n`;
        md += `* **Snippet:** *"${c.snippet}"*\n\n`;
      });
      md += `---\n\n`;
    }

    if (record.detectedIssues && record.detectedIssues.length > 0) {
      md += `## 4. Detected AI Bias & Risk Issues\n\n`;
      record.detectedIssues.forEach((i) => {
        md += `> [!WARNING]\n`;
        md += `> **Issue #${i.id}: ${i.issue}**  \n`;
        md += `> * **Severity:** \`${i.severity}\`  \n`;
        md += `> * **Recommendation:** ${i.recommendation}\n\n`;
      });
      md += `---\n\n`;
    }

    md += `## 5. Reviewer Notes & Governance Log\n\n`;
    md += `\`\`\`text\nREVIEWER NOTES:\n"${currentNotes}"\n\`\`\`\n\n`;
    md += `---\n*Signed by TrueState Algorithmic Audit Engine*\n`;

    return md;
  };

  const handleDownloadBrief = (record: LegalRecord) => {
    const content = generateMarkdownBrief(record);
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `TrueState_Brief_${record.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const availableDocTypes = useMemo(() => {
    const types = new Set(records.map((r) => r.documentType).filter(Boolean));
    return Array.from(types);
  }, [records]);

  const availableJurisdictions = useMemo(() => {
    const jurisdictions = new Set(records.map((r) => r.jurisdiction).filter(Boolean));
    return Array.from(jurisdictions);
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchesTitle = r.title.toLowerCase().includes(q);
        const matchesDesc = r.description?.toLowerCase().includes(q) || false;
        const matchesNotes = r.reviewerNotes?.toLowerCase().includes(q) || false;
        const matchesPatient = r.patient?.name.toLowerCase().includes(q) || false;
        const matchesDocType = r.documentType.toLowerCase().includes(q);
        const matchesJurisdiction = r.jurisdiction.toLowerCase().includes(q);

        if (
          !matchesTitle &&
          !matchesDesc &&
          !matchesNotes &&
          !matchesPatient &&
          !matchesDocType &&
          !matchesJurisdiction
        ) {
          return false;
        }
      }

      if (selectedDocType !== "ALL" && r.documentType !== selectedDocType) {
        return false;
      }

      if (selectedJurisdiction !== "ALL" && r.jurisdiction !== selectedJurisdiction) {
        return false;
      }

      const currentStatus = editingState[r.id]?.status || r.status;
      if (selectedStatus !== "ALL" && currentStatus !== selectedStatus) {
        return false;
      }

      if (selectedRisk !== "ALL" && r.riskLevel !== selectedRisk) {
        return false;
      }

      return true;
    });
  }, [
    records,
    editingState,
    searchQuery,
    selectedDocType,
    selectedJurisdiction,
    selectedStatus,
    selectedRisk,
  ]);

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedDocType !== "ALL" ||
    selectedJurisdiction !== "ALL" ||
    selectedStatus !== "ALL" ||
    selectedRisk !== "ALL";

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="text-emerald-400 shrink-0" size={28} />
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Legal & Compliance Verification
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Filter, search, verify, document audit notes, and generate downloadable review briefs for clinical AI legal records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchRecords}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 text-sm font-medium transition-all cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh Records
          </button>
        </div>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-white/10 backdrop-blur-xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-300 text-sm font-semibold">
            <Filter size={16} className="text-emerald-400" />
            <span>Search & Filter Controls</span>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg border border-emerald-500/20 transition-all font-medium cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/80 border border-white/15 rounded-xl pl-10 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>

          <div>
            <select
              value={selectedDocType}
              onChange={(e) => setSelectedDocType(e.target.value)}
              className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-colors"
            >
              <option value="ALL">All Document Types</option>
              {availableDocTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedJurisdiction}
              onChange={(e) => setSelectedJurisdiction(e.target.value)}
              className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-colors"
            >
              <option value="ALL">All Jurisdictions</option>
              {availableJurisdictions.map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-colors"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="NEEDS_REVIEW">Needs Review</option>
              <option value="VERIFIED">Verified</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-colors"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="LOW">Low Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="HIGH">High Risk</option>
              <option value="CRITICAL">Critical Risk</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-white/5">
          <span>
            Showing <strong className="text-emerald-400">{filteredRecords.length}</strong> of{" "}
            {records.length} legal records
          </span>
          {hasActiveFilters && <span className="text-slate-500 italic">Filters applied</span>}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-900/40 rounded-2xl border border-white/5">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
          <p className="text-sm text-slate-400">Loading legal records...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm">
          Failed to load records: {error}
        </div>
      ) : filteredRecords.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-16 px-6 text-center bg-slate-900/40 rounded-2xl border border-white/10 backdrop-blur-md space-y-4"
        >
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
            <Filter size={24} />
          </div>
          <div className="max-w-md space-y-1">
            <h3 className="text-base font-semibold text-white">No Matching Legal Records</h3>
            <p className="text-sm text-slate-400">
              No legal documents match your current filter selection. Try adjusting your search keyword or resetting filters.
            </p>
          </div>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 text-sm font-semibold transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <RotateCcw size={15} />
              Reset All Filters
            </button>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredRecords.map((record) => {
            const currentEdit = editingState[record.id] || {
              status: record.status,
              notes: record.reviewerNotes || "",
            };

            const statusCfg = STATUS_CONFIG[currentEdit.status];
            const riskCfg = RISK_CONFIG[record.riskLevel || "MEDIUM"];
            const isSaving = savingId === record.id;
            const isSuccess = saveSuccessId === record.id;

            const isDirty =
              currentEdit.status !== record.status ||
              currentEdit.notes !== (record.reviewerNotes || "");

            return (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-xl space-y-6"
              >
                {/* Record Header */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-white/5">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        <Layers size={11} />
                        {record.documentType}
                      </span>

                      <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        <Globe size={11} />
                        {record.jurisdiction}
                      </span>

                      <span
                        className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${riskCfg.badgeBg} ${riskCfg.badgeText} ${riskCfg.badgeBorder}`}
                      >
                        <AlertTriangle size={11} />
                        {riskCfg.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <FileText className="text-emerald-400 shrink-0" size={20} />
                      <h3 className="text-lg font-semibold text-white tracking-tight">
                        {record.title}
                      </h3>
                    </div>

                    {record.description && (
                      <p className="text-sm text-slate-400 pl-8">{record.description}</p>
                    )}

                    {record.patient && (
                      <div className="flex items-center gap-2 pl-8 pt-0.5 text-xs text-slate-500">
                        <User size={12} />
                        <span>
                          Associated Patient:{" "}
                          <strong className="text-slate-300 font-medium">{record.patient.name}</strong>
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col md:items-end gap-3 shrink-0">
                    <div
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${statusCfg.badgeBg} ${statusCfg.badgeText} ${statusCfg.badgeBorder}`}
                    >
                      {statusCfg.icon}
                      <span>{statusCfg.label}</span>
                    </div>

                    {/* Generate Brief Export Button */}
                    <button
                      onClick={() => setSelectedBriefRecord(record)}
                      className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
                    >
                      <FileCheck size={14} />
                      <span>Generate Brief</span>
                    </button>
                  </div>
                </div>

                {/* Form Controls */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Verification Status
                    </label>
                    <select
                      value={currentEdit.status}
                      onChange={(e) =>
                        handleStatusChange(record.id, e.target.value as VerificationStatus)
                      }
                      className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="NEEDS_REVIEW">Needs Review</option>
                      <option value="VERIFIED">Verified</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Reviewer Notes & Governance Log
                    </label>
                    <textarea
                      rows={2}
                      value={currentEdit.notes}
                      onChange={(e) => handleNotesChange(record.id, e.target.value)}
                      placeholder="Add reviewer notes, rationale, or compliance comments..."
                      className="w-full bg-slate-950/80 border border-white/15 rounded-xl p-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors resize-none"
                    />
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <span className="text-xs text-slate-500">
                    Last updated: {new Date(record.updatedAt).toLocaleString()}
                  </span>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleDownloadBrief(record)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 text-xs font-medium transition-all cursor-pointer"
                    >
                      <Download size={13} />
                      <span>Download .md</span>
                    </button>

                    <button
                      onClick={() => handleSaveUpdate(record.id)}
                      disabled={isSaving || !isDirty}
                      className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg ${
                        isSuccess
                          ? "bg-emerald-500 text-gray-950"
                          : isDirty
                          ? "bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-gray-950 shadow-emerald-500/20 cursor-pointer"
                          : "bg-white/5 text-slate-500 cursor-not-allowed border border-white/5"
                      }`}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : isSuccess ? (
                        <>
                          <CheckCircle2 size={16} />
                          <span>Saved!</span>
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          <span>{isDirty ? "Save Updates" : "No Changes"}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Readable Brief Modal */}
      <AnimatePresence>
        {selectedBriefRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-white/15 rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10 bg-slate-950/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <FileSpreadsheet size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight">
                      Generated Legal Review Brief
                    </h2>
                    <p className="text-xs text-slate-400">
                      Formatted compliance & audit report for judges and reviewers.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedBriefRecord(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Scrollable Body */}
              <div className="flex-1 p-6 overflow-y-auto space-y-6 text-sm">
                {/* Executive Summary Card */}
                <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/10 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <h3 className="font-bold text-white text-base">
                      {selectedBriefRecord.title}
                    </h3>
                    <span className="text-xs font-mono text-slate-500">
                      ID: {selectedBriefRecord.id}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block">Doc Type</span>
                      <strong className="text-cyan-400 font-semibold">
                        {selectedBriefRecord.documentType}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Jurisdiction</span>
                      <strong className="text-indigo-400 font-semibold">
                        {selectedBriefRecord.jurisdiction}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Risk Level</span>
                      <strong
                        className={`font-semibold ${
                          RISK_CONFIG[selectedBriefRecord.riskLevel || "MEDIUM"].badgeText
                        }`}
                      >
                        {selectedBriefRecord.riskLevel}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Status</span>
                      <strong
                        className={`font-semibold ${
                          STATUS_CONFIG[
                            editingState[selectedBriefRecord.id]?.status || selectedBriefRecord.status
                          ].badgeText
                        }`}
                      >
                        {editingState[selectedBriefRecord.id]?.status || selectedBriefRecord.status}
                      </strong>
                    </div>
                  </div>

                  {selectedBriefRecord.patient && (
                    <div className="pt-2 text-xs text-slate-400 border-t border-white/5">
                      Target Patient:{" "}
                      <strong className="text-slate-200">
                        {selectedBriefRecord.patient.name}
                      </strong>
                    </div>
                  )}
                </div>

                {/* Section: Description */}
                {selectedBriefRecord.description && (
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      1. Scope & Description
                    </h4>
                    <p className="text-slate-300 leading-relaxed bg-slate-950/40 p-3.5 rounded-xl border border-white/5">
                      {selectedBriefRecord.description}
                    </p>
                  </div>
                )}

                {/* Section: Key Clauses */}
                {selectedBriefRecord.clauses && selectedBriefRecord.clauses.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      2. Key Clauses & Verification
                    </h4>
                    <div className="space-y-2">
                      {selectedBriefRecord.clauses.map((c, i) => (
                        <div
                          key={i}
                          className="p-3.5 bg-slate-950/40 border border-white/5 rounded-xl space-y-1"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-emerald-400">
                              {c.section} — {c.title}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-300 font-mono">
                              {c.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 italic">"{c.snippet}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section: Detected Issues */}
                {selectedBriefRecord.detectedIssues && selectedBriefRecord.detectedIssues.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      3. Detected AI Bias & Risk Issues
                    </h4>
                    <div className="space-y-2">
                      {selectedBriefRecord.detectedIssues.map((iss) => (
                        <div
                          key={iss.id}
                          className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-1 text-xs"
                        >
                          <div className="flex items-center justify-between font-semibold text-rose-400">
                            <span>Issue: {iss.issue}</span>
                            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-[10px]">
                              {iss.severity}
                            </span>
                          </div>
                          <p className="text-slate-300">
                            <strong>Recommendation:</strong> {iss.recommendation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section: Reviewer Notes */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    4. Reviewer Notes & Governance Log
                  </h4>
                  <div className="p-3.5 bg-slate-950/60 rounded-xl border border-white/10 text-xs font-mono text-slate-300">
                    {editingState[selectedBriefRecord.id]?.notes ||
                      selectedBriefRecord.reviewerNotes ||
                      "No notes added yet."}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-white/10 bg-slate-950/60 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Ready for export or judge audit review.
                </span>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleDownloadBrief(selectedBriefRecord)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 text-xs font-semibold transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
                  >
                    <Download size={14} />
                    <span>Download Brief (.md)</span>
                  </button>

                  <button
                    onClick={() => setSelectedBriefRecord(null)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
