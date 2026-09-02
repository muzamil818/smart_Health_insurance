import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Shield, Menu, X, LogOut, User as UserIcon, Activity, FileText, Building2, HelpCircle } from "lucide-react";

interface User {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
}

const Nav = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [scrolled, setScrolled] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Load logged in user from localStorage
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch {
                setUser(null);
            }
        }

        // Handle scroll effect for border glow
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        navigate("/auth");
    };

    const navLinks = [
        { name: "Home", path: "/", icon: Activity },
        { name: "Policies", path: "/policies", icon: FileText },
        { name: "Hospitals", path: "/hospitals", icon: Building2 },
        { name: "Support", path: "/support", icon: HelpCircle },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <header
            className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled
                    ? "bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 shadow-lg shadow-emerald-950/20"
                    : "bg-slate-950/70 backdrop-blur-md border-b border-slate-800/50"
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">

                    {/* Brand Logo & Name */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/25 ring-1 ring-white/20 group-hover:scale-105 transition-transform duration-200">
                            <Shield className="w-6 h-6 text-slate-950 stroke-[2.5]" />
                        </div>
                        <div>
                            <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                                Smart Health
                            </span>
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest -mt-1">
                                Insurance Portal
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800/60 backdrop-blur-lg">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const active = isActive(link.path);
                            return (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${active
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

                    {/* Desktop Right Action Area: User Profile or Auth CTA */}
                    <div className="hidden md:flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-3">
                                {/* User Info Badge */}
                                <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
                                        {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                                    </div>
                                    <div className="text-left">
                                        <span className="block text-xs font-bold text-slate-200 leading-tight">
                                            {user.name || "User"}
                                        </span>
                                        <span className="inline-block text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                                            {user.role || "Policyholder"}
                                        </span>
                                    </div>
                                </div>

                                {/* Logout Button */}
                                <button
                                    onClick={handleLogout}
                                    title="Sign Out"
                                    className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 transition-all duration-200 cursor-pointer active:scale-95"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    to="/auth"
                                    className="px-4 py-2.5 text-xs font-semibold rounded-xl text-slate-300 hover:text-emerald-400 hover:bg-slate-900/80 transition-all duration-200"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/auth"
                                    className="px-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:via-teal-400 text-slate-950 shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/35 transition-all duration-200 active:scale-95"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Hamburger Menu Toggle Button */}
                    <div className="md:hidden flex items-center">
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
                <div className="md:hidden bg-slate-950/95 border-b border-slate-800/80 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-3 animate-fadeIn">
                    <nav className="space-y-1">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const active = isActive(link.path);
                            return (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${active
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

                    <div className="pt-4 border-t border-slate-800/80">
                        {user ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 px-4 py-2 bg-slate-900/80 rounded-xl border border-slate-800">
                                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm">
                                        {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-100">{user.name || "User"}</div>
                                        <div className="text-xs text-emerald-400 font-semibold uppercase">{user.role || "Policyholder"}</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setMobileMenuOpen(false);
                                        handleLogout();
                                    }}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-sm font-semibold transition-all"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                <Link
                                    to="/auth"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="w-full py-3 text-center rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-semibold text-sm hover:text-emerald-400"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/auth"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="w-full py-3 text-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Nav;