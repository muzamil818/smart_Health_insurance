import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
    ArrowLeft,
    User,
    CheckCircle2,
    AlertTriangle,
    FileText,
    Activity,
    RefreshCw,
} from "lucide-react";
import {
    getClaimById,
    documentUrl,
    type ClaimDetailResponse,
} from "../../services/claimService";
import { StatusBadge, FraudScoreCard, ValidationChecklist } from "../../components/ClaimVisuals";
import { approveClaim, rejectClaim, requestInformation, recalculateFraudScore } from "../../services/officerService";

const OfficerClaimReview = () => {
    const { id } = useParams<{ id: string }>();
    const [detail, setDetail] = useState<ClaimDetailResponse | null>(null);
    const [loading, setLoading] = useState(true);

    // Decision form state
    const [remarks, setRemarks] = useState("");
    const [submittingDecision, setSubmittingDecision] = useState(false);
    const [actionMsg, setActionMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Fraud recalculate state
    const [recalculating, setRecalculating] = useState(false);

    const fetchDetails = async () => {
        if (!id) return;
        setLoading(true);
        const data = await getClaimById(id);
        setDetail(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchDetails();
    }, [id]);

    const handleDecision = async (decisionType: "approved" | "rejected" | "more_information_required") => {
        if (!id) return;
        setSubmittingDecision(true);
        setActionMsg(null);

        let res;
        if (decisionType === "approved") {
            res = await approveClaim(id, remarks);
        } else if (decisionType === "rejected") {
            res = await rejectClaim(id, remarks);
        } else {
            res = await requestInformation(id, remarks);
        }

        if (res.error) {
            setActionMsg({ type: "error", text: res.error });
        } else {
            setActionMsg({ type: "success", text: `Claim marked as ${decisionType.replace(/_/g, " ")} successfully.` });
            setRemarks("");
            await fetchDetails();
        }
        setSubmittingDecision(false);
    };

    const handleRecalculateFraud = async () => {
        if (!id) return;
        setRecalculating(true);
        const res = await recalculateFraudScore(id);
        if (res.error) {
            setActionMsg({ type: "error", text: res.error });
        } else {
            setActionMsg({ type: "success", text: "Fraud score recalculated using current rule engine." });
            await fetchDetails();
        }
        setRecalculating(false);
    };

    if (loading) {
        return (
            <div className="py-24 text-center text-slate-400 text-sm">
                <div className="w-6 h-6 border-2 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <span>Loading claim adjudication details...</span>
            </div>
        );
    }

    if (!detail || !detail.claim) {
        return (
            <div className="max-w-md mx-auto py-16 text-center space-y-4">
                <FileText className="w-12 h-12 text-slate-600 mx-auto" />
                <h2 className="text-xl font-bold text-slate-200">Claim Not Found</h2>
                <Link to="/officer/claims" className="inline-block px-4 py-2 rounded-xl bg-slate-800 text-teal-400 text-xs font-bold">
                    Return to Review Queue
                </Link>
            </div>
        );
    }

    const { claim, documents, fraudScore } = detail;
    const patientName = typeof claim.policyholderId === "object" ? claim.policyholderId?.name : "Patient";
    const hospitalName = typeof claim.hospitalId === "object" ? claim.hospitalId?.name : "Hospital Care Facility";
    const policyNum = typeof claim.policyId === "object" ? claim.policyId?.policyNumber : "N/A";
    const policyLimit = typeof claim.policyId === "object" ? claim.policyId?.coverageLimit : undefined;

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
                <div className="space-y-1">
                    <Link
                        to="/officer/claims"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors mb-1"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Review Queue</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-mono">
                            Claim #{claim._id.substring(claim._id.length - 8)}
                        </h1>
                        <StatusBadge status={claim.status} size="md" />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleRecalculateFraud}
                        disabled={recalculating}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 text-teal-400 ${recalculating ? "animate-spin" : ""}`} />
                        <span>Recalculate Fraud Score</span>
                    </button>
                </div>
            </div>

            {/* Notification Banner */}
            {actionMsg && (
                <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-3 animate-fadeIn ${
                    actionMsg.type === "success"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                        : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                }`}>
                    {actionMsg.type === "success" ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertTriangle className="w-5 h-5 text-rose-400" />}
                    <span>{actionMsg.text}</span>
                </div>
            )}

            {/* Automated decision support: fraud score and eligibility validation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FraudScoreCard fraudScore={fraudScore} />
                <ValidationChecklist validationResults={claim.validationResults} />
            </div>

            {/* Information Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Patient & Hospital Info */}
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-4 backdrop-blur-xl">
                    <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                        <User className="w-4 h-4 text-teal-400" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Patient & Hospital</h3>
                    </div>
                    <div className="space-y-2 text-xs">
                        <div>
                            <span className="text-slate-500 block text-[10px] uppercase font-bold">Patient Name</span>
                            <span className="text-slate-200 font-bold">{patientName}</span>
                        </div>
                        <div>
                            <span className="text-slate-500 block text-[10px] uppercase font-bold">Hospital Care Provider</span>
                            <span className="text-slate-300 font-semibold">{hospitalName}</span>
                        </div>
                        <div>
                            <span className="text-slate-500 block text-[10px] uppercase font-bold">Policy Number</span>
                            <span className="text-teal-400 font-mono font-bold">#{policyNum}</span>
                        </div>
                    </div>
                </div>

                {/* Treatment & Financial Summary */}
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-4 backdrop-blur-xl">
                    <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                        <Activity className="w-4 h-4 text-teal-400" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Procedure & Financials</h3>
                    </div>
                    <div className="space-y-2 text-xs">
                        <div>
                            <span className="text-slate-500 block text-[10px] uppercase font-bold">Treatment</span>
                            <span className="text-slate-200 font-bold">{claim.treatment}</span>
                        </div>
                        <div>
                            <span className="text-slate-500 block text-[10px] uppercase font-bold">Claimed Amount</span>
                            <span className="text-xl font-extrabold text-emerald-400">${claim.claimAmount?.toLocaleString()}</span>
                        </div>
                        {policyLimit && (
                            <div>
                                <span className="text-slate-500 block text-[10px] uppercase font-bold">Policy Coverage Limit</span>
                                <span className="text-slate-300 font-bold">${policyLimit.toLocaleString()}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Attached Documents */}
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-4 backdrop-blur-xl">
                    <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                        <FileText className="w-4 h-4 text-teal-400" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Supporting Records</h3>
                    </div>
                    {documents.length === 0 ? (
                        <p className="text-xs text-slate-500 italic">No medical records attached.</p>
                    ) : (
                        <div className="space-y-2">
                            {documents.map((doc) => (
                                <div key={doc._id} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-xs">
                                    <span className="truncate text-slate-300 capitalize">{doc.documentType}</span>
                                    <a
                                        href={documentUrl(doc)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-teal-400 font-bold text-[11px] hover:underline shrink-0 ml-2"
                                    >
                                        View
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Official Adjudication Decision Form */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 md:p-8 backdrop-blur-xl space-y-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-100">Official Adjudication Decision</h3>
                    <p className="text-xs text-slate-400 mt-1">
                        Select your decision action and log official remarks for audit recording.
                    </p>
                </div>

                <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                        Officer Review Remarks / Notes
                    </label>
                    <textarea
                        rows={3}
                        placeholder="Enter adjudication rationale, approval notes, or specific documents requested..."
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        className="w-full py-2.5 px-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500 transition-colors resize-none"
                    />
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                    <button
                        type="button"
                        disabled={submittingDecision}
                        onClick={() => handleDecision("more_information_required")}
                        className="px-5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                    >
                        Request Info
                    </button>
                    <button
                        type="button"
                        disabled={submittingDecision}
                        onClick={() => handleDecision("rejected")}
                        className="px-5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                    >
                        Reject Claim
                    </button>
                    <button
                        type="button"
                        disabled={submittingDecision}
                        onClick={() => handleDecision("approved")}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all cursor-pointer"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve Claim</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OfficerClaimReview;
