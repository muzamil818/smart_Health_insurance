import { Link } from "react-router-dom";
import { Compass, ArrowLeft } from "lucide-react";
import { getStoredUser, homeRouteForRole } from "../services/authApi";

const NotFound = () => {
    const user = getStoredUser();

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-emerald-400">
                    <Compass className="w-7 h-7" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                        404
                    </h1>
                    <h2 className="text-lg font-bold text-slate-100">Page Not Found</h2>
                    <p className="text-sm text-slate-400">
                        This page does not exist in the Smart Health Insurance portal.
                    </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-bold transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Home</span>
                    </Link>
                    {user && (
                        <Link
                            to={homeRouteForRole(user.role)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20"
                        >
                            <span>Go to My Dashboard</span>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotFound;
