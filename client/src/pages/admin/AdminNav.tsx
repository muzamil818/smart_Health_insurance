import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
    ShieldCheck,
    LayoutDashboard,
    Users,
    Building2,
    FileText,
    Activity,
    LogOut,
    Globe,
    Menu,
    X,
    Shield
} from "lucide-react";

interface User {
    name?: string;
    email?: string;
    role?: string;
}

const AdminNav = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch {
                setUser(null);
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        navigate("/auth");
    };

    const navLinks = [
        { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
        { name: "User Management", path: "/admin/users", icon: Users },
        { name: "Hospitals", path: "/admin/hospitals", icon: Building2 },
        { name: "Policies", path: "/admin/policies", icon: FileText },
        { name: "Audit Trail", path: "/admin/audit-logs", icon: Activity },
    ];

    const isActive = (path: string) => {
        if (path === "/admin") {
            return location.pathname === "/admin" || location.pathname === "/admin/";
        }
        return location.pathname.startsWith(path);
    };

    return (
        <header className="sticky top-0 z-50 w-full transition-all duration-300 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 shadow-lg shadow-emerald-950/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">

                    {/* Brand Logo */}
                    <Link to="/admin" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-cyan-500/25 ring-1 ring-white/20 group-hover:scale-105 transition-transform duration-200">
                            <Shield className="w-6 h-6 text-slate-950 stroke-[2.5]" />
                        </div>
                        <div>
                            <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                                System Administration
                            </span>
                            <span className="block text-[10px] font-bold text-cyan-400 uppercase tracking-widest -mt-1">
                                Super Admin Control
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Links */}
                    <nav className="hidden lg:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800/60 backdrop-blur-lg">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const active = isActive(link.path);
                            return (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                                        active
                                            ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10"
                                            : "text-slate-300 hover:text-slate-100 hover:bg-slate-800/60"
                                    }`}
                                >
                                    <Icon className={`w-4 h-4 ${active ? "text-emerald-400" : "text-slate-400"}`} />
                                    <span>{link.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Actions */}
                    <div className="hidden lg:flex items-center gap-3">
                        <Link
                            to="/"
                            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-100 border border-slate-800 transition-colors"
                            title="Return to Main Website"
                        >
                            <Globe className="w-4 h-4" />
                        </Link>
                        <button
                            onClick={handleLogout}
                            title="Sign Out"
                            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 transition-colors cursor-pointer"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Mobile Toggle */}
                    <div className="lg:hidden flex items-center">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-emerald-400"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6 text-emerald-400" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>

                </div>
            </div>

            {/* Mobile Drawer */}
            {mobileMenuOpen && (
                <div className="lg:hidden bg-slate-950/95 border-b border-slate-800/80 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-3">
                    <nav className="space-y-1">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const active = isActive(link.path);
                            return (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                                        active
                                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                            : "text-slate-300 hover:bg-slate-900 hover:text-slate-100"
                                    }`}
                                >
                                    <Icon className={`w-5 h-5 ${active ? "text-emerald-400" : "text-slate-400"}`} />
                                    <span>{link.name}</span>
                                </Link>
                            );
                        })}
                    </nav>
                    <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                        <Link
                            to="/"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex-1 py-2.5 text-center rounded-xl bg-slate-900 text-slate-300 border border-slate-800 text-xs font-semibold"
                        >
                            Main Website
                        </Link>
                        <button
                            onClick={() => {
                                setMobileMenuOpen(false);
                                handleLogout();
                            }}
                            className="flex-1 py-2.5 text-center rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/30 text-xs font-semibold"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
};

export default AdminNav;
