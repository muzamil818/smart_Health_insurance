import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, CheckCircle2, AlertTriangle, Clock, ShieldAlert, ArrowRight, Check } from "lucide-react";
import { getNotifications, markNotificationRead, type NotificationItem } from "../../services/notificationService";

const HospitalNotifications = () => {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifs = async () => {
            setLoading(true);
            const data = await getNotifications();
            setNotifications(data);
            setLoading(false);
        };

        fetchNotifs();
    }, []);

    const handleMarkRead = async (id: string) => {
        const success = await markNotificationRead(id);
        if (success) {
            setNotifications((prev) =>
                prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
            );
        }
    };

    const handleMarkAllRead = async () => {
        const unread = notifications.filter((n) => !n.isRead);
        for (const n of unread) {
            await markNotificationRead(n._id);
        }
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    };

    const getIcon = (message: string) => {
        const lower = message.toLowerCase();
        if (lower.includes("approved")) {
            return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
        }
        if (lower.includes("rejected")) {
            return <ShieldAlert className="w-5 h-5 text-rose-400" />;
        }
        if (lower.includes("required") || lower.includes("information")) {
            return <AlertTriangle className="w-5 h-5 text-amber-400" />;
        }
        return <Clock className="w-5 h-5 text-sky-400" />;
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-3">
                        <Bell className="w-7 h-7 text-emerald-400" />
                        Hospital Notifications
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                        Real-time updates regarding submitted claims, verification results, and officer reviews.
                    </p>
                </div>

                {notifications.some((n) => !n.isRead) && (
                    <button
                        onClick={handleMarkAllRead}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                    >
                        <Check className="w-4 h-4" />
                        <span>Mark All Read</span>
                    </button>
                )}
            </div>

            {/* Notifications List */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-xl">
                {loading ? (
                    <div className="py-16 text-center text-slate-400 text-sm">
                        <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <span>Loading notifications...</span>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="py-16 text-center text-slate-400 space-y-3">
                        <Bell className="w-12 h-12 text-slate-700 mx-auto" />
                        <p className="text-base font-semibold text-slate-300">No Notifications</p>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                            You're all caught up! New claim updates and reviews will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notifications.map((item) => (
                            <div
                                key={item._id}
                                className={`flex items-start justify-between p-4 rounded-2xl border transition-all ${
                                    item.isRead
                                        ? "bg-slate-950/40 border-slate-800/60 opacity-80"
                                        : "bg-slate-900/90 border-emerald-500/30 shadow-md shadow-emerald-500/5"
                                }`}
                            >
                                <div className="flex items-start gap-3.5">
                                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 shrink-0 mt-0.5">
                                        {getIcon(item.message)}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs font-semibold text-slate-200">{item.message}</p>
                                            {!item.isRead && (
                                                <span className="w-2 h-2 rounded-full bg-emerald-400" title="Unread" />
                                            )}
                                        </div>
                                        <div className="text-[10px] text-slate-500">
                                            {item.createdAt ? new Date(item.createdAt).toLocaleString() : "Recently"}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    {item.claimId && (
                                        <Link
                                            to={`/hospital/claims/${item.claimId}`}
                                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 text-[11px] font-bold transition-colors inline-flex items-center gap-1"
                                        >
                                            <span>View Claim</span>
                                            <ArrowRight className="w-3 h-3" />
                                        </Link>
                                    )}

                                    {!item.isRead && (
                                        <button
                                            onClick={() => handleMarkRead(item._id)}
                                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-emerald-400 transition-colors"
                                            title="Mark as Read"
                                        >
                                            <Check className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HospitalNotifications;
