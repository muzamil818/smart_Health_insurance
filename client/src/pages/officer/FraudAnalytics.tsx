import { useEffect, useState } from "react";
import { BarChart3, Scale, Layers } from "lucide-react";
import { getFraudRules, type FraudRuleItem } from "../../services/adminService";
import { getOfficerClaims } from "../../services/officerService";
import type { Claim } from "../../services/claimService";
import { statusLabel } from "../../components/ClaimVisuals";

const FraudAnalytics = () => {
    const [rules, setRules] = useState<FraudRuleItem[]>([]);
    const [claims, setClaims] = useState<Claim[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAnalytics = async () => {
            setLoading(true);
            const [fetchedRules, fetchedClaims] = await Promise.all([
                getFraudRules(),
                getOfficerClaims(),
            ]);
            setRules(fetchedRules);
            setClaims(fetchedClaims);
            setLoading(false);
        };

        loadAnalytics();
    }, []);

    const totalExposure = claims.reduce((sum, c) => sum + (c.claimAmount ?? 0), 0);
    const approvedValue = claims
        .filter((c) => c.status === "approved")
        .reduce((sum, c) => sum + (c.claimAmount ?? 0), 0);

    const statusBreakdown = (
        [
            ["pending", "bg-slate-400"],
            ["under_review", "bg-sky-500"],
            ["more_information_required", "bg-amber-500"],
            ["approved", "bg-emerald-500"],
            ["rejected", "bg-rose-500"],
        ] as const
    ).map(([status, colour]) => ({
        status,
        colour,
        count: claims.filter((c) => c.status === status).length,
    }));

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-3">
                    <BarChart3 className="w-8 h-8 text-teal-400" />
                    Fraud Risk Analytics & Rule Specifications
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                    System specifications for rule-based fraud scoring and risk evaluation criteria.
                </p>
            </div>

            {/* Rule Engine Specifications */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 md:p-8 backdrop-blur-xl space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                    <Scale className="w-6 h-6 text-teal-400" />
                    <h2 className="text-lg font-bold text-slate-100">Rule-Based Fraud Scoring Specification</h2>
                </div>

                {loading ? (
                    <div className="py-12 text-center text-slate-400 text-sm">
                        <div className="w-6 h-6 border-2 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <span>Loading risk rules...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {rules.map((rule, idx) => (
                            <div key={idx} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-200">{rule.rule}</span>
                                    <span className="px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-extrabold text-xs border border-amber-500/20">
                                        +{rule.points} Risk Points
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-400">
                                    Triggered automatically when a claim violates specified threshold criteria.
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Live Claim Portfolio Breakdown */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 md:p-8 backdrop-blur-xl space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                    <Layers className="w-6 h-6 text-teal-400" />
                    <div>
                        <h2 className="text-lg font-bold text-slate-100">Current Claim Portfolio</h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Live distribution of every claim in the adjudication pipeline
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="py-12 text-center text-slate-400 text-sm">
                        <div className="w-6 h-6 border-2 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <span>Loading claim portfolio...</span>
                    </div>
                ) : claims.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-2">
                        No claims have been submitted yet, so there is nothing to analyse.
                    </p>
                ) : (
                    <div className="space-y-5">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                    Total Claims
                                </span>
                                <div className="mt-2 text-2xl font-extrabold text-slate-100">
                                    {claims.length}
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                    Total Exposure
                                </span>
                                <div className="mt-2 text-2xl font-extrabold text-teal-400">
                                    ${totalExposure.toLocaleString()}
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                    Approved Value
                                </span>
                                <div className="mt-2 text-2xl font-extrabold text-emerald-400">
                                    ${approvedValue.toLocaleString()}
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                    Average Claim
                                </span>
                                <div className="mt-2 text-2xl font-extrabold text-slate-100">
                                    ${Math.round(totalExposure / claims.length).toLocaleString()}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                Status distribution
                            </span>
                            {statusBreakdown.map(({ status, count, colour }) => (
                                <div key={status} className="space-y-1">
                                    <div className="flex items-center justify-between text-[11px]">
                                        <span className="text-slate-300 font-semibold">
                                            {statusLabel(status)}
                                        </span>
                                        <span className="text-slate-500 font-mono">
                                            {count} ({((count / claims.length) * 100).toFixed(0)}%)
                                        </span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${colour}`}
                                            style={{ width: `${(count / claims.length) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Risk Tier Guidelines */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-slate-900/60 border border-emerald-500/30 rounded-2xl p-5 space-y-2">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Low Risk Tier</span>
                    <div className="text-2xl font-extrabold text-slate-100">0 - 30 Points</div>
                    <p className="text-xs text-slate-400">Standard claim parameters with zero or minor rule flags. Fast-track approval eligible.</p>
                </div>

                <div className="bg-slate-900/60 border border-amber-500/30 rounded-2xl p-5 space-y-2">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Medium Risk Tier</span>
                    <div className="text-2xl font-extrabold text-slate-100">31 - 60 Points</div>
                    <p className="text-xs text-slate-400">Requires officer manual review due to policy ratio or frequency anomalies.</p>
                </div>

                <div className="bg-slate-900/60 border border-rose-500/30 rounded-2xl p-5 space-y-2">
                    <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">High Risk Tier</span>
                    <div className="text-2xl font-extrabold text-slate-100">61+ Points</div>
                    <p className="text-xs text-slate-400">High priority audit flag. Requires thorough medical document verification prior to payout decision.</p>
                </div>
            </div>
        </div>
    );
};

export default FraudAnalytics;
