import { useState } from "react";
import { login, register } from '../../services/authApi';
import { useNavigate } from "react-router-dom";

const Auth = () => {
    const navigate = useNavigate();

    const [isLogin, setIsLogin] = useState(false);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('policyholder');

    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {

        if (e) e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            if (isLogin) {
                const res = await login(email, password);

                if (res.token) {
                    localStorage.setItem('token', res.token);
                    localStorage.setItem('user', JSON.stringify(res.user));
                    if (res.user?.role === "hospital") {
                        navigate("/hospital");
                    } else {
                        navigate("/");
                    }
                } else {
                    setMessage(res.message || 'Login failed');
                }
            } else {
                const res = await register(name, email, password, role);
                if (res.user) {
                    setIsLogin(true);
                    setMessage('Registration successful. Please login.');
                } else {
                    setMessage(res.message || 'Registration failed');
                }
            }
        } catch (error) {
            setMessage('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const isSuccessMessage = message.toLowerCase().includes('success');

    return (
        <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans selection:bg-emerald-500 selection:text-slate-950">
            {/* Ambient Background Glow Orbs */}
            <div className="absolute top-1/4 left-1/6 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
            <div className="absolute bottom-1/4 right-1/6 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Grid Pattern Overlay */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(#94a3b8 1px, transparent 1px)`,
                    backgroundSize: '24px 24px'
                }}
            />

            {/* Main Auth Container Card */}
            <div className="w-full max-w-5xl bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 rounded-3xl shadow-2xl shadow-emerald-950/20 overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">

                {/* Left Side: Brand Feature Showcase */}
                <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8 lg:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800/80 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

                    <div>
                        {/* Logo & Brand Header */}
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/25 ring-1 ring-white/20">
                                <svg className="w-7 h-7 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div>
                                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                                    Smart Health
                                </span>
                                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-widest">
                                    Insurance Portal
                                </span>
                            </div>
                        </div>

                        {/* Title & Tagline */}
                        <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-100 leading-snug mb-3">
                            {isLogin ? "Welcome Back to Smart Protection" : "Next-Gen Health Coverage"}
                        </h2>
                        <p className="text-slate-400 text-sm leading-relaxed mb-8">
                            {isLogin
                                ? "Sign in to access your digital insurance dashboard, submit claims, and view policy benefits."
                                : "Join thousands of policyholders benefiting from smart automated claims, zero-friction policies, and 24/7 care support."}
                        </p>

                        {/* Feature Badges */}
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-md">
                                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 mt-0.5">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">Automated Claim Verification</h4>
                                    <p className="text-xs text-slate-400 mt-0.5">Claims processed using smart rule-based verification algorithms.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-md">
                                <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 mt-0.5">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">256-Bit Encrypted Data</h4>
                                    <p className="text-xs text-slate-400 mt-0.5">Bank-grade security and HIPAA compliant data confidentiality.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Academic Project Footer */}
                    <div className="mt-8 pt-6 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
                        <span>Software Engineering Course</span>
                        <span className="inline-flex items-center gap-1.5 font-medium text-emerald-400/90">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            System Active
                        </span>
                    </div>
                </div>

                {/* Right Side: Auth Form Container */}
                <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-slate-900/60">

                    {/* Header Controls / Mode Selector */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight">
                                {isLogin ? "Sign In to Account" : "Create New Account"}
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-400 mt-1">
                                {isLogin ? "Enter your credentials to continue" : "Fill in your details to create your account"}
                            </p>
                        </div>

                        {/* Mode Switch Toggle Button */}
                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setMessage('');
                            }}
                            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800/90 hover:bg-slate-700/80 text-emerald-400 border border-slate-700/60 transition-all hover:shadow-md hover:shadow-emerald-500/10 cursor-pointer active:scale-95"
                        >
                            {isLogin ? "Need an Account? Register" : "Have an Account? Sign In"}
                        </button>
                    </div>

                    {/* Message / Error / Success Notification */}
                    {message && (
                        <div className={`mb-6 p-4 rounded-2xl border flex items-start gap-3 transition-all animate-fadeIn ${isSuccessMessage
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                            : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                            }`}>
                            {isSuccessMessage ? (
                                <svg className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            )}
                            <p className="text-xs sm:text-sm font-medium leading-snug">{message}</p>
                        </div>
                    )}

                    {/* Authentication Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Name Field (Only shown during Register) */}
                        {!isLogin && (
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                                    Full Name <span className="text-emerald-400">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Muzamil ali "
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email Field */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                                Email Address <span className="text-emerald-400">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <input
                                    type="email"
                                    required
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                                    Password <span className="text-emerald-400">*</span>
                                </label>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-10 py-3 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    {showPassword ? (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.025 10.025 0 013.68-.763c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m-1.782 1.782l-10-10" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Account Role Selector (Only shown during Register) */}
                        {!isLogin && (
                            <div className="space-y-1.5 pt-1">
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                                    Account Role
                                </label>
                                <div className="relative">
                                    <select
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="policyholder" className="bg-slate-900 text-slate-100">Policyholder (Self Registration)</option>
                                        <option value="admin" className="bg-slate-900 text-slate-100">Admin</option>
                                        <option value="hospital" className="bg-slate-900 text-slate-100">Hospital</option>
                                        <option value="officer" className="bg-slate-900 text-slate-100">Officer</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:via-teal-400 hover:to-emerald-300 text-slate-950 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.99]"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin w-5 h-5 text-slate-950" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>{isLogin ? "Sign In to Portal" : "Complete Registration"}</span>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>

                    </form>

                    {/* Secondary Toggle Link */}
                    <div className="mt-8 text-center pt-4 border-t border-slate-800/80">
                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setMessage('');
                                if (isLogin) {

                                }
                            }}
                            className="text-xs text-slate-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5 group cursor-pointer"
                        >
                            <span>
                                {isLogin ? "Don't have a policyholder account yet?" : "Already registered your account?"}
                            </span>
                            <span className="font-semibold text-emerald-400 group-hover:underline">
                                {isLogin ? "Register now" : "Sign in here"}
                            </span>
                        </button>
                    </div>

                </div>

            </div>

        </div>
    );
};

export default Auth;
