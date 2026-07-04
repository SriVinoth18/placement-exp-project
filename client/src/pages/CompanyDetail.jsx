import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CompanyDetailView from '../components/CompanyDetailView';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';

export default function CompanyDetail() {
  const { slug } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCompany() {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get(`/api/companies/${slug}`);
        setCompany(data);
      } catch (err) {
        console.error(err);
        setError(err.response?.status === 404 ? 'Company not found' : 'Failed to load company');
      } finally {
        setLoading(false);
      }
    }
    fetchCompany();
  }, [slug]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <Link to="/" className="text-sm font-medium text-brand-600 hover:text-brand-700">
          ← Back to companies
        </Link>

        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-red-700">{error}</div>
        ) : (
          <CompanyDetailView company={company} />
        )}
      </main>
    </div>
  );
}
