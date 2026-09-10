import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    ShieldCheck,
    CheckCircle2,
    XCircle,
    CalendarDays,
    Wallet,
    Stethoscope,
    AlertCircle,
} from "lucide-react";
import { getMyPolicy, getMyClaims, type PolicyholderPolicy } from "../../services/policyholderService";
import type { Claim } from "../../services/claimService";

const currency = (n?: number) => `$${(n ?? 0).toLocaleString()}`;
const formatDate = (d?: string) => (d ? new Date(d).toLocaleDateString() : "—");

const MyPolicy = () => {
    const [policy, setPolicy] = useState<PolicyholderPolicy | null>(null);
    const [claims, setClaims] = useState<Claim[]>([]);
    const [loading, setLoading] = useState(true);

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

    const approvedTotal = claims
        .filter((c) => c.status === "approved")
        .reduce((sum, c) => sum + (c.claimAmount ?? 0), 0);
    const remaining = Math.max((policy?.coverageLimit ?? 0) - approvedTotal, 0);

    const isExpired = policy?.expiryDate ? new Date(policy.expiryDate) < new Date() : false;
    const daysLeft = policy?.expiryDate
        ? Math.ceil((new Date(policy.expiryDate).getTime() - Date.now()) / 86_400_000)
        : null;

    if (loading) {
        return (
            <div className="py-24 text-center text-slate-400 text-sm">
                <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <span>Loading your policy...</span>
            </div>
        );
    }

    if (!policy) {
        return (
            <div className="max-w-lg mx-auto py-20 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                    <AlertCircle className="w-7 h-7" />
                </div>
                <h2 className="text-xl font-bold text-slate-100">No Policy Assigned Yet</h2>
                <p className="text-sm text-slate-400">
                    Your account does not have an insurance policy attached. A system administrator
                    issues policies to member accounts — please contact your insurance administrator.
                </p>
                <Link
                    to="/policyholder"
                    className="inline-block px-4 py-2 rounded-xl bg-slate-800 text-sky-400 font-bold text-xs border border-slate-700"
                >
                    Back to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-3">
                    <ShieldCheck className="w-8 h-8 text-sky-400" />
                    My Insurance Policy
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                    Your coverage terms, validity period, and the treatments eligible for reimbursement.
                </p>
            </div>

            {/* Policy summary card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-950/60 via-slate-900 to-slate-900 border border-sky-500/20 p-6 md:p-8 shadow-2xl space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-sky-400/80">
                            Policy Number
                        </span>
                        <div className="text-2xl md:text-3xl font-extrabold font-mono text-slate-100">
                            {policy.policyNumber}
                        </div>
                    </div>

                    <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                            policy.status === "active" && !isExpired
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                        }`}
                    >
                        {policy.status === "active" && !isExpired ? (
                            <>
                                <CheckCircle2 className="w-4 h-4" /> Active
                            </>
                        ) : (
                            <>
                                <XCircle className="w-4 h-4" />{" "}
                                {isExpired ? "Expired" : (policy.status ?? "Inactive")}
                            </>
                        )}
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div className="space-y-1">
                        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                            <Wallet className="w-3.5 h-3.5" /> Coverage Limit
                        </span>
                        <div className="text-xl font-extrabold text-sky-400">
                            {currency(policy.coverageLimit)}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Claimed (Approved)
                        </span>
                        <div className="text-xl font-extrabold text-emerald-400">
                            {currency(approvedTotal)}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                            <Wallet className="w-3.5 h-3.5" /> Remaining Balance
                        </span>
                        <div className="text-xl font-extrabold text-teal-400">{currency(remaining)}</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-slate-800/80">
                    <div className="space-y-1">
                        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                            <CalendarDays className="w-3.5 h-3.5" /> Valid From
                        </span>
                        <div className="text-sm font-bold text-slate-200">
                            {formatDate(policy.startDate)}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                            <CalendarDays className="w-3.5 h-3.5" /> Expires On
                        </span>
                        <div className="text-sm font-bold text-slate-200">
                            {formatDate(policy.expiryDate)}
                            {daysLeft !== null && daysLeft > 0 && (
                                <span className="ml-2 text-[10px] font-semibold text-slate-500">
                                    ({daysLeft} days left)
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Covered treatments */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-xl space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
                    <Stethoscope className="w-5 h-5 text-sky-400" />
                    <div>
                        <h2 className="text-lg font-bold text-slate-100">Covered Treatments</h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Claims for treatments outside this list fail automated validation and add risk
                            points during fraud scoring.
                        </p>
                    </div>
                </div>

                {policy.coveredTreatments.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-2">
                        No specific treatments are listed on this policy.
                    </p>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {policy.coveredTreatments.map((treatment) => (
                            <span
                                key={treatment}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs font-semibold text-slate-200"
                            >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                {treatment}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyPolicy;
