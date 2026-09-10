import { Link } from "react-router-dom";
import {
    Shield,
    Building2,
    Gavel,
    HeartPulse,
    ShieldCheck,
    Activity,
    ArrowRight,
    CheckCircle2,
    FileSearch,
    Bell,
    ScrollText,
    Sparkles,
} from "lucide-react";
import { getStoredUser, homeRouteForRole } from "../services/authApi";
import heroImage from "../assets/hero.png";

const WORKFLOW = [
    {
        step: "01",
        title: "Policy Issued",
        body: "An administrator registers the hospital and issues a policy with a coverage limit, validity window, and list of covered treatments.",
        Icon: ShieldCheck,
    },
    {
        step: "02",
        title: "Claim Submitted",
        body: "After treatment, hospital staff file the claim against the patient's policy and attach the medical report and hospital bill.",
        Icon: Building2,
    },
    {
        step: "03",
        title: "Validated & Scored",
        body: "Seven eligibility rules run instantly, then five weighted fraud heuristics assign a 0-100 risk score with every trigger recorded.",
        Icon: FileSearch,
    },
    {
        step: "04",
        title: "Officer Decides",
        body: "An insurance officer reviews the checklist, risk breakdown, and documents, then approves, rejects, or requests more information.",
        Icon: Gavel,
    },
    {
        step: "05",
        title: "Member Notified",
        body: "The policyholder is notified of the outcome, and the decision is written to a permanent audit trail.",
        Icon: Bell,
    },
];

const ROLES = [
    {
        name: "Policyholder",
        blurb: "Track your coverage balance and follow every claim filed on your behalf.",
        to: "/policyholder",
        Icon: HeartPulse,
        accent: "from-sky-500 to-cyan-400",
        ring: "border-sky-500/30 hover:border-sky-500/60",
        text: "text-sky-400",
    },
    {
        name: "Hospital",
        blurb: "Submit claims for treated patients and upload supporting medical records.",
        to: "/hospital",
        Icon: Building2,
        accent: "from-emerald-500 to-teal-400",
        ring: "border-emerald-500/30 hover:border-emerald-500/60",
        text: "text-emerald-400",
    },
    {
        name: "Insurance Officer",
        blurb: "Adjudicate the review queue with automated validation and fraud analytics.",
        to: "/officer",
        Icon: Gavel,
        accent: "from-teal-500 to-emerald-400",
        ring: "border-teal-500/30 hover:border-teal-500/60",
        text: "text-teal-400",
    },
    {
        name: "Administrator",
        blurb: "Empanel hospitals, issue policies, manage accounts, and inspect the audit trail.",
        to: "/admin",
        Icon: Shield,
        accent: "from-cyan-500 to-blue-400",
        ring: "border-cyan-500/30 hover:border-cyan-500/60",
        text: "text-cyan-400",
    },
];

const FRAUD_RULES = [
    { rule: "Unusually high claim amount", points: 30 },
    { rule: "Duplicate claim", points: 30 },
    { rule: "Multiple recent claims", points: 20 },
    { rule: "Treatment / policy mismatch", points: 20 },
    { rule: "Suspicious hospital pattern", points: 20 },
];

