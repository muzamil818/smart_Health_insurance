import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    ShieldAlert,
    Clock,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Eye,
    ArrowRight,
    FileCheck,
    TrendingUp,
    Shield
} from "lucide-react";
import { getOfficerClaims } from "../../services/officerService";
import type { Claim } from "../../services/claimService";

const OfficerDashboard = () => {
    const [claims, setClaims] = useState<Claim[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadOfficerData = async () => {
            setLoading(true);
            const fetchedClaims = await getOfficerClaims();
            setClaims(fetchedClaims);
            setLoading(false);
        };

        loadOfficerData();
    }, []);

    const pendingClaims = claims.filter(c => c.status === "pending" || c.status === "more_information_required");
    const approvedClaims = claims.filter(c => c.status === "approved");
    const rejectedClaims = claims.filter(c => c.status === "rejected");

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "approved":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                    </span>
                );
            case "rejected":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                        <XCircle className="w-3.5 h-3.5" /> Rejected
                    </span>
                );
            case "more_information_required":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        <AlertTriangle className="w-3.5 h-3.5" /> Info Requested
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30">
                        <Clock className="w-3.5 h-3.5" /> Pending Review
                    </span>
                );
        }
    };

    const getPatientName = (claim: Claim) => {
        if (typeof claim.policyholderId === "object" && claim.policyholderId?.name) {
            return claim.policyholderId.name;
        }
        return "Patient #" + claim._id.substring(claim._id.length - 6);
    };

    const getHospitalName = (claim: Claim) => {
        if (typeof claim.hospitalId === "object" && claim.hospitalId?.name) {
            return claim.hospitalId.name;
        }
        return "Hospital #" + (typeof claim.hospitalId === "string" ? claim.hospitalId.substring(0, 6) : "Care");
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950/40 p-6 md:p-8 border border-slate-800 shadow-2xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold uppercase tracking-wider">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Insurance Officer Dashboard</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-100">
                            Claim Adjudication & Fraud Review
                        </h1>
                        <p className="text-slate-400 text-sm max-w-2xl">
                            Review submitted medical claims, evaluate automated rule-based risk scores, inspect attached documents, and issue official approval decisions.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            to="/officer/claims"
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all active:scale-95"
                        >
                            <FileCheck className="w-5 h-5 stroke-[2.5]" />
                            <span>Open Review Queue</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Review</span>
                        <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                            <Clock className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-baseline justify-between">
                        <span className="text-3xl font-extrabold text-sky-400">{loading ? "..." : pendingClaims.length}</span>
                        <span className="text-xs text-slate-500">Awaiting decision</span>
                    </div>
                </div>

                <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Claims</span>
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                            <Shield className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-baseline justify-between">
                        <span className="text-3xl font-extrabold text-slate-100">{loading ? "..." : claims.length}</span>
                        <span className="text-xs text-slate-500">System total</span>
                    </div>
                </div>

                <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Approved Claims</span>
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-baseline justify-between">
                        <span className="text-3xl font-extrabold text-emerald-400">{loading ? "..." : approvedClaims.length}</span>
                        <span className="text-xs text-emerald-400/80">Authorized</span>
                    </div>
                </div>

                <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rejected Claims</span>
                        <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                            <XCircle className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-baseline justify-between">
                        <span className="text-3xl font-extrabold text-rose-400">{loading ? "..." : rejectedClaims.length}</span>
                        <span className="text-xs text-rose-400/80">Denied</span>
                    </div>
                </div>
            </div>

            {/* Pending Adjudication Queue Table */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-xl space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-100">Claims Awaiting Adjudication</h2>
                        <p className="text-xs text-slate-400 mt-1">Pending claims submitted by hospital healthcare providers</p>
                    </div>
                    <Link
                        to="/officer/claims"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-400 hover:text-teal-300 transition-colors"
                    >
                        <span>View All Claims</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {loading ? (
                    <div className="py-12 text-center text-slate-400 text-sm">
                        <div className="w-6 h-6 border-2 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <span>Loading review queue...</span>
                    </div>
                ) : claims.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 space-y-3">
                        <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto" />
                        <p className="text-base font-semibold text-slate-300">All Queue Claims Processed</p>
                        <p className="text-xs text-slate-500">There are no pending claims requiring review at this time.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                                    <th className="pb-3 px-3">Claim ID</th>
                                    <th className="pb-3 px-3">Patient</th>
                                    <th className="pb-3 px-3">Hospital Provider</th>
                                    <th className="pb-3 px-3">Treatment</th>
                                    <th className="pb-3 px-3">Amount</th>
                                    <th className="pb-3 px-3">Status</th>
                                    <th className="pb-3 px-3 text-right">Adjudicate</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {claims.slice(0, 6).map((claim) => (
                                    <tr key={claim._id} className="hover:bg-slate-800/40 transition-colors">
                                        <td className="py-4 px-3 font-mono text-slate-300 font-medium">
                                            #{claim._id.substring(claim._id.length - 8)}
                                        </td>
                                        <td className="py-4 px-3 font-bold text-slate-200">
                                            {getPatientName(claim)}
                                        </td>
                                        <td className="py-4 px-3 text-slate-400">
                                            {getHospitalName(claim)}
                                        </td>
                                        <td className="py-4 px-3 text-slate-300">
                                            {claim.treatment}
                                        </td>
                                        <td className="py-4 px-3 font-bold text-emerald-400">
                                            ${claim.claimAmount?.toLocaleString()}
                                        </td>
                                        <td className="py-4 px-3">
                                            {getStatusBadge(claim.status)}
                                        </td>
                                        <td className="py-4 px-3 text-right">
                                            <Link
                                                to={`/officer/claims/${claim._id}`}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/30 font-bold text-[11px] transition-colors"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                <span>Review & Decide</span>
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

export default OfficerDashboard;
