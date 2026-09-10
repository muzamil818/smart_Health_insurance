import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    HeartPulse,
    ShieldCheck,
    FileText,
    CheckCircle2,
    Clock,
    Wallet,
    ArrowRight,
    Eye,
} from "lucide-react";
import { getMyPolicy, getMyClaims, type PolicyholderPolicy } from "../../services/policyholderService";
import type { Claim } from "../../services/claimService";
import { StatusBadge } from "../../components/ClaimVisuals";
import { getStoredUser } from "../../services/authApi";

const currency = (n?: number) => `$${(n ?? 0).toLocaleString()}`;

const PolicyholderDashboard = () => {
    const [policy, setPolicy] = useState<PolicyholderPolicy | null>(null);
    const [claims, setClaims] = useState<Claim[]>([]);
    const [loading, setLoading] = useState(true);
    const user = getStoredUser();

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const [pol, cls] = await Promise.all([getMyPolicy(), getMyClaims()]);
            setPolicy(pol);
            setClaims(cls);
            setLoading(false);
        };
        load();
    }, []);

    const approved = claims.filter((c) => c.status === "approved");
    const inProgress = claims.filter(
        (c) => c.status === "pending" || c.status === "under_review" || c.status === "more_information_required"
    );
    const approvedTotal = approved.reduce((sum, c) => sum + (c.claimAmount ?? 0), 0);
    const remaining = Math.max((policy?.coverageLimit ?? 0) - approvedTotal, 0);
    const usedPct = policy?.coverageLimit
        ? Math.min((approvedTotal / policy.coverageLimit) * 100, 100)
        : 0;

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/40 p-6 md:p-8 border border-slate-800 shadow-2xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold uppercase tracking-wider">
                            <HeartPulse className="w-3.5 h-3.5" />
                            <span>Member Dashboard</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-100">
                            Welcome back, {user?.name?.split(" ")[0] || "Member"}
                        </h1>
                        <p className="text-slate-400 text-sm max-w-2xl">
                            Track your insurance coverage, follow every claim your hospital submits on your
                            behalf, and see officer decisions the moment they are made.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            to="/policyholder/policy"
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-bold transition-all"
                        >
                            <ShieldCheck className="w-4 h-4 text-sky-400" />
                            <span>View My Policy</span>
                        </Link>
                        <Link
                            to="/policyholder/claims"
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 via-cyan-500 to-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20"
                        >
                            <FileText className="w-4 h-4" />
                            <span>My Claims</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Total Claims
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                            <FileText className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-baseline justify-between">
                        <span className="text-3xl font-extrabold text-sky-400">
                            {loading ? "..." : claims.length}
                        </span>
                        <span className="text-xs text-slate-500">All time</span>
                    </div>
                </div>

                <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            In Progress
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                            <Clock className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-baseline justify-between">
                        <span className="text-3xl font-extrabold text-amber-400">
                            {loading ? "..." : inProgress.length}
                        </span>
                        <span className="text-xs text-slate-500">Awaiting decision</span>
                    </div>
                </div>

                <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Approved
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-baseline justify-between">
                        <span className="text-3xl font-extrabold text-emerald-400">
                            {loading ? "..." : approved.length}
                        </span>
                        <span className="text-xs text-emerald-400/80">{currency(approvedTotal)}</span>
                    </div>
                </div>

                <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Coverage Left
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                            <Wallet className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-baseline justify-between">
                        <span className="text-2xl font-extrabold text-teal-400">
                            {loading ? "..." : policy ? currency(remaining) : "—"}
                        </span>
                        <span className="text-xs text-slate-500">
                            of {policy ? currency(policy.coverageLimit) : "—"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Coverage usage bar */}
            {policy && (
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-xl space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-bold text-slate-100">
                                Policy #{policy.policyNumber}
                            </h2>
                            <p className="text-xs text-slate-400 mt-0.5">
                                {currency(approvedTotal)} of {currency(policy.coverageLimit)} used by
                                approved claims
                            </p>
                        </div>
                        <Link
                            to="/policyholder/policy"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors"
                        >
                            <span>Policy details</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-500"
                            style={{ width: `${usedPct}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        <span>{usedPct.toFixed(0)}% utilised</span>
                        <span>{currency(remaining)} remaining</span>
                    </div>
                </div>
            )}

            {/* Recent claims */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-xl space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-100">Recent Claim Activity</h2>
                        <p className="text-xs text-slate-400 mt-1">
                            Claims submitted by hospitals on your behalf
                        </p>
                    </div>
                    <Link
                        to="/policyholder/claims"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors"
                    >
                        <span>View All</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {loading ? (
                    <div className="py-12 text-center text-slate-400 text-sm">
                        <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <span>Loading your claims...</span>
                    </div>
                ) : claims.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 space-y-3">
                        <FileText className="w-12 h-12 text-slate-600 mx-auto" />
                        <p className="text-base font-semibold text-slate-300">No claims yet</p>
                        <p className="text-xs text-slate-500 max-w-md mx-auto">
                            When a hospital submits a claim against your policy it will appear here
                            automatically, along with its review status.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                                    <th className="pb-3 px-3">Claim ID</th>
                                    <th className="pb-3 px-3">Treatment</th>
                                    <th className="pb-3 px-3">Hospital</th>
                                    <th className="pb-3 px-3">Amount</th>
                                    <th className="pb-3 px-3">Status</th>
                                    <th className="pb-3 px-3 text-right">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {claims.slice(0, 6).map((claim) => (
                                    <tr key={claim._id} className="hover:bg-slate-800/40 transition-colors">
                                        <td className="py-4 px-3 font-mono text-slate-300 font-medium">
                                            #{claim._id.substring(claim._id.length - 8)}
                                        </td>
                                        <td className="py-4 px-3 font-bold text-slate-200">{claim.treatment}</td>
                                        <td className="py-4 px-3 text-slate-400">
                                            {typeof claim.hospitalId === "object"
                                                ? claim.hospitalId?.name
                                                : "Hospital"}
                                        </td>
                                        <td className="py-4 px-3 font-bold text-sky-400">
                                            {currency(claim.claimAmount)}
                                        </td>
                                        <td className="py-4 px-3">
                                            <StatusBadge status={claim.status} />
                                        </td>
                                        <td className="py-4 px-3 text-right">
                                            <Link
                                                to={`/policyholder/claims/${claim._id}`}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 font-bold text-[11px] transition-colors"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                <span>View</span>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PolicyholderDashboard;
