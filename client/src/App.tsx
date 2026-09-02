

import Nav from './pages/Nav';
import { Home } from './pages/Home';

const App = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
      <Nav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Home />
      </main>
    </div>
  );
};

export default App;