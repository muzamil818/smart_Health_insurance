import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    Bell,
    CheckCircle2,
    AlertTriangle,
    Clock,
    ShieldAlert,
    ArrowRight,
    Check,
} from "lucide-react";
import {
    getNotifications,
    markNotificationRead,
    type NotificationItem,
} from "../../services/notificationService";

const PolicyholderNotifications = () => {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifs = async () => {
            setLoading(true);
            setNotifications(await getNotifications());
            setLoading(false);
        };
        fetchNotifs();
    }, []);

    const handleMarkRead = async (id: string) => {
        if (await markNotificationRead(id)) {
            setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
        }
    };

    const handleMarkAllRead = async () => {
        const unread = notifications.filter((n) => !n.isRead);
        await Promise.all(unread.map((n) => markNotificationRead(n._id)));
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    };

    const getIcon = (message: string) => {
        const lower = message.toLowerCase();
        if (lower.includes("approved")) return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
        if (lower.includes("rejected")) return <ShieldAlert className="w-5 h-5 text-rose-400" />;
        if (lower.includes("required") || lower.includes("information")) {
            return <AlertTriangle className="w-5 h-5 text-amber-400" />;
        }
        return <Clock className="w-5 h-5 text-sky-400" />;
    };

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-3">
                        <Bell className="w-7 h-7 text-sky-400" />
                        My Notifications
                        {unreadCount > 0 && (
                            <span className="px-2 py-0.5 text-xs font-extrabold bg-sky-500 text-slate-950 rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                        Alerts raised whenever a claim on your policy is submitted, reviewed, or decided.
                    </p>
                </div>

                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllRead}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-400 border border-slate-800 text-xs font-semibold transition-colors cursor-pointer shrink-0"
                    >
                        <Check className="w-4 h-4" />
                        <span>Mark All Read</span>
                    </button>
                )}
            </div>

            {/* List */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-xl">
                {loading ? (
                    <div className="py-16 text-center text-slate-400 text-sm">
                        <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <span>Loading notifications...</span>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="py-16 text-center text-slate-400 space-y-2">
                        <Bell className="w-12 h-12 text-slate-600 mx-auto" />
                        <p className="text-sm font-semibold text-slate-300">You are all caught up</p>
                        <p className="text-xs text-slate-500">
                            Notifications appear here as your claims move through review.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2.5">
                        {notifications.map((n) => (
                            <div
                                key={n._id}
                                className={`flex items-start justify-between gap-4 p-4 rounded-2xl border transition-colors ${
                                    n.isRead
                                        ? "bg-slate-950/60 border-slate-800/70"
                                        : "bg-sky-500/5 border-sky-500/30"
                                }`}
                            >
                                <div className="flex items-start gap-3 min-w-0">
                                    <div className="shrink-0 mt-0.5">{getIcon(n.message)}</div>
                                    <div className="space-y-1 min-w-0">
                                        <p
                                            className={`text-xs leading-relaxed ${
                                                n.isRead ? "text-slate-400" : "text-slate-100 font-semibold"
                                            }`}
                                        >
                                            {n.message}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className="text-[10px] text-slate-500 font-mono">
                                                {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
                                            </span>
                                            {n.claimId && (
                                                <Link
                                                    to={`/policyholder/claims/${n.claimId}`}
                                                    className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-400 hover:text-sky-300 transition-colors"
                                                >
                                                    <span>View claim</span>
                                                    <ArrowRight className="w-3 h-3" />
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {!n.isRead && (
                                    <button
                                        onClick={() => handleMarkRead(n._id)}
                                        title="Mark as read"
                                        className="shrink-0 p-1.5 rounded-lg bg-slate-800 hover:bg-sky-500/20 text-slate-400 hover:text-sky-400 border border-slate-700 transition-colors cursor-pointer"
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PolicyholderNotifications;
