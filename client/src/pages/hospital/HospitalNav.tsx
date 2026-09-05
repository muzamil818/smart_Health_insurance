import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
    Building2,
    LayoutDashboard,
    FileText,
    PlusCircle,
    Bell,
    User as UserIcon,
    LogOut,
    Globe,
    Menu,
    X
} from "lucide-react";
import { getNotifications } from "../../services/notificationService";

interface User {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
    hospitalId?: string;
}

const HospitalNav = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [unreadCount, setUnreadCount] = useState<number>(0);
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

        // Fetch unread notifications count
        getNotifications().then((notifs) => {
            const unread = notifs.filter((n) => !n.isRead).length;
            setUnreadCount(unread);
        });
    }, [location.pathname]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        navigate("/auth");
    };

    const navLinks = [
        { name: "Dashboard", path: "/hospital", icon: LayoutDashboard },
        { name: "My Claims", path: "/hospital/claims", icon: FileText },
        { name: "Submit Claim", path: "/hospital/submit-claim", icon: PlusCircle },
        { name: "Notifications", path: "/hospital/notifications", icon: Bell, badge: unreadCount },
        { name: "Profile", path: "/hospital/profile", icon: UserIcon },
    ];

    const isActive = (path: string) => {
        if (path === "/hospital") {
            return location.pathname === "/hospital" || location.pathname === "/hospital/";
        }
        return location.pathname.startsWith(path);
    };

    return (
        <header className="sticky top-0 z-50 w-full transition-all duration-300 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 shadow-lg shadow-emerald-950/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">

                    {/* Brand Logo & Name */}
                    <Link to="/hospital" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/25 ring-1 ring-white/20 group-hover:scale-105 transition-transform duration-200">
                            <Building2 className="w-6 h-6 text-slate-950 stroke-[2.5]" />
                        </div>
                        <div>
                            <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                                {user?.name || "Care Provider Portal"}
                            </span>
                            <span className="block text-[10px] font-bold text-emerald-400 uppercase tracking-widest -mt-1">
                                Hospital Portal
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden lg:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800/60 backdrop-blur-lg">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const active = isActive(link.path);
                            return (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                                        active
                                            ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10"
                                            : "text-slate-300 hover:text-slate-100 hover:bg-slate-800/60"
                                    }`}
                                >
                                    <Icon className={`w-4 h-4 ${active ? "text-emerald-400" : "text-slate-400"}`} />
                                    <span>{link.name}</span>
                                    {Boolean(link.badge && link.badge > 0) && (
                                        <span className="ml-1 px-1.5 py-0.5 text-[10px] font-extrabold bg-emerald-500 text-slate-950 rounded-full leading-none">
                                            {link.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Desktop Action Area: Main Site & Logout */}
                    <div className="hidden lg:flex items-center gap-3">
                        <Link
                            to="/"
                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl text-slate-300 hover:text-emerald-400 hover:bg-slate-900/80 border border-slate-800/80 transition-all duration-200"
                        >
                            <Globe className="w-3.5 h-3.5 text-slate-400" />
                            <span>Main Site</span>
                        </Link>

                        <button
                            onClick={handleLogout}
                            title="Sign Out"
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-rose-500/10 text-slate-300 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 text-xs font-semibold transition-all duration-200 active:scale-95 cursor-pointer"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                        </button>
                    </div>

                    {/* Mobile Hamburger Toggle */}
                    <div className="lg:hidden flex items-center gap-2">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-emerald-400 focus:outline-none transition-colors"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6 text-emerald-400" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>

                </div>
            </div>

            {/* Mobile Dropdown Menu */}
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
                                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                                        active
                                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                            : "text-slate-300 hover:bg-slate-900 hover:text-slate-100"
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon className={`w-5 h-5 ${active ? "text-emerald-400" : "text-slate-400"}`} />
                                        <span>{link.name}</span>
                                    </div>
                                    {Boolean(link.badge && link.badge > 0) && (
                                        <span className="px-2 py-0.5 text-xs font-bold bg-emerald-500 text-slate-950 rounded-full">
                                            {link.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="pt-4 border-t border-slate-800/80 space-y-2">
                        <Link
                            to="/"
                            onClick={() => setMobileMenuOpen(false)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 text-xs font-semibold"
                        >
                            <Globe className="w-4 h-4" />
                            <span>Return to Main Website</span>
                        </Link>
                        <button
                            onClick={() => {
                                setMobileMenuOpen(false);
                                handleLogout();
                            }}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/30 text-xs font-semibold"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
};

export default HospitalNav;