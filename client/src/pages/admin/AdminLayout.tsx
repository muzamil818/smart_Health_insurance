import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import AdminNav from "./AdminNav";
import { ShieldAlert } from "lucide-react";

const AdminLayout = () => {
    const [authorized, setAuthorized] = useState<boolean | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (!token || !storedUser) {
            setAuthorized(false);
            navigate("/auth");
            return;
        }

        try {
            const user = JSON.parse(storedUser);
            if (user.role === "admin") {
                setAuthorized(true);
            } else {
                setAuthorized(false);
            }
        } catch {
            setAuthorized(false);
            navigate("/auth");
        }
    }, [navigate]);

    if (authorized === null) {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
                <div className="flex items-center gap-3 text-cyan-400 font-semibold text-sm">
                    <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    <span>Verifying admin session...</span>
                </div>
            </div>
        );
    }

    if (authorized === false) {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-slate-900/80 border border-rose-500/30 rounded-2xl p-6 text-center shadow-xl">
                    <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-4 text-rose-400">
                        <ShieldAlert className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-100 mb-2">Administrator Access Required</h2>
                    <p className="text-sm text-slate-400 mb-6">
                        This section requires Administrator privileges. Please sign in with an Admin account.
                    </p>
                    <button
                        onClick={() => navigate("/auth")}
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20"
                    >
                        Go to Sign In
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
            <AdminNav />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
