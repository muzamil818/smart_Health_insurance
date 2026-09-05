import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    PlusCircle,
    ArrowLeft,
    CheckCircle2,
    AlertCircle,
    Upload,
    FileText,
    User,
    Shield,
    DollarSign,
    Calendar,
    Stethoscope
} from "lucide-react";
import { createClaim, uploadClaimDocument } from "../../services/claimService";
import { getPolicies, getPolicyholders, type PolicyItem, type PolicyholderUser } from "../../services/hospitalService";

const SubmitClaim = () => {
    const navigate = useNavigate();

    // Form state
    const [policyholders, setPolicyholders] = useState<PolicyholderUser[]>([]);
    const [policies, setPolicies] = useState<PolicyItem[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    const [selectedPolicyholderId, setSelectedPolicyholderId] = useState("");
    const [selectedPolicyId, setSelectedPolicyId] = useState("");
    const [treatment, setTreatment] = useState("");
    const [treatmentDate, setTreatmentDate] = useState(new Date().toISOString().substring(0, 10));
    const [claimAmount, setClaimAmount] = useState<string>("");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState<File | null>(null);

    // Submission states
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [createdClaimId, setCreatedClaimId] = useState<string | null>(null);

    useEffect(() => {
        const loadFormData = async () => {
            setLoadingData(true);
            const [holders, pols] = await Promise.all([
                getPolicyholders(),
                getPolicies(),
            ]);
            setPolicyholders(holders);
            setPolicies(pols);

            if (holders.length > 0) setSelectedPolicyholderId(holders[0]._id);
            if (pols.length > 0) setSelectedPolicyId(pols[0]._id);
            setLoadingData(false);
        };

        loadFormData();
    }, []);

    // Filter policies for selected policyholder if available
    const availablePolicies = policies.filter(p => {
        if (!selectedPolicyholderId) return true;
        if (p.policyholderId) {
            return String(p.policyholderId._id) === String(selectedPolicyholderId);
        }
        return true;
    });

    const isValidObjectId = (str: string) => /^[0-9a-fA-F]{24}$/.test(str);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        setSuccessMsg(null);

        // Client-side validations
        if (!selectedPolicyholderId) {
            setErrorMsg("Please select or enter a registered policyholder/patient.");
            return;
        }
        if (!isValidObjectId(selectedPolicyholderId)) {
            setErrorMsg("Invalid Policyholder ID format. Please select a registered policyholder from the dropdown or enter a valid 24-character ID.");
            return;
        }

        if (!selectedPolicyId) {
            setErrorMsg("Please select or enter an active policy.");
            return;
        }
        if (!isValidObjectId(selectedPolicyId)) {
            setErrorMsg("Invalid Policy ID format. Please select a valid insurance policy from the dropdown or enter a valid 24-character Policy ID.");
            return;
        }

        if (!treatment.trim()) {
            setErrorMsg("Please enter the treatment type.");
            return;
        }
        if (!treatmentDate) {
            setErrorMsg("Please select the treatment date.");
            return;
        }
        const numericAmount = parseFloat(claimAmount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            setErrorMsg("Please enter a valid claim amount greater than $0.");
            return;
        }

        setSubmitting(true);

        try {
            const res = await createClaim({
                policyholderId: selectedPolicyholderId,
                policyId: selectedPolicyId,
                treatment: treatment.trim(),
                treatmentDate,
                claimAmount: numericAmount,
                description: description.trim(),
            });

            if (res.error || !res.claim) {
                setErrorMsg(res.error || res.message || "Failed to submit claim.");
                setSubmitting(false);
                return;
            }

            const claimId = res.claim._id;
            setCreatedClaimId(claimId);

            // Upload supporting document if selected
            if (file && claimId) {
                await uploadClaimDocument(claimId, file);
            }

            setSuccessMsg("Claim submitted successfully! Fraud risk assessment and review process initiated.");
            setSubmitting(false);
        } catch (err: any) {
            setErrorMsg(err.message || "An unexpected error occurred.");
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <Link
                        to="/hospital"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors mb-1"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Dashboard</span>
                    </Link>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">
                        Submit Medical Claim
                    </h1>
                    <p className="text-xs text-slate-400">
                        Enter patient, policy, treatment, and financial details to submit a new claim to the insurance network.
                    </p>
                </div>
            </div>

            {/* Success Message Banner */}
            {successMsg && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 space-y-4 animate-fadeIn">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-emerald-300">Claim Submitted Successfully</h3>
                            <p className="text-xs text-slate-300">{successMsg}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        {createdClaimId && (
                            <Link
                                to={`/hospital/claims/${createdClaimId}`}
                                className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20"
                            >
                                View Claim Details
                            </Link>
                        )}
                        <button
                            onClick={() => {
                                setSuccessMsg(null);
                                setCreatedClaimId(null);
                                setTreatment("");
                                setClaimAmount("");
                                setDescription("");
                                setFile(null);
                            }}
                            className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 text-xs font-semibold hover:bg-slate-800"
                        >
                            Submit Another Claim
                        </button>
                    </div>
                </div>
            )}

            {/* Error Message Banner */}
            {errorMsg && (
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex items-center gap-3 text-rose-300 text-xs font-medium animate-fadeIn">
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    <span>{errorMsg}</span>
                </div>
            )}

            {/* Main Form */}
            {!successMsg && (
                <form onSubmit={handleSubmit} className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 md:p-8 backdrop-blur-xl space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Policyholder Selection */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                                <span className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-emerald-400" /> Patient / Policyholder *
                                </span>
                            </label>
                            {loadingData ? (
                                <div className="w-full py-2.5 px-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-500">
                                    Loading policyholders...
                                </div>
                            ) : policyholders.length > 0 ? (
                                <select
                                    value={selectedPolicyholderId}
                                    onChange={(e) => setSelectedPolicyholderId(e.target.value)}
                                    className="w-full py-2.5 px-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
                                >
                                    <option value="">-- Select Registered Policyholder --</option>
                                    {policyholders.map((p) => (
                                        <option key={p._id} value={p._id}>
                                            {p.name} ({p.email})
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <div className="space-y-1">
                                    <input
                                        type="text"
                                        placeholder="Enter 24-char Policyholder ObjectId"
                                        value={selectedPolicyholderId}
                                        onChange={(e) => setSelectedPolicyholderId(e.target.value)}
                                        className="w-full py-2.5 px-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                                    />
                                    <p className="text-[10px] text-amber-400">No policyholders registered yet. Create a policyholder account first.</p>
                                </div>
                            )}
                        </div>

                        {/* Policy Selection */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                                <span className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-emerald-400" /> Insurance Policy *
                                </span>
                            </label>
                            {loadingData ? (
                                <div className="w-full py-2.5 px-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-500">
                                    Loading policies...
                                </div>
                            ) : availablePolicies.length > 0 ? (
                                <select
                                    value={selectedPolicyId}
                                    onChange={(e) => setSelectedPolicyId(e.target.value)}
                                    className="w-full py-2.5 px-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
                                >
                                    <option value="">-- Select Active Policy --</option>
                                    {availablePolicies.map((pol) => (
                                        <option key={pol._id} value={pol._id}>
                                            Policy #{pol.policyNumber} (Limit: ${pol.coverageLimit?.toLocaleString()})
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <div className="space-y-1">
                                    <input
                                        type="text"
                                        placeholder="Enter 24-char Policy ObjectId"
                                        value={selectedPolicyId}
                                        onChange={(e) => setSelectedPolicyId(e.target.value)}
                                        className="w-full py-2.5 px-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                                    />
                                    <p className="text-[10px] text-amber-400">No policies found for this user in database.</p>
                                </div>
                            )}
                        </div>

                        {/* Treatment Type */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                                <span className="flex items-center gap-2">
                                    <Stethoscope className="w-4 h-4 text-emerald-400" /> Treatment / Procedure *
                                </span>
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Cardiology Consultation, MRI Scan, Appendectomy"
                                value={treatment}
                                onChange={(e) => setTreatment(e.target.value)}
                                className="w-full py-2.5 px-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                            />
                        </div>

                        {/* Treatment Date */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                                <span className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-emerald-400" /> Treatment Date *
                                </span>
                            </label>
                            <input
                                type="date"
                                value={treatmentDate}
                                onChange={(e) => setTreatmentDate(e.target.value)}
                                className="w-full py-2.5 px-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
                            />
                        </div>

                        {/* Claim Amount */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                                <span className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-emerald-400" /> Claim Amount (USD $) *
                                </span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-2.5 text-slate-500 font-bold">$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={claimAmount}
                                    onChange={(e) => setClaimAmount(e.target.value)}
                                    className="w-full py-2.5 pl-8 pr-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                                />
                            </div>
                        </div>

                        {/* Description / Diagnosis */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                                Diagnosis / Medical Description
                            </label>
                            <textarea
                                rows={3}
                                placeholder="Provide clinical details, diagnosis summaries, or additional notes..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full py-2.5 px-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                            />
                        </div>

                        {/* Supporting Document Upload */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                                Attach Supporting Document (Bills, Medical Reports, Receipts)
                            </label>
                            <div className="border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 text-center bg-slate-950/40 transition-colors">
                                <input
                                    type="file"
                                    id="file-upload"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    className="hidden"
                                />
                                <label htmlFor="file-upload" className="cursor-pointer space-y-2 block">
                                    <Upload className="w-8 h-8 text-emerald-400 mx-auto" />
                                    <div className="text-xs text-slate-300 font-semibold">
                                        {file ? file.name : "Click to browse and upload medical documents"}
                                    </div>
                                    <p className="text-[10px] text-slate-500">PDF, PNG, JPG files up to 10MB</p>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-800">
                        <button
                            type="button"
                            onClick={() => navigate("/hospital")}
                            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all cursor-pointer"
                        >
                            {submitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                                    <span>Submitting Claim...</span>
                                </>
                            ) : (
                                <>
                                    <PlusCircle className="w-4 h-4" />
                                    <span>Submit Claim</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default SubmitClaim;
