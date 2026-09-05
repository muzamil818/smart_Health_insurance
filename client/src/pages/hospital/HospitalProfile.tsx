import { useEffect, useState } from "react";
import { Building2, ShieldCheck, Mail, Phone, MapPin, Calendar, CheckCircle2, User, FileText } from "lucide-react";
import { getHospitalProfile, type HospitalProfileData } from "../../services/hospitalService";
import { getHospitalClaims } from "../../services/claimService";

const HospitalProfile = () => {
    const [profile, setProfile] = useState<HospitalProfileData | null>(null);
    const [claimCount, setClaimCount] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProfile = async () => {
            setLoading(true);
            const [pData, claims] = await Promise.all([
                getHospitalProfile(),
                getHospitalClaims(),
            ]);
            setProfile(pData);
            setClaimCount(claims.length);
            setLoading(false);
        };

        loadProfile();
    }, []);

    if (loading) {
        return (
            <div className="py-24 text-center text-slate-400 text-sm">
                <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <span>Loading hospital profile...</span>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-3">
                    <Building2 className="w-8 h-8 text-emerald-400" />
                    Hospital Profile & Credentials
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                    Facility registration credentials, eligibility tier, and hospital account details.
                </p>
            </div>

            {/* Profile Card */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 md:p-8 backdrop-blur-xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/25">
                            <Building2 className="w-9 h-9 stroke-[2]" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-xl font-bold text-slate-100">{profile?.name || "Care Hospital Facility"}</h2>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-mono text-emerald-400">
                                    Registration #{profile?.registrationNumber || "HOSP-2026-9812"}
                                </span>
                                {profile?.isEligible !== false && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                        <CheckCircle2 className="w-3 h-3" /> Eligible Network Provider
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Fields Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                            <Mail className="w-4 h-4 text-emerald-400" />
                            <span>Contact Email</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-200">{profile?.email || "admin@hospitalcare.org"}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                            <Phone className="w-4 h-4 text-emerald-400" />
                            <span>Phone Number</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-200">{profile?.phone || "+1 (555) 234-5678"}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2 md:col-span-2">
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                            <MapPin className="w-4 h-4 text-emerald-400" />
                            <span>Facility Address</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-200">{profile?.address || "100 Healthcare Boulevard, Suite 400"}</p>
                    </div>
                </div>

                {/* Account Metrics Summary */}
                <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-400" />
                        <span>Total Claims Filed: <strong className="text-slate-200">{claimCount}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Network Status: <strong className="text-emerald-400">Active & Verified</strong></span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HospitalProfile;
