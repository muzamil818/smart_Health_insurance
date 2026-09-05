import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
    ArrowLeft,
    FileText,
    Shield,
    User,
    Calendar,
    DollarSign,
    CheckCircle2,
    XCircle,
    Clock,
    AlertTriangle,
    Upload,
    File,
    Activity,
    Lock
} from "lucide-react";
import { getClaimById, uploadClaimDocument, type ClaimDetailResponse } from "../../services/claimService";

const ClaimDetails = () => {
    const { id } = useParams<{ id: string }>();
    const [detail, setDetail] = useState<ClaimDetailResponse | null>(null);
    const [loading, setLoading] = useState(true);

    // Document upload state
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!id) return;
            setLoading(true);
            const data = await getClaimById(id);
            setDetail(data);
            setLoading(false);
        };

        fetchDetails();
    }, [id]);

    const handleUploadDoc = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile || !id) return;

        setUploading(true);
        setUploadError(null);
        setUploadSuccess(null);

        const res = await uploadClaimDocument(id, selectedFile);
        if (res.error) {
            setUploadError(res.error);
        } else {
            setUploadSuccess("Document uploaded successfully!");
            setSelectedFile(null);
            // Refresh details
            const updated = await getClaimById(id);
            if (updated) setDetail(updated);
        }
        setUploading(false);
    };

    const getStatusBadge = (status?: string) => {
        switch (status) {
            case "approved":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-4 h-4" /> Approved
                    </span>
                );
            case "rejected":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                        <XCircle className="w-4 h-4" /> Rejected
                    </span>
                );
            case "more_information_required":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        <AlertTriangle className="w-4 h-4" /> Info Required
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30">
                        <Clock className="w-4 h-4" /> Under Review
                    </span>
                );
        }
    };

    const getRiskLevelBadge = (level?: string, score?: number) => {
        if (!level && score === undefined) {
            return <span className="text-xs text-slate-500">Evaluation Pending</span>;
        }
        if (level === "low" || (score !== undefined && score < 30)) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Low Risk ({score ?? 15}%)
                </span>
            );
        }
        if (level === "medium" || (score !== undefined && score < 70)) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    Medium Risk ({score ?? 50}%)
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                High Risk ({score ?? 85}%)
            </span>
        );
    };

    if (loading) {
        return (
            <div className="py-24 text-center text-slate-400 text-sm">
                <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <span>Loading claim details...</span>
            </div>
        );
    }

    if (!detail || !detail.claim) {
        return (
            <div className="max-w-md mx-auto py-16 text-center space-y-4">
                <FileText className="w-12 h-12 text-slate-600 mx-auto" />
                <h2 className="text-xl font-bold text-slate-200">Claim Not Found</h2>
                <p className="text-xs text-slate-400">
                    The requested claim record could not be located or you do not have permission to view it.
                </p>
                <Link
                    to="/hospital/claims"
                    className="inline-block px-4 py-2 rounded-xl bg-slate-800 text-emerald-400 font-bold text-xs"
                >
                    Return to Claims List
                </Link>
            </div>
        );
    }

    const { claim, documents, fraudScore, approvalRecords } = detail;
    const patientName = typeof claim.policyholderId === "object" ? claim.policyholderId?.name : "Patient";
    const patientEmail = typeof claim.policyholderId === "object" ? claim.policyholderId?.email : "N/A";
    const policyNum = typeof claim.policyId === "object" ? claim.policyId?.policyNumber : "N/A";

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
            {/* Header / Back Link */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
                <div className="space-y-1">
                    <Link
                        to="/hospital/claims"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors mb-1"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to All Claims</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-mono">
                            Claim #{claim._id.substring(claim._id.length - 8)}
                        </h1>
                        {getStatusBadge(claim.status)}
                    </div>
                </div>

                <div className="text-right">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Submitted On</span>
                    <span className="text-xs font-semibold text-slate-300">
                        {claim.submittedAt ? new Date(claim.submittedAt).toLocaleDateString() : "N/A"}
                    </span>
                </div>
            </div>

            {/* Information Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Patient & Policy Info */}
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-4 backdrop-blur-xl">
                    <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                        <User className="w-4 h-4 text-emerald-400" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Patient Details</h3>
                    </div>
                    <div className="space-y-2 text-xs">
                        <div>
                            <span className="text-slate-500 block text-[10px] uppercase font-bold">Patient Name</span>
                            <span className="text-slate-200 font-bold">{patientName}</span>
                        </div>
                        <div>
                            <span className="text-slate-500 block text-[10px] uppercase font-bold">Contact Email</span>
                            <span className="text-slate-300">{patientEmail}</span>
                        </div>
                        <div>
                            <span className="text-slate-500 block text-[10px] uppercase font-bold">Policy Number</span>
                            <span className="text-emerald-400 font-mono font-bold">#{policyNum}</span>
                        </div>
                    </div>
                </div>

                {/* Treatment Summary */}
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-4 backdrop-blur-xl">
                    <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                        <Activity className="w-4 h-4 text-emerald-400" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Medical Procedure</h3>
                    </div>
                    <div className="space-y-2 text-xs">
                        <div>
                            <span className="text-slate-500 block text-[10px] uppercase font-bold">Treatment</span>
                            <span className="text-slate-200 font-bold">{claim.treatment}</span>
                        </div>
                        <div>
                            <span className="text-slate-500 block text-[10px] uppercase font-bold">Procedure Date</span>
                            <span className="text-slate-300">{claim.treatmentDate ? new Date(claim.treatmentDate).toLocaleDateString() : "N/A"}</span>
                        </div>
                        <div>
                            <span className="text-slate-500 block text-[10px] uppercase font-bold">Claimed Amount</span>
                            <span className="text-xl font-extrabold text-emerald-400">${claim.claimAmount?.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* AI Fraud Score */}
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-4 backdrop-blur-xl">
                    <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                        <Shield className="w-4 h-4 text-emerald-400" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Fraud Assessment</h3>
                    </div>
                    <div className="space-y-3 text-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-bold uppercase text-[10px]">Risk Score:</span>
                            {getRiskLevelBadge(fraudScore?.riskLevel, fraudScore?.overallRiskScore)}
                        </div>

                        {fraudScore?.anomalyFlags && fraudScore.anomalyFlags.length > 0 ? (
                            <div className="space-y-1">
                                <span className="text-slate-500 text-[10px] font-bold uppercase">Flags Identified:</span>
                                <ul className="space-y-1">
                                    {fraudScore.anomalyFlags.map((flag, idx) => (
                                        <li key={idx} className="text-[11px] text-amber-400 flex items-center gap-1.5">
                                            <AlertTriangle className="w-3 h-3 shrink-0" />
                                            <span>{flag}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <p className="text-[11px] text-slate-400 italic">No suspicious anomalies detected in automated screening.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Description & Clinical Notes */}
            {claim.description && (
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Diagnosis & Notes</h3>
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{claim.description}</p>
                </div>
            )}

            {/* Officer Decisions / Approval Records */}
            {approvalRecords && approvalRecords.length > 0 && (
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl space-y-4">
                    <h3 className="text-sm font-bold text-slate-200">Insurance Officer Review Notes</h3>
                    <div className="space-y-3">
                        {approvalRecords.map((rec) => (
                            <div key={rec._id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-slate-200">
                                        Officer Decision: <span className="uppercase text-emerald-400">{rec.decision.replace(/_/g, " ")}</span>
                                    </span>
                                    <span className="text-slate-500 text-[10px]">
                                        {rec.decidedAt ? new Date(rec.decidedAt).toLocaleString() : ""}
                                    </span>
                                </div>
                                {rec.remarks && <p className="text-slate-400 pt-1">"{rec.remarks}"</p>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Documents Section */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-xl space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-slate-100">Claim Documents</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Attached medical bills, receipts, and clinical records</p>
                    </div>
                </div>

                {documents.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-4">No documents uploaded for this claim yet.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {documents.map((doc) => (
                            <div key={doc._id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-colors">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                                        <File className="w-5 h-5" />
                                    </div>
                                    <div className="truncate">
                                        <div className="text-xs font-semibold text-slate-200 truncate">{doc.fileName}</div>
                                        <div className="text-[10px] text-slate-500">
                                            Uploaded {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : "recently"}
                                        </div>
                                    </div>
                                </div>
                                <a
                                    href={`http://localhost:5000/${doc.filePath}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold transition-colors"
                                >
                                    View
                                </a>
                            </div>
                        ))}
                    </div>
                )}

                {/* Upload New Document Form */}
                <div className="pt-4 border-t border-slate-800/80 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        Upload Additional Document
                    </h4>

                    {uploadSuccess && (
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 font-semibold">
                            {uploadSuccess}
                        </div>
                    )}
                    {uploadError && (
                        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 font-semibold">
                            {uploadError}
                        </div>
                    )}

                    <form onSubmit={handleUploadDoc} className="flex flex-col sm:flex-row items-center gap-3">
                        <input
                            type="file"
                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                            className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-emerald-400 hover:file:bg-slate-700 cursor-pointer"
                        />
                        <button
                            type="submit"
                            disabled={!selectedFile || uploading}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 disabled:opacity-50 transition-all shrink-0 cursor-pointer"
                        >
                            <Upload className="w-4 h-4" />
                            <span>{uploading ? "Uploading..." : "Upload File"}</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ClaimDetails;
