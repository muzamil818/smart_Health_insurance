import { useEffect, useState } from "react";
import { FileText, Plus, AlertCircle, CheckCircle2, XCircle, Ban } from "lucide-react";
import {
    getPolicies,
    createPolicy,
    updatePolicy,
    getAllUsers,
    type AdminPolicy,
} from "../../services/adminService";
import type { UserRef } from "../../services/claimService";

const currency = (n?: number) => `$${(n ?? 0).toLocaleString()}`;
const formatDate = (d?: string) => (d ? new Date(d).toLocaleDateString() : "—");
const todayPlus = (days: number) =>
    new Date(Date.now() + days * 86_400_000).toISOString().substring(0, 10);

const AdminPolicies = () => {
    const [policies, setPolicies] = useState<AdminPolicy[]>([]);
    const [policyholders, setPolicyholders] = useState<UserRef[]>([]);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState<string | null>(null);

    const [showModal, setShowModal] = useState(false);
    const [policyNumber, setPolicyNumber] = useState("");
    const [policyholderId, setPolicyholderId] = useState("");
    const [coverageLimit, setCoverageLimit] = useState("500000");
    const [coveredTreatments, setCoveredTreatments] = useState("");
    const [startDate, setStartDate] = useState(todayPlus(0));
    const [expiryDate, setExpiryDate] = useState(todayPlus(365));
    const [saving, setSaving] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);

    const fetchAll = async () => {
        setLoading(true);
        const [pols, users] = await Promise.all([getPolicies(), getAllUsers()]);
        setPolicies(pols);
        setPolicyholders(users.filter((u) => u.role === "policyholder"));
        setLoading(false);
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const openModal = () => {
        // Suggest a unique policy number so demos never collide on the unique index.
        setPolicyNumber(`POL-${Date.now().toString().slice(-6)}`);
        setPolicyholderId(policyholders[0]?._id ?? "");
        setModalError(null);
        setShowModal(true);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setModalError(null);

        const limit = Number(coverageLimit);
        if (!policyNumber.trim()) {
            setModalError("A policy number is required.");
            return;
        }
        if (!policyholderId) {
            setModalError("Select the policyholder this policy belongs to.");
            return;
        }
        if (!Number.isFinite(limit) || limit <= 0) {
            setModalError("Coverage limit must be a positive number.");
            return;
        }
        if (new Date(expiryDate) <= new Date(startDate)) {
            setModalError("Expiry date must fall after the start date.");
            return;
        }

        setSaving(true);
        const res = await createPolicy({
            policyNumber: policyNumber.trim(),
            policyholderId,
            coverageLimit: limit,
            coveredTreatments: coveredTreatments
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean),
            startDate,
            expiryDate,
        });

        if (res.error) {
            setModalError(res.error);
        } else {
            setShowModal(false);
            setCoveredTreatments("");
            await fetchAll();
        }
        setSaving(false);
    };

    const handleCancelPolicy = async (policy: AdminPolicy) => {
        if (!window.confirm(`Cancel policy ${policy.policyNumber}? Claims against it will fail validation.`)) {
            return;
        }
        setBusyId(policy._id);
        const res = await updatePolicy(policy._id, { status: "cancelled" });
        if (!res.error) {
            setPolicies((prev) =>
                prev.map((p) => (p._id === policy._id ? { ...p, status: "cancelled" } : p))
            );
        }
        setBusyId(null);
    };

    const statusPill = (policy: AdminPolicy) => {
        const expired = policy.expiryDate ? new Date(policy.expiryDate) < new Date() : false;
        if (policy.status === "active" && !expired) {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                <XCircle className="w-3.5 h-3.5" />
                {expired && policy.status === "active" ? "Expired" : (policy.status ?? "Inactive")}
            </span>
        );
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-3">
                        <FileText className="w-8 h-8 text-teal-400" />
                        Policy Issuance
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                        Issue insurance policies to member accounts. Coverage limit and the covered-treatment
                        list feed directly into automated claim validation and fraud scoring.
                    </p>
                </div>

                <button
                    onClick={openModal}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 cursor-pointer shrink-0"
                >
                    <Plus className="w-4 h-4" />
                    <span>Issue Policy</span>
                </button>
            </div>

            {/* Table */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-xl">
                {loading ? (
                    <div className="py-16 text-center text-slate-400 text-sm">
                        <div className="w-6 h-6 border-2 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <span>Loading policy register...</span>
                    </div>
                ) : policies.length === 0 ? (
                    <div className="py-16 text-center text-slate-400 space-y-2">
                        <FileText className="w-12 h-12 text-slate-600 mx-auto" />
                        <p className="text-sm font-semibold text-slate-300">No policies issued yet</p>
                        <p className="text-xs text-slate-500">
                            A policyholder needs an active policy before any claim can pass validation.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                                    <th className="pb-3 px-3">Policy No.</th>
                                    <th className="pb-3 px-3">Policyholder</th>
                                    <th className="pb-3 px-3">Coverage Limit</th>
                                    <th className="pb-3 px-3">Covered Treatments</th>
                                    <th className="pb-3 px-3">Validity</th>
                                    <th className="pb-3 px-3">Status</th>
                                    <th className="pb-3 px-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {policies.map((p) => (
                                    <tr key={p._id} className="hover:bg-slate-800/40 transition-colors">
                                        <td className="py-4 px-3 font-mono font-bold text-teal-400">
                                            {p.policyNumber}
                                        </td>
                                        <td className="py-4 px-3">
                                            <div className="font-bold text-slate-200">
                                                {typeof p.policyholderId === "object"
                                                    ? p.policyholderId?.name
                                                    : "Unknown"}
                                            </div>
                                            <div className="text-[10px] text-slate-500">
                                                {typeof p.policyholderId === "object"
                                                    ? p.policyholderId?.email
                                                    : ""}
                                            </div>
                                        </td>
                                        <td className="py-4 px-3 font-bold text-slate-200">
                                            {currency(p.coverageLimit)}
                                        </td>
                                        <td className="py-4 px-3 text-slate-400 max-w-[240px]">
                                            {p.coveredTreatments?.length
                                                ? p.coveredTreatments.join(", ")
                                                : "—"}
                                        </td>
                                        <td className="py-4 px-3 text-slate-400 whitespace-nowrap">
                                            {formatDate(p.startDate)} → {formatDate(p.expiryDate)}
                                        </td>
                                        <td className="py-4 px-3">{statusPill(p)}</td>
                                        <td className="py-4 px-3 text-right">
                                            {p.status === "active" ? (
                                                <button
                                                    onClick={() => handleCancelPolicy(p)}
                                                    disabled={busyId === p._id}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/10 text-slate-300 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 font-bold text-[11px] transition-colors disabled:opacity-50 cursor-pointer"
                                                >
                                                    <Ban className="w-3.5 h-3.5" />
                                                    <span>{busyId === p._id ? "Saving..." : "Cancel"}</span>
                                                </button>
                                            ) : (
                                                <span className="text-[10px] text-slate-600 italic">
                                                    No action
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Issue policy modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                    <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl animate-fadeIn my-8">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                            <h3 className="text-lg font-bold text-slate-100">Issue Insurance Policy</h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-slate-400 hover:text-slate-200 cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        {modalError && (
                            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{modalError}</span>
                            </div>
                        )}

                        {policyholders.length === 0 && (
                            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-400">
                                No policyholder accounts exist yet. Create one under User Management first.
                            </div>
                        )}

                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-slate-300">
                                        Policy Number
                                    </label>
                                    <input
                                        type="text"
                                        value={policyNumber}
                                        onChange={(e) => setPolicyNumber(e.target.value)}
                                        className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-slate-300">
                                        Coverage Limit ($)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={coverageLimit}
                                        onChange={(e) => setCoverageLimit(e.target.value)}
                                        className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-slate-300">
                                    Policyholder
                                </label>
                                <select
                                    value={policyholderId}
                                    onChange={(e) => setPolicyholderId(e.target.value)}
                                    className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                                >
                                    <option value="">-- Select policyholder --</option>
                                    {policyholders.map((u) => (
                                        <option key={u._id} value={u._id}>
                                            {u.name} ({u.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-slate-300">
                                    Covered Treatments
                                </label>
                                <textarea
                                    rows={2}
                                    value={coveredTreatments}
                                    onChange={(e) => setCoveredTreatments(e.target.value)}
                                    placeholder="Comma separated, e.g. Cardiology Consultation, MRI Scan, Appendectomy"
                                    className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500 resize-none"
                                />
                                <p className="text-[10px] text-slate-500">
                                    A claim whose treatment is not on this list fails validation and gains +20
                                    fraud risk points.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-slate-300">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-slate-300">
                                        Expiry Date
                                    </label>
                                    <input
                                        type="date"
                                        value={expiryDate}
                                        onChange={(e) => setExpiryDate(e.target.value)}
                                        className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-950 text-slate-300 border border-slate-800 text-xs font-semibold cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving || policyholders.length === 0}
                                    className="px-5 py-2 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs shadow-md disabled:opacity-50 cursor-pointer"
                                >
                                    {saving ? "Issuing..." : "Issue Policy"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPolicies;
