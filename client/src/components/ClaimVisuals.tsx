import {
    CheckCircle2,
    XCircle,
    Clock,
    AlertTriangle,
    Search,
    ShieldCheck,
    ShieldAlert,
    Shield,
} from "lucide-react";
import type {
    ClaimStatus,
    FraudScore,
    RiskLevel,
    ValidationResults,
} from "../services/claimService";

/** Human label for a claim status. */
export const statusLabel = (status?: ClaimStatus | string): string => {
    switch (status) {
        case "approved":
            return "Approved";
        case "rejected":
            return "Rejected";
        case "more_information_required":
            return "Info Required";
        case "under_review":
            return "Under Review";
        case "pending":
            return "Pending";
        default:
            return "Unknown";
    }
};

const STATUS_STYLES: Record<string, { cls: string; Icon: typeof CheckCircle2 }> = {
    approved: {
        cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        Icon: CheckCircle2,
    },
    rejected: {
        cls: "bg-rose-500/10 text-rose-400 border-rose-500/30",
        Icon: XCircle,
    },
    more_information_required: {
        cls: "bg-amber-500/10 text-amber-400 border-amber-500/30",
        Icon: AlertTriangle,
    },
    under_review: {
        cls: "bg-sky-500/10 text-sky-400 border-sky-500/30",
        Icon: Search,
    },
    pending: {
        cls: "bg-slate-500/10 text-slate-300 border-slate-600/50",
        Icon: Clock,
    },
};

export const StatusBadge = ({
    status,
    size = "sm",
}: {
    status?: ClaimStatus | string;
    size?: "sm" | "md";
}) => {
    const style = STATUS_STYLES[status ?? "pending"] ?? STATUS_STYLES.pending;
    const { Icon } = style;
    const pad = size === "md" ? "px-3 py-1 text-xs" : "px-2.5 py-1 text-[11px]";
    const icon = size === "md" ? "w-4 h-4" : "w-3.5 h-3.5";

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${pad} ${style.cls}`}
        >
            <Icon className={icon} />
            {statusLabel(status)}
        </span>
    );
};

const RISK_STYLES: Record<RiskLevel, { cls: string; Icon: typeof Shield; label: string }> = {
    low: {
        cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        Icon: ShieldCheck,
        label: "Low Risk",
    },
    medium: {
        cls: "bg-amber-500/10 text-amber-400 border-amber-500/30",
        Icon: Shield,
        label: "Medium Risk",
    },
    high: {
        cls: "bg-rose-500/10 text-rose-400 border-rose-500/30",
        Icon: ShieldAlert,
        label: "High Risk",
    },
};

/** Derives the tier from a raw score, matching getRiskLevel() in fraudScoring.js. */
export const riskLevelForScore = (score: number): RiskLevel => {
    if (score <= 30) return "low";
    if (score <= 60) return "medium";
    return "high";
};

export const RiskBadge = ({ fraudScore }: { fraudScore?: FraudScore | null }) => {
    if (!fraudScore || typeof fraudScore.score !== "number") {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                <Clock className="w-3.5 h-3.5" />
                Not scored
            </span>
        );
    }

    const level = fraudScore.riskLevel ?? riskLevelForScore(fraudScore.score);
    const style = RISK_STYLES[level] ?? RISK_STYLES.medium;
    const { Icon } = style;

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${style.cls}`}
        >
            <Icon className="w-3.5 h-3.5" />
            {style.label} · {fraudScore.score}/100
        </span>
    );
};

/**
 * Full fraud breakdown: the score bar plus every rule that fired.
 * Mirrors the FRAUD_RULES weights in server/src/services/fraudScoring.js.
 */
export const FraudScoreCard = ({ fraudScore }: { fraudScore?: FraudScore | null }) => {
    const score = fraudScore?.score ?? 0;
    const level = fraudScore?.riskLevel ?? riskLevelForScore(score);
    const barColor =
        level === "low" ? "bg-emerald-500" : level === "medium" ? "bg-amber-500" : "bg-rose-500";
    const rules = fraudScore?.triggeredRules ?? [];

    return (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-4 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        Fraud Risk Assessment
                    </h3>
                </div>
                <RiskBadge fraudScore={fraudScore} />
            </div>

            {!fraudScore ? (
                <p className="text-[11px] text-slate-400 italic">
                    No risk assessment has been generated for this claim yet.
                </p>
            ) : (
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <div className="flex items-baseline justify-between">
                            <span className="text-3xl font-extrabold text-slate-100">{score}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                of 100 risk points
                            </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                                style={{ width: `${Math.min(score, 100)}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-slate-600">
                            <span>Low 0-30</span>
                            <span>Medium 31-60</span>
                            <span>High 61+</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Rules triggered ({rules.length})
                        </span>
                        {rules.length === 0 ? (
                            <p className="text-[11px] text-emerald-400/90 flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                No fraud rules were triggered by this claim.
                            </p>
                        ) : (
                            <ul className="space-y-1.5">
                                {rules.map((rule, idx) => (
                                    <li
                                        key={`${rule.rule}-${idx}`}
                                        className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800"
                                    >
                                        <span className="flex items-center gap-2 text-[11px] text-amber-300">
                                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                                            {rule.rule}
                                        </span>
                                        <span className="shrink-0 px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-extrabold">
                                            +{rule.points}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {fraudScore.calculatedAt && (
                        <p className="text-[10px] text-slate-500 font-mono">
                            Evaluated {new Date(fraudScore.calculatedAt).toLocaleString()}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

/**
 * The seven deterministic eligibility checks from
 * server/src/services/claimValidation.js, rendered as a pass/fail checklist.
 */
export const ValidationChecklist = ({
    validationResults,
}: {
    validationResults?: ValidationResults | null;
}) => {
    const checks = validationResults?.checks ?? [];
    const passedCount = checks.filter((c) => c.passed).length;

    return (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-4 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        Automated Eligibility Validation
                    </h3>
                </div>
                {checks.length > 0 && (
                    <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                            validationResults?.isValid
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                        }`}
                    >
                        {passedCount}/{checks.length} passed
                    </span>
                )}
            </div>

            {checks.length === 0 ? (
                <p className="text-[11px] text-slate-400 italic">
                    Validation has not run for this claim yet.
                </p>
            ) : (
                <ul className="space-y-1.5">
                    {checks.map((item, idx) => (
                        <li
                            key={`${item.check}-${idx}`}
                            className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1"
                        >
                            <div className="flex items-start gap-2">
                                {item.passed ? (
                                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-px" />
                                ) : (
                                    <XCircle className="w-4 h-4 shrink-0 text-rose-400 mt-px" />
                                )}
                                <span
                                    className={`text-[11px] font-medium ${
                                        item.passed ? "text-slate-300" : "text-rose-300"
                                    }`}
                                >
                                    {item.check}
                                </span>
                            </div>

                            {/* The document check carries required-vs-uploaded detail. */}
                            {item.details?.required && (
                                <div className="pl-6 text-[10px] text-slate-500 space-y-0.5">
                                    <div>
                                        Required:{" "}
                                        <span className="text-slate-400">
                                            {item.details.required.join(", ")}
                                        </span>
                                    </div>
                                    <div>
                                        Uploaded:{" "}
                                        <span className="text-slate-400">
                                            {item.details.uploaded && item.details.uploaded.length > 0
                                                ? item.details.uploaded.join(", ")
                                                : "none"}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
