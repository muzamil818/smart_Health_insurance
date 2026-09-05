import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    FileText,
    Clock,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    PlusCircle,
    ArrowRight,
    TrendingUp,
    Shield,
    Eye,
    Building2,
    Calendar,
    Activity
} from "lucide-react";
import { getHospitalClaims, type Claim } from "../../services/claimService";
import { getHospitalProfile, type HospitalProfileData } from "../../services/hospitalService";

const HospitalDashboard = () => {
    const [claims, setClaims] = useState<Claim[]>([]);
    const [hospital, setHospital] = useState<HospitalProfileData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboardData = async () => {
            setLoading(true);
            const [fetchedClaims, fetchedProfile] = await Promise.all([
                getHospitalClaims(),
                getHospitalProfile(),
            ]);
            setClaims(fetchedClaims);
            setHospital(fetchedProfile);
            setLoading(false);
        };

        loadDashboardData();
    }, []);

    // Statistics calculations
    const totalClaims = claims.length;
    const pendingClaims = claims.filter(c => c.status === "pending" || c.status === "more_information_required").length;
    const approvedClaims = claims.filter(c => c.status === "approved").length;
    const rejectedClaims = claims.filter(c => c.status === "rejected").length;
    const totalAmountSubmitted = claims.reduce((acc, c) => acc + (c.claimAmount || 0), 0);

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
                        <AlertTriangle className="w-3.5 h-3.5" /> Info Required
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30">
                        <Clock className="w-3.5 h-3.5" /> Under Review
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

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Header / Welcome Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 p-6 md:p-8 border border-slate-800 shadow-2xl">
                <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                            <Building2 className="w-3.5 h-3.5" />
                            <span>{hospital?.name || "Care Provider Portal"}</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-100">
                            Hospital Claim Dashboard
                        </h1>
                        <p className="text-slate-400 text-sm max-w-2xl">
                            Submit medical claims, track real-time verification status, upload required patient documentation, and monitor fraud risk assessments.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            to="/hospital/submit-claim"
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all duration-200 active:scale-95"
                        >
                            <PlusCircle className="w-5 h-5 stroke-[2.5]" />
                            <span>Submit New Claim</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-xl hover:border-slate-700/80 transition-all group">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Claims</span>
                        <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-300 group-hover:scale-110 transition-transform">
                            <FileText className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-baseline justify-between">
                        <span className="text-3xl font-extrabold text-slate-100">{loading ? "..." : totalClaims}</span>
                        <span className="text-xs font-semibold text-slate-400">
                            ${totalAmountSubmitted.toLocaleString()} total
                        </span>
                    </div>
                </div>

                <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-xl hover:border-sky-500/30 transition-all group">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending / Review</span>
                        <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
                            <Clock className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-baseline justify-between">
                        <span className="text-3xl font-extrabold text-sky-400">{loading ? "..." : pendingClaims}</span>
                        <span className="text-xs font-medium text-sky-400/80">Awaiting Decision</span>
                    </div>
                </div>

                <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-xl hover:border-emerald-500/30 transition-all group">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Approved Claims</span>
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-baseline justify-between">
                        <span className="text-3xl font-extrabold text-emerald-400">{loading ? "..." : approvedClaims}</span>
                        <span className="text-xs font-medium text-emerald-400/80">Disbursed</span>
                    </div>
                </div>

                <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-xl hover:border-rose-500/30 transition-all group">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rejected Claims</span>
                        <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                            <XCircle className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-baseline justify-between">
                        <span className="text-3xl font-extrabold text-rose-400">{loading ? "..." : rejectedClaims}</span>
                        <span className="text-xs font-medium text-rose-400/80">Denied</span>
                    </div>
                </div>
            </div>

            {/* Claim Overview Progress / Metrics */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-xl space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-emerald-400" />
                        <h2 className="text-lg font-bold text-slate-100">Claims Processing Distribution</h2>
                    </div>
                    <span className="text-xs text-slate-400 font-semibold">{totalClaims} total claims logged</span>
                </div>

                {totalClaims > 0 ? (
                    <div className="space-y-3">
                        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
                            <div
                                style={{ width: `${(approvedClaims / totalClaims) * 100}%` }}
                                className="bg-emerald-500 h-full transition-all duration-500"
                                title={`Approved: ${approvedClaims}`}
                            />
                            <div
                                style={{ width: `${(pendingClaims / totalClaims) * 100}%` }}
                                className="bg-sky-500 h-full transition-all duration-500"
                                title={`Pending: ${pendingClaims}`}
                            />
                            <div
                                style={{ width: `${(rejectedClaims / totalClaims) * 100}%` }}
                                className="bg-rose-500 h-full transition-all duration-500"
                                title={`Rejected: ${rejectedClaims}`}
                            />
                        </div>

                        <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1 gap-4">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                <span>Approved ({totalClaims > 0 ? Math.round((approvedClaims / totalClaims) * 100) : 0}%)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                                <span>Pending / Review ({totalClaims > 0 ? Math.round((pendingClaims / totalClaims) * 100) : 0}%)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                                <span>Rejected ({totalClaims > 0 ? Math.round((rejectedClaims / totalClaims) * 100) : 0}%)</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-xs text-slate-400 italic">No claim data available to display distribution chart.</p>
                )}
            </div>

            {/* Recent Claims Table */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-xl space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-100">Recent Claims</h2>
                        <p className="text-xs text-slate-400 mt-1">Latest medical claims submitted by your hospital facility</p>
                    </div>
                    <Link
                        to="/hospital/claims"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                        <span>View All Claims</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {loading ? (
                    <div className="py-12 text-center text-slate-400 text-sm">
                        <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <span>Loading recent claims...</span>
                    </div>
                ) : claims.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 space-y-3">
                        <Shield className="w-12 h-12 text-slate-600 mx-auto" />
                        <p className="text-base font-semibold text-slate-300">No Claims Submitted Yet</p>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                            Get started by creating your hospital's first insurance claim for policyholders.
                        </p>
                        <Link
                            to="/hospital/submit-claim"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/20"
                        >
                            <PlusCircle className="w-4 h-4" />
                            <span>Submit First Claim</span>
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                                    <th className="pb-3 px-3">Claim ID</th>
                                    <th className="pb-3 px-3">Patient</th>
                                    <th className="pb-3 px-3">Treatment</th>
                                    <th className="pb-3 px-3">Amount</th>
                                    <th className="pb-3 px-3">Date</th>
                                    <th className="pb-3 px-3">Status</th>
                                    <th className="pb-3 px-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {claims.slice(0, 5).map((claim) => (
                                    <tr key={claim._id} className="hover:bg-slate-800/40 transition-colors">
                                        <td className="py-4 px-3 font-mono text-slate-300 font-medium">
                                            #{claim._id.substring(claim._id.length - 8)}
                                        </td>
                                        <td className="py-4 px-3 font-bold text-slate-200">
                                            {getPatientName(claim)}
                                        </td>
                                        <td className="py-4 px-3 text-slate-300">
                                            {claim.treatment}
                                        </td>
                                        <td className="py-4 px-3 font-bold text-emerald-400">
                                            ${claim.claimAmount?.toLocaleString()}
                                        </td>
                                        <td className="py-4 px-3 text-slate-400">
                                            {claim.treatmentDate ? new Date(claim.treatmentDate).toLocaleDateString() : "N/A"}
                                        </td>
                                        <td className="py-4 px-3">
                                            {getStatusBadge(claim.status)}
                                        </td>
                                        <td className="py-4 px-3 text-right">
                                            <Link
                                                to={`/hospital/claims/${claim._id}`}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 font-semibold text-[11px] transition-colors"
                                            >
                                                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                                                <span>Details</span>
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

export default HospitalDashboard;
