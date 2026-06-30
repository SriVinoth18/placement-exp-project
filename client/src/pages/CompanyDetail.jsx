import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import RoundTimeline from '../components/RoundTimeline';
import ExperienceList from '../components/ExperienceList';
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
          company && (
            <>
              <div className="mt-6 flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-start">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-50 p-3">
                  {company.logoUrl ? (
                    <img
                      src={company.logoUrl}
                      alt={company.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-brand-600">
                      {company.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">{company.name}</h1>
                  {company.description && (
                    <p className="mt-2 text-slate-600">{company.description}</p>
                  )}
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-block text-sm font-medium text-brand-600 hover:text-brand-700"
                    >
                      Visit careers page →
                    </a>
                  )}
                </div>
              </div>

              <section className="mt-10">
                <h2 className="mb-6 text-2xl font-bold text-slate-900">Recruitment Process</h2>
                <RoundTimeline rounds={company.rounds} />
              </section>

              <section className="mt-10">
                <h2 className="mb-6 text-2xl font-bold text-slate-900">Experience PDFs</h2>
                <ExperienceList experiences={company.experiences} />
              </section>
            </>
          )
        )}
      </main>
    </div>
  );
}
