import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    Users,
    Building2,
    FileText,
    Shield,
    Activity,
    AlertTriangle,
    ArrowRight,
    CheckCircle2,
    Clock,
    XCircle,
    PlusCircle
} from "lucide-react";
import { getAdminReports, getAuditLogs, AdminReportData, AuditLogItem } from "../../services/adminService";

const AdminDashboard = () => {
    const [reports, setReports] = useState<AdminReportData | null>(null);
    const [logs, setLogs] = useState<AuditLogItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAdminData = async () => {
            setLoading(true);
            const [repData, auditData] = await Promise.all([
                getAdminReports(),
                getAuditLogs(),
            ]);
            setReports(repData);
            setLogs(auditData);
            setLoading(false);
        };

        loadAdminData();
    }, []);

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 p-6 md:p-8 border border-slate-800 shadow-2xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                            <Shield className="w-3.5 h-3.5" />
                            <span>System Administration</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-100">
                            Super Admin Overview
                        </h1>
                        <p className="text-slate-400 text-sm max-w-2xl">
                            Monitor system entities, register hospital facilities, manage user accounts, assign insurance policies, and inspect real-time security audit trails.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            to="/admin/users"
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-bold transition-all"
                        >
                            <Users className="w-4 h-4 text-cyan-400" />
                            <span>Manage Users</span>
                        </Link>
                        <Link
                            to="/admin/hospitals"
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20"
                        >
                            <Building2 className="w-4 h-4" />
                            <span>Manage Hospitals</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Entity Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total System Users</span>
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                            <Users className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-baseline justify-between">
                        <span className="text-3xl font-extrabold text-cyan-400">{loading ? "..." : reports?.users ?? 0}</span>
                        <span className="text-xs text-slate-500">Accounts</span>
                    </div>
                </div>

                <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hospital Facilities</span>
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                            <Building2 className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-baseline justify-between">
                        <span className="text-3xl font-extrabold text-emerald-400">{loading ? "..." : reports?.hospitals ?? 0}</span>
                        <span className="text-xs text-slate-500">Providers</span>
                    </div>
                </div>

                <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Policies</span>
                        <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                            <FileText className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-baseline justify-between">
                        <span className="text-3xl font-extrabold text-teal-400">{loading ? "..." : reports?.policies ?? 0}</span>
                        <span className="text-xs text-slate-500">Policies</span>
                    </div>
                </div>

                <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Claims Processed</span>
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                            <Activity className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-baseline justify-between">
                        <span className="text-3xl font-extrabold text-slate-100">{loading ? "..." : reports?.claims ?? 0}</span>
                        <span className="text-xs text-amber-400 font-semibold">{reports?.highRiskScores ?? 0} High Risk</span>
                    </div>
                </div>
            </div>

            {/* Audit Logs Stream */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-xl space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-100">Live Security Audit Log</h2>
                        <p className="text-xs text-slate-400 mt-1">Real-time system events, administrative changes, and user actions</p>
                    </div>
                    <Link
                        to="/admin/audit-logs"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                        <span>View Full Log</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {loading ? (
                    <div className="py-12 text-center text-slate-400 text-sm">
                        <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <span>Loading audit stream...</span>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs italic">No security audit logs recorded yet.</div>
                ) : (
                    <div className="space-y-2.5">
                        {logs.slice(0, 6).map((log) => (
                            <div key={log._id} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-cyan-400" />
                                    <div>
                                        <span className="font-bold text-slate-200">{log.action}</span>
                                        <span className="text-slate-500 ml-2">by {log.userId?.name || "System"}</span>
                                    </div>
                                </div>
                                <span className="text-[10px] text-slate-500 font-mono">
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

export default AdminDashboard;
