import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
    ArrowLeft,
    FileText,
    Building2,
    Activity,
    File,
    Gavel,
} from "lucide-react";
import {
    getClaimById,
    documentUrl,
    type ClaimDetailResponse,
} from "../../services/claimService";
import { StatusBadge, ValidationChecklist } from "../../components/ClaimVisuals";

const currency = (n?: number) => `$${(n ?? 0).toLocaleString()}`;
const formatDate = (d?: string) => (d ? new Date(d).toLocaleDateString() : "—");

const PolicyholderClaimDetails = () => {
    const { id } = useParams<{ id: string }>();
    const [detail, setDetail] = useState<ClaimDetailResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!id) return;
            setLoading(true);
            setDetail(await getClaimById(id));
            setLoading(false);
        };
        fetchDetails();
    }, [id]);

    if (loading) {
        return (
            <div className="py-24 text-center text-slate-400 text-sm">
                <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <span>Loading claim details...</span>
            </div>
        );
    }

    if (!detail?.claim) {
        return (
            <div className="max-w-md mx-auto py-16 text-center space-y-4">
                <FileText className="w-12 h-12 text-slate-600 mx-auto" />
                <h2 className="text-xl font-bold text-slate-200">Claim Not Found</h2>
                <p className="text-xs text-slate-400">
                    This claim does not exist, or it does not belong to your policy.
                </p>
                <Link
                    to="/policyholder/claims"
                    className="inline-block px-4 py-2 rounded-xl bg-slate-800 text-sky-400 font-bold text-xs border border-slate-700"
                >
                    Return to My Claims
                </Link>
            </div>
        );
    }

    const { claim, documents, approvalRecords } = detail;
    const hospitalName = typeof claim.hospitalId === "object" ? claim.hospitalId?.name : "Hospital";
    const policyNum = typeof claim.policyId === "object" ? claim.policyId?.policyNumber : "—";
    const coverageLimit = typeof claim.policyId === "object" ? claim.policyId?.coverageLimit : undefined;

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
                <div className="space-y-1">
                    <Link
                        to="/policyholder/claims"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors mb-1"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to My Claims</span>
                    </Link>
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-mono">
                            Claim #{claim._id.substring(claim._id.length - 8)}
                        </h1>
                        <StatusBadge status={claim.status} size="md" />
                    </div>
                </div>

                <div className="text-right">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        Submitted On
                    </span>
                    <span className="text-xs font-semibold text-slate-300">
                        {formatDate(claim.submittedAt ?? claim.createdAt)}
                    </span>
                </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-4 backdrop-blur-xl">
                    <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                        <Building2 className="w-4 h-4 text-sky-400" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                            Care Provider
                        </h3>
                    </div>
                    <div className="space-y-2 text-xs">
                        <div>
                            <span className="text-slate-500 block text-[10px] uppercase font-bold">
                                Hospital
                            </span>
                            <span className="text-slate-200 font-bold">{hospitalName}</span>
                        </div>
                        <div>
                            <span className="text-slate-500 block text-[10px] uppercase font-bold">
                                Policy Applied
                            </span>
                            <span className="text-sky-400 font-mono font-bold">#{policyNum}</span>
                        </div>
                        {coverageLimit !== undefined && (
                            <div>
                                <span className="text-slate-500 block text-[10px] uppercase font-bold">
                                    Coverage Limit
                                </span>
                                <span className="text-slate-300">{currency(coverageLimit)}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-4 backdrop-blur-xl">
                    <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                        <Activity className="w-4 h-4 text-sky-400" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                            Medical Procedure
                        </h3>
                    </div>
                    <div className="space-y-2 text-xs">
                        <div>
                            <span className="text-slate-500 block text-[10px] uppercase font-bold">
                                Treatment
                            </span>
                            <span className="text-slate-200 font-bold">{claim.treatment}</span>
                        </div>
                        <div>
                            <span className="text-slate-500 block text-[10px] uppercase font-bold">
                                Procedure Date
                            </span>
                            <span className="text-slate-300">{formatDate(claim.treatmentDate)}</span>
                        </div>
                        <div>
                            <span className="text-slate-500 block text-[10px] uppercase font-bold">
                                Claimed Amount
                            </span>
                            <span className="text-xl font-extrabold text-sky-400">
                                {currency(claim.claimAmount)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Members see the eligibility checklist, not the internal fraud score. */}
                <ValidationChecklist validationResults={claim.validationResults} />
            </div>

            {/* Diagnosis notes */}
            {claim.description && (
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Diagnosis & Clinical Notes
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                        {claim.description}
                    </p>
                </div>
            )}

            {/* Officer decisions */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-xl space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
                    <Gavel className="w-5 h-5 text-sky-400" />
                    <div>
                        <h3 className="text-lg font-bold text-slate-100">Review Decisions</h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Official outcomes recorded by the insurance officer handling your claim
                        </p>
                    </div>
                </div>

                {!approvalRecords || approvalRecords.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-2">
                        No decision has been issued yet. Your claim is still moving through review.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {approvalRecords.map((rec) => (
                            <div
                                key={rec._id}
                                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5 text-xs"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <StatusBadge status={rec.decision} />
                                    <span className="text-slate-500 text-[10px] font-mono">
                                        {rec.decidedAt ? new Date(rec.decidedAt).toLocaleString() : ""}
                                    </span>
                                </div>
                                {rec.remarks && (
                                    <p className="text-slate-400 pt-1 italic">&ldquo;{rec.remarks}&rdquo;</p>
                                )}
                                {rec.officerId?.name && (
                                    <p className="text-[10px] text-slate-500">
                                        Reviewed by {rec.officerId.name}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Documents */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-xl space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
                    <File className="w-5 h-5 text-sky-400" />
                    <div>
                        <h3 className="text-lg font-bold text-slate-100">Supporting Documents</h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Records the hospital attached to support this claim
                        </p>
                    </div>
                </div>

                {documents.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-2">
                        No documents have been attached to this claim.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {documents.map((doc) => (
                            <div
                                key={doc._id}
                                className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-colors"
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                                        <File className="w-5 h-5" />
                                    </div>
                                    <div className="truncate">
                                        <div className="text-xs font-semibold text-slate-200 capitalize truncate">
                                            {doc.documentType}
                                        </div>
                                        <div className="text-[10px] text-slate-500">
                                            Uploaded {formatDate(doc.uploadedAt ?? doc.createdAt)}
                                        </div>
                                    </div>
                                </div>
                                <a
                                    href={documentUrl(doc)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="shrink-0 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-bold transition-colors"
                                >
                                    View
                                </a>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PolicyholderClaimDetails;
