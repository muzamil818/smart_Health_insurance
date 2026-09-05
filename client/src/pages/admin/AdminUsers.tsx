import { useEffect, useState } from "react";
import { Users, Plus, Trash2, Shield, Mail, CheckCircle2, AlertCircle } from "lucide-react";
import { getAllUsers, createUser, deleteUser } from "../../services/adminService";
import type { UserRef } from "../../services/claimService";

const AdminUsers = () => {
    const [users, setUsers] = useState<UserRef[]>([]);
    const [loading, setLoading] = useState(true);

    // Create modal state
    const [showModal, setShowModal] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("policyholder");
    const [saving, setSaving] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);

    const fetchUsers = async () => {
        setLoading(true);
        const data = await getAllUsers();
        setUsers(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setModalError(null);
        if (!name || !email || !password) {
            setModalError("Name, email, and password are required.");
            return;
        }

        setSaving(true);
        const res = await createUser({ name, email, password, role });
        if (res.error) {
            setModalError(res.error);
        } else {
            setShowModal(false);
            setName("");
            setEmail("");
            setPassword("");
            setRole("policyholder");
            await fetchUsers();
        }
        setSaving(false);
    };

    const handleDeleteUser = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        const ok = await deleteUser(id);
        if (ok) {
            await fetchUsers();
        }
    };

    const getRoleBadge = (r?: string) => {
        switch (r) {
            case "admin":
                return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">Admin</span>;
            case "hospital":
                return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">Hospital Care</span>;
            case "officer":
                return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-400 border border-teal-500/30">Officer</span>;
            default:
                return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30">Policyholder</span>;
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-3">
                        <Users className="w-8 h-8 text-cyan-400" />
                        User Account Management
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                        View registered system accounts, assign security roles, and provision new user credentials.
                    </p>
                </div>

                <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    <span>Create User Account</span>
                </button>
            </div>

            {/* Users Table */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-xl">
                {loading ? (
                    <div className="py-16 text-center text-slate-400 text-sm">
                        <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <span>Loading user accounts...</span>
                    </div>
                ) : users.length === 0 ? (
                    <div className="py-16 text-center text-slate-400 text-xs italic">No user accounts found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                                    <th className="pb-3 px-3">User ID</th>
                                    <th className="pb-3 px-3">Full Name</th>
                                    <th className="pb-3 px-3">Email Address</th>
                                    <th className="pb-3 px-3">Role</th>
                                    <th className="pb-3 px-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {users.map((u) => (
                                    <tr key={u._id} className="hover:bg-slate-800/40 transition-colors">
                                        <td className="py-4 px-3 font-mono text-slate-400">
                                            #{u._id.substring(u._id.length - 8)}
                                        </td>
                                        <td className="py-4 px-3 font-bold text-slate-200">{u.name}</td>
                                        <td className="py-4 px-3 text-slate-300">{u.email}</td>
                                        <td className="py-4 px-3">{getRoleBadge(u.role)}</td>
                                        <td className="py-4 px-3 text-right">
                                            <button
                                                onClick={() => handleDeleteUser(u._id)}
                                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors cursor-pointer"
                                                title="Delete User"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create User Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl animate-fadeIn">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                            <h3 className="text-lg font-bold text-slate-100">Create New User Account</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-200">✕</button>
                        </div>

                        {modalError && (
                            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{modalError}</span>
                            </div>
                        )}

                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-slate-300">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Muzamil Ali"
                                    className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-slate-300">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="user@example.com"
                                    className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-slate-300">Password</label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-slate-300">Role</label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                                >
                                    <option value="policyholder">Policyholder</option>
                                    <option value="hospital">Hospital Care Provider</option>
                                    <option value="officer">Insurance Officer</option>
                                    <option value="admin">System Administrator</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-950 text-slate-300 border border-slate-800 text-xs font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-md disabled:opacity-50"
                                >
                                    {saving ? "Creating..." : "Save User"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
