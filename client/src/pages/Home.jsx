import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import CompanyGrid from '../components/CompanyGrid';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';

export default function Home() {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCompanies() {
      try {
        const { data } = await api.get('/api/companies');
        setCompanies(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load companies');
      } finally {
        setLoading(false);
      }
    }
    fetchCompanies();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return companies;
    return companies.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.description?.toLowerCase().includes(query)
    );
  }, [companies, search]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Placement Companies</h1>
          <p className="mt-2 text-slate-600">
            Explore recruitment processes and download experience PDFs from seniors.
          </p>
        </div>

        <div className="mb-8">
          <input
            type="search"
            placeholder="Search companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-red-700">{error}</div>
        ) : (
          <CompanyGrid companies={filtered} />
        )}
      </main>
    </div>
  );
}