const Home = () => {
    const user = getStoredUser();

    return (
        <div className="space-y-20 pb-10">
            {/* ---------------- Hero ---------------- */}
            <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 p-6 md:p-12 shadow-2xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center relative z-10">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Rule-Based Fraud Detection</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                            <span className="text-slate-100">Health insurance claims,</span>
                            <br />
                            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                                validated the moment they arrive.
                            </span>
                        </h1>

                        <p className="text-sm md:text-base text-slate-400 leading-relaxed max-w-xl">
                            Smart Health Insurance digitises the full claim lifecycle — submission,
                            automated eligibility validation, weighted fraud risk scoring, officer
                            adjudication, and a tamper-evident audit trail — across four coordinated roles.
                        </p>

                        <div className="flex flex-wrap items-center gap-3 pt-2">
                            {user ? (
                                <Link
                                    to={homeRouteForRole(user.role)}
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all active:scale-95"
                                >
                                    <Activity className="w-5 h-5 stroke-[2.5]" />
                                    <span>Go to My Dashboard</span>
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        to="/auth"
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all active:scale-95"
                                    >
                                        <span>Get Started</span>
                                        <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                                    </Link>
                                    <Link
                                        to="/auth"
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold text-sm transition-all"
                                    >
                                        <span>Sign In</span>
                                    </Link>
                                </>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-x-6 gap-y-2 pt-4 text-xs text-slate-400">
                            {["7 eligibility checks", "5 fraud heuristics", "4 user roles", "Full audit trail"].map(
                                (item) => (
                                    <span key={item} className="inline-flex items-center gap-1.5">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                        {item}
                                    </span>
                                )
                            )}
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute -inset-4 bg-emerald-500/10 blur-3xl rounded-full" />
                        <img
                            src={heroImage}
                            alt="Smart Health Insurance claim processing dashboard"
                            className="relative rounded-2xl border border-slate-800 shadow-2xl w-full object-cover"
                        />
                    </div>
                </div>
            </section>

            {/* ---------------- Workflow ---------------- */}
            <section className="space-y-8">
                <div className="text-center space-y-2 max-w-2xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-100">
                        How a claim moves through the system
                    </h2>
                    <p className="text-sm text-slate-400">
                        Every stage is enforced server-side with role-based authorisation, so no step can be
                        skipped or performed by the wrong party.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {WORKFLOW.map(({ step, title, body, Icon }) => (
                        <div
                            key={step}
                            className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-xl space-y-3 hover:border-emerald-500/30 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className="text-2xl font-extrabold text-slate-800">{step}</span>
                            </div>
                            <h3 className="text-sm font-bold text-slate-100">{title}</h3>
                            <p className="text-[11px] text-slate-400 leading-relaxed">{body}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ---------------- Roles ---------------- */}
            <section className="space-y-8">
                <div className="text-center space-y-2 max-w-2xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-100">
                        Four portals, one source of truth
                    </h2>
                    <p className="text-sm text-slate-400">
                        Each role sees exactly what it needs — and nothing it shouldn't.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {ROLES.map(({ name, blurb, to, Icon, accent, ring, text }) => (
                        <Link
                            key={name}
                            to={user ? to : "/auth"}
                            className={`group bg-slate-900/70 border rounded-2xl p-6 backdrop-blur-xl space-y-4 transition-all hover:-translate-y-0.5 ${ring}`}
                        >
                            <div
                                className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${accent} flex items-center justify-center shadow-lg ring-1 ring-white/20 group-hover:scale-105 transition-transform`}
                            >
                                <Icon className="w-6 h-6 text-slate-950 stroke-[2.5]" />
                            </div>
                            <div className="space-y-1.5">
                                <h3 className="text-base font-bold text-slate-100">{name}</h3>
                                <p className="text-[11px] text-slate-400 leading-relaxed">{blurb}</p>
                            </div>
                            <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${text}`}>
                                <span>{user ? "Open portal" : "Sign in"}</span>
                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ---------------- Fraud engine ---------------- */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 md:p-8 backdrop-blur-xl space-y-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-100">The fraud scoring engine</h2>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Five weighted rules, capped at 100 points
                            </p>
                        </div>
                    </div>

                    <ul className="space-y-2">
                        {FRAUD_RULES.map(({ rule, points }) => (
                            <li
                                key={rule}
                                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800"
                            >
                                <span className="text-xs text-slate-300">{rule}</span>
                                <span className="shrink-0 px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-extrabold">
                                    +{points}
                                </span>
                            </li>
                        ))}
                    </ul>

                    <div className="grid grid-cols-3 gap-3 pt-2">
                        <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-center">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                                Low
                            </div>
                            <div className="text-sm font-extrabold text-slate-200 mt-0.5">0-30</div>
                        </div>
                        <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-center">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                                Medium
                            </div>
                            <div className="text-sm font-extrabold text-slate-200 mt-0.5">31-60</div>
                        </div>
                        <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/20 text-center">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                                High
                            </div>
                            <div className="text-sm font-extrabold text-slate-200 mt-0.5">61+</div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 md:p-8 backdrop-blur-xl space-y-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                            <ScrollText className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-100">
                                Automated eligibility validation
                            </h2>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Seven deterministic checks on every submission
                            </p>
                        </div>
                    </div>

                    <ul className="space-y-2">
                        {[
                            "Policy exists in the system",
                            "Policy belongs to the named policyholder",
                            "Policy is active and within its validity dates",
                            "Treatment appears on the covered-treatment list",
                            "Hospital is currently empanelled",
                            "Claim amount is within the coverage limit",
                            "Medical report and hospital bill are both attached",
                        ].map((check) => (
                            <li
                                key={check}
                                className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800"
                            >
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-px" />
                                <span className="text-xs text-slate-300">{check}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        </div>
    );
};

export default Home;
