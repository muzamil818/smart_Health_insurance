import { useEffect, useState } from "react";
import { Building2, Plus, AlertCircle, CheckCircle2, XCircle, ToggleLeft } from "lucide-react";
import {
    getHospitals,
    createHospital,
    updateHospital,
    type AdminHospital,
} from "../../services/adminService";

const AdminHospitals = () => {
    const [hospitals, setHospitals] = useState<AdminHospital[]>([]);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState<string | null>(null);

    const [showModal, setShowModal] = useState(false);
    const [name, setName] = useState("");
    const [registrationNumber, setRegistrationNumber] = useState("");
    const [address, setAddress] = useState("");
    const [contact, setContact] = useState("");
    const [saving, setSaving] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);

    const fetchHospitals = async () => {
        setLoading(true);
        setHospitals(await getHospitals());
        setLoading(false);
    };

    useEffect(() => {
        fetchHospitals();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setModalError(null);

        if (!name || !registrationNumber || !address || !contact) {
            setModalError("Name, registration number, address, and contact are all required.");
            return;
        }

        setSaving(true);
        const res = await createHospital({ name, registrationNumber, address, contact });
        if (res.error) {
            setModalError(res.error);
        } else {
            setShowModal(false);
            setName("");
            setRegistrationNumber("");
            setAddress("");
            setContact("");
            await fetchHospitals();
        }
        setSaving(false);
    };

    /** Empanelment toggle: ineligible hospitals fail the claim validation engine. */
    const handleToggleEligibility = async (hospital: AdminHospital) => {
        setBusyId(hospital._id);
        const res = await updateHospital(hospital._id, { isEligible: !hospital.isEligible });
        if (!res.error) {
            setHospitals((prev) =>
                prev.map((h) => (h._id === hospital._id ? { ...h, isEligible: !h.isEligible } : h))
            );
        }
        setBusyId(null);
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-3">
                        <Building2 className="w-8 h-8 text-emerald-400" />
                        Hospital Empanelment
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                        Register partner facilities and control which are eligible to submit claims. Claims
                        from ineligible hospitals automatically fail validation.
                    </p>
                </div>

                <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 cursor-pointer shrink-0"
                >
                    <Plus className="w-4 h-4" />
                    <span>Register Hospital</span>
                </button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-xl">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Registered Facilities
                    </span>
                    <div className="mt-3 text-3xl font-extrabold text-cyan-400">
                        {loading ? "..." : hospitals.length}
                    </div>
                </div>
                <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-xl">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Eligible
                    </span>
                    <div className="mt-3 text-3xl font-extrabold text-emerald-400">
                        {loading ? "..." : hospitals.filter((h) => h.isEligible).length}
                    </div>
                </div>
                <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-xl">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Suspended
                    </span>
                    <div className="mt-3 text-3xl font-extrabold text-rose-400">
                        {loading ? "..." : hospitals.filter((h) => !h.isEligible).length}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-xl">
                {loading ? (
                    <div className="py-16 text-center text-slate-400 text-sm">
                        <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <span>Loading hospital registry...</span>
                    </div>
                ) : hospitals.length === 0 ? (
                    <div className="py-16 text-center text-slate-400 space-y-2">
                        <Building2 className="w-12 h-12 text-slate-600 mx-auto" />
                        <p className="text-sm font-semibold text-slate-300">No hospitals registered</p>
                        <p className="text-xs text-slate-500">
                            Register a facility before hospital staff can file claims.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                                    <th className="pb-3 px-3">Facility Name</th>
                                    <th className="pb-3 px-3">Registration No.</th>
                                    <th className="pb-3 px-3">Address</th>
                                    <th className="pb-3 px-3">Contact</th>
                                    <th className="pb-3 px-3">Empanelment</th>
                                    <th className="pb-3 px-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {hospitals.map((h) => (
                                    <tr key={h._id} className="hover:bg-slate-800/40 transition-colors">
                                        <td className="py-4 px-3 font-bold text-slate-200">{h.name}</td>
                                        <td className="py-4 px-3 font-mono text-slate-400">
                                            {h.registrationNumber}
                                        </td>
                                        <td className="py-4 px-3 text-slate-400 max-w-[220px] truncate">
                                            {h.address}
                                        </td>
                                        <td className="py-4 px-3 text-slate-400">{h.contact}</td>
                                        <td className="py-4 px-3">
                                            {h.isEligible ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Eligible
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                                                    <XCircle className="w-3.5 h-3.5" /> Suspended
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-3 text-right">
                                            <button
                                                onClick={() => handleToggleEligibility(h)}
                                                disabled={busyId === h._id}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold text-[11px] transition-colors disabled:opacity-50 cursor-pointer"
                                            >
                                                <ToggleLeft className="w-3.5 h-3.5" />
                                                <span>
                                                    {busyId === h._id
                                                        ? "Saving..."
                                                        : h.isEligible
                                                          ? "Suspend"
                                                          : "Reinstate"}
                                                </span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl animate-fadeIn">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                            <h3 className="text-lg font-bold text-slate-100">Register Hospital Facility</h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-slate-400 hover:text-slate-200 cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        {modalError && (
                            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{modalError}</span>
                            </div>
                        )}

                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-slate-300">
                                    Facility Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. City General Hospital"
                                    className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-slate-300">
                                    Registration Number
                                </label>
                                <input
                                    type="text"
                                    value={registrationNumber}
                                    onChange={(e) => setRegistrationNumber(e.target.value)}
                                    placeholder="e.g. HOSP-100234"
                                    className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-slate-300">Address</label>
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Street, city"
                                    className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-slate-300">
                                    Contact (Phone or Email)
                                </label>
                                <input
                                    type="text"
                                    value={contact}
                                    onChange={(e) => setContact(e.target.value)}
                                    placeholder="admin@hospital.org"
                                    className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-950 text-slate-300 border border-slate-800 text-xs font-semibold cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-md disabled:opacity-50 cursor-pointer"
                                >
                                    {saving ? "Registering..." : "Register Facility"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminHospitals;
