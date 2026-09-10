import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Eye, Search } from "lucide-react";
import { getMyClaims } from "../../services/policyholderService";
import type { Claim, ClaimStatus } from "../../services/claimService";
import { StatusBadge, statusLabel } from "../../components/ClaimVisuals";

const currency = (n?: number) => `$${(n ?? 0).toLocaleString()}`;

const FILTERS: Array<{ key: "all" | ClaimStatus; label: string }> = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "under_review", label: "Under Review" },
    { key: "more_information_required", label: "Info Required" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
];

const PolicyholderClaims = () => {
    const [claims, setClaims] = useState<Claim[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | ClaimStatus>("all");
    const [query, setQuery] = useState("");

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setClaims(await getMyClaims());
            setLoading(false);
        };
        load();
    }, []);

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        return claims.filter((c) => {
            if (filter !== "all" && c.status !== filter) return false;
            if (!q) return true;
            const hospital = typeof c.hospitalId === "object" ? c.hospitalId?.name ?? "" : "";
            return (
                c.treatment.toLowerCase().includes(q) ||
                hospital.toLowerCase().includes(q) ||
                c._id.toLowerCase().includes(q)
            );
        });
    }, [claims, filter, query]);

    const countFor = (key: "all" | ClaimStatus) =>
        key === "all" ? claims.length : claims.filter((c) => c.status === key).length;

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-3">
                    <FileText className="w-8 h-8 text-sky-400" />
                    My Claims
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                    Every claim filed against your policy, with its current position in the review workflow.
                </p>
            </div>

            {/* Filters & search */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                    {FILTERS.map((f) => {
                        const active = filter === f.key;
                        return (
                            <button
                                key={f.key}
                                onClick={() => setFilter(f.key)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                    active
                                        ? "bg-sky-500/20 text-sky-400 border-sky-500/30"
                                        : "bg-slate-900/70 text-slate-400 border-slate-800 hover:text-slate-200"
                                }`}
                            >
                                {f.label}
                                <span className="ml-1.5 text-[10px] opacity-70">{countFor(f.key)}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="relative w-full lg:w-72">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search treatment, hospital, ID..."
                        className="w-full py-2 pl-9 pr-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-sky-500 transition-colors"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-xl">
                {loading ? (
                    <div className="py-16 text-center text-slate-400 text-sm">
                        <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <span>Loading your claims...</span>
                    </div>
                ) : visible.length === 0 ? (
                    <div className="py-16 text-center text-slate-400 space-y-2">
                        <FileText className="w-12 h-12 text-slate-600 mx-auto" />
                        <p className="text-sm font-semibold text-slate-300">
                            {claims.length === 0 ? "No claims on your policy yet" : "No claims match this filter"}
                        </p>
                        <p className="text-xs text-slate-500">
                            {claims.length === 0
                                ? "Hospitals submit claims on your behalf after treatment."
                                : `Try selecting "All" or clearing your search.`}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                                    <th className="pb-3 px-3">Claim ID</th>
                                    <th className="pb-3 px-3">Treatment</th>
                                    <th className="pb-3 px-3">Hospital</th>
                                    <th className="pb-3 px-3">Treatment Date</th>
                                    <th className="pb-3 px-3">Amount</th>
                                    <th className="pb-3 px-3">Status</th>
                                    <th className="pb-3 px-3 text-right">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {visible.map((claim) => (
                                    <tr key={claim._id} className="hover:bg-slate-800/40 transition-colors">
                                        <td className="py-4 px-3 font-mono text-slate-300 font-medium">
                                            #{claim._id.substring(claim._id.length - 8)}
                                        </td>
                                        <td className="py-4 px-3 font-bold text-slate-200">{claim.treatment}</td>
                                        <td className="py-4 px-3 text-slate-400">
                                            {typeof claim.hospitalId === "object"
                                                ? claim.hospitalId?.name
                                                : "Hospital"}
                                        </td>
                                        <td className="py-4 px-3 text-slate-400">
                                            {claim.treatmentDate
                                                ? new Date(claim.treatmentDate).toLocaleDateString()
                                                : "—"}
                                        </td>
                                        <td className="py-4 px-3 font-bold text-sky-400">
                                            {currency(claim.claimAmount)}
                                        </td>
                                        <td className="py-4 px-3">
                                            <StatusBadge status={claim.status} />
                                        </td>
                                        <td className="py-4 px-3 text-right">
                                            <Link
                                                to={`/policyholder/claims/${claim._id}`}
                                                title={`View ${statusLabel(claim.status)} claim`}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 font-bold text-[11px] transition-colors"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                <span>View</span>
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

export default PolicyholderClaims;
