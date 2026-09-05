import HospitalNav from "./HospitalNav";

const HospitalDesh = () => {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
            <HospitalNav />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                    Hospital Dashboard
                </h1>
            </main>
        </div>
    );
};

export default HospitalDesh;