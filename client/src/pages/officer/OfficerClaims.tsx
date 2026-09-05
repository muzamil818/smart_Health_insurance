import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    FileCheck,
    Search,
    Filter,
    Clock,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Eye,
    Building2,
    Shield
} from "lucide-react";
import { getOfficerClaims } from "../../services/officerService";
import type { Claim } from "../../services/claimService";

const OfficerClaims = () => {
    const [claims, setClaims] = useState<Claim[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        const fetchClaims = async () => {
            setLoading(true);
            const data = await getOfficerClaims();
            setClaims(data);
            setLoading(false);
        };

        fetchClaims();
    }, []);

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
        return "Hospital Care Facility";
    };

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

    const filteredClaims = claims.filter((claim) => {
        const patientName = getPatientName(claim).toLowerCase();
        const hospitalName = getHospitalName(claim).toLowerCase();
        const treatment = (claim.treatment || "").toLowerCase();
        const claimId = claim._id.toLowerCase();
        const matchesSearch =
            claimId.includes(searchTerm.toLowerCase()) ||
            patientName.includes(searchTerm.toLowerCase()) ||
            hospitalName.includes(searchTerm.toLowerCase()) ||
            treatment.includes(searchTerm.toLowerCase());

        if (statusFilter === "all") return matchesSearch;
        return matchesSearch && claim.status === statusFilter;
    });

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-3">
                    <FileCheck className="w-8 h-8 text-teal-400" />
                    Claim Review Queue
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                    Adjudicate submitted insurance claims, evaluate rule-based risk indicators, and record official approval decisions.
                </p>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                        type="text"
                        placeholder="Search by ID, patient, hospital, treatment..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full py-2 pl-9 pr-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-400">Status:</span>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="py-2 px-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                    >
                        <option value="all">All Statuses ({claims.length})</option>
                        <option value="pending">Pending ({claims.filter(c => c.status === "pending").length})</option>
                        <option value="approved">Approved ({claims.filter(c => c.status === "approved").length})</option>
                        <option value="rejected">Rejected ({claims.filter(c => c.status === "rejected").length})</option>
                        <option value="more_information_required">Info Requested ({claims.filter(c => c.status === "more_information_required").length})</option>
                    </select>
                </div>
            </div>

            {/* Claims Queue Table */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-xl">
                {loading ? (
                    <div className="py-16 text-center text-slate-400 text-sm">
                        <div className="w-6 h-6 border-2 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <span>Loading claims queue...</span>
                    </div>
                ) : filteredClaims.length === 0 ? (
                    <div className="py-16 text-center text-slate-400 space-y-3">
                        <Shield className="w-12 h-12 text-slate-600 mx-auto" />
                        <p className="text-base font-semibold text-slate-300">No Matching Claims Found</p>
                        <p className="text-xs text-slate-500">Try adjusting your search query or filter selection.</p>
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
                                    <th className="pb-3 px-3">Date</th>
                                    <th className="pb-3 px-3">Status</th>
                                    <th className="pb-3 px-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {filteredClaims.map((claim) => (
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
                                        <td className="py-4 px-3 text-slate-400">
                                            {claim.treatmentDate ? new Date(claim.treatmentDate).toLocaleDateString() : "N/A"}
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

export default OfficerClaims;
