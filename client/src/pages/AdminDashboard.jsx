import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import AdminCompanies from '../components/AdminCompanies';

export default function AdminDashboard() {
  const { user, adminSignOut } = useAuth();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/admin/companies');
      setCompanies(data);
    } catch (err) {
      console.error('Failed to fetch companies for dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const sidebarItems = [
    'Dashboard',
    'Companies',
    'Recruitment Rounds',
    'Experience PDFs',
    'Users',
    'Analytics',
    'Settings',
  ];

  // Dashboard Stats Calculations
  const totalCompanies = companies.length;
  const activeCompanies = companies.filter((c) => c.isActive).length;
  const inactiveCompanies = companies.filter((c) => !c.isActive).length;

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Left Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between shrink-0">
        <div>
          <div className="h-16 flex items-center justify-center border-b border-slate-800">
            <span className="text-xl font-bold tracking-wider text-brand-500">ADMIN PORTAL</span>
          </div>
          <nav className="mt-6 px-4 space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item}
                onClick={() => setActiveTab(item)}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-150 ${
                  activeTab === item
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item}
              </button>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={adminSignOut}
            className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-950/30 hover:text-red-300 rounded-xl border border-red-900/30 transition-all duration-150"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">{activeTab}</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold border border-brand-200">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="text-sm">
                <p className="font-semibold text-slate-800 leading-none">{user?.name || 'Admin'}</p>
                <p className="text-xs text-slate-500 mt-0.5">System Administrator</p>
              </div>
            </div>
            <button
              onClick={adminSignOut}
              className="text-sm font-medium text-slate-600 hover:text-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Dashboard Main Body */}
        <main className="flex-1 overflow-y-auto p-8">
          {activeTab === 'Dashboard' ? (
            <div className="space-y-8">
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-slate-900">Welcome Back, {user?.name || 'Admin'}!</h1>
                <p className="text-sm text-slate-500">Here's a quick overview of the placement platform activity.</p>
              </div>

              {/* Dynamic Stats Cards */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Total Companies */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-36">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Companies</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{totalCompanies}</p>
                  </div>
                  <span className="text-xs text-slate-400">Registered on platform</span>
                </div>

                {/* Active Companies */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-36">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Companies</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{activeCompanies}</p>
                  </div>
                  <span className="text-xs text-slate-400">Visible to students</span>
                </div>

                {/* Inactive Companies */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-36">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Inactive Companies</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{inactiveCompanies}</p>
                  </div>
                  <span className="text-xs text-slate-400">Hidden from students</span>
                </div>
              </div>
            </div>
          ) : activeTab === 'Companies' ? (
            <AdminCompanies
              companies={companies}
              loading={loading}
              onRefresh={fetchCompanies}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 border-dashed p-12 text-center">
              <h3 className="text-lg font-semibold text-slate-800">{activeTab} Section</h3>
              <p className="text-slate-500 mt-2">This section is currently under construction and has not been implemented yet.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
