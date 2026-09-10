import { useEffect, useMemo, useState } from "react";
import { Activity, Search, RefreshCw, ScrollText } from "lucide-react";
import { getAuditLogs, type AuditLogItem } from "../../services/adminService";

/** Colour-codes a log line by the kind of event it records. */
const dotFor = (action: string) => {
    const a = action.toLowerCase();
    if (a.includes("approved")) return "bg-emerald-400";
    if (a.includes("rejected")) return "bg-rose-400";
    if (a.includes("fraud score")) return "bg-amber-400";
    if (a.includes("additional information")) return "bg-amber-400";
    if (a.includes("submitted")) return "bg-sky-400";
    return "bg-cyan-400";
};

const AdminAuditLogs = () => {
    const [logs, setLogs] = useState<AuditLogItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");

    const fetchLogs = async () => {
        setLoading(true);
        setLogs(await getAuditLogs());
        setLoading(false);
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return logs;
        return logs.filter(
            (log) =>
                log.action.toLowerCase().includes(q) ||
                (log.userId?.name ?? "").toLowerCase().includes(q) ||
                (log.userId?.role ?? "").toLowerCase().includes(q)
        );
    }, [logs, query]);

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-3">
                        <Activity className="w-8 h-8 text-cyan-400" />
                        Security Audit Trail
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                        Immutable record of every claim submission, document upload, automated fraud
                        evaluation, and officer decision. Showing the 200 most recent events.
                    </p>
                </div>

                <button
                    onClick={fetchLogs}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-800 text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer shrink-0"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    <span>Refresh</span>
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Filter by action, user, or role..."
                    className="w-full py-2 pl-9 pr-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                />
            </div>

            {/* Log stream */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-xl">
                {loading ? (
                    <div className="py-16 text-center text-slate-400 text-sm">
                        <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <span>Loading audit stream...</span>
                    </div>
                ) : visible.length === 0 ? (
                    <div className="py-16 text-center text-slate-400 space-y-2">
                        <ScrollText className="w-12 h-12 text-slate-600 mx-auto" />
                        <p className="text-sm font-semibold text-slate-300">
                            {logs.length === 0 ? "No audit events recorded yet" : "No events match your filter"}
                        </p>
                        <p className="text-xs text-slate-500">
                            {logs.length === 0
                                ? "Events are written automatically as claims move through the system."
                                : "Try a different search term."}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            <span>Event</span>
                            <span>Timestamp</span>
                        </div>

                        {visible.map((log) => (
                            <div
                                key={log._id}
                                className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                            >
                                <div className="flex items-start gap-3 min-w-0">
                                    <div
                                        className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${dotFor(log.action)}`}
                                    />
                                    <div className="min-w-0">
                                        <span className="font-semibold text-slate-200 break-words">
                                            {log.action}
                                        </span>
                                        <div className="text-[10px] text-slate-500 mt-0.5">
                                            by {log.userId?.name || "System"}
                                            {log.userId?.role && (
                                                <span className="ml-1.5 px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase font-bold">
                                                    {log.userId.role}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-[10px] text-slate-500 font-mono shrink-0 sm:text-right">
                                    {log.createdAt ? new Date(log.createdAt).toLocaleString() : ""}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminAuditLogs;
