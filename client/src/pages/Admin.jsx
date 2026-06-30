import { useCallback, useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import AdminCompanyForm from '../components/AdminCompanyForm';
import AdminExperienceUpload from '../components/AdminExperienceUpload';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';

export default function Admin() {
  const [tab, setTab] = useState('companies');
  const [companies, setCompanies] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const { data: companyData } = await api.get('/api/admin/companies');
      setCompanies(companyData);

      const allExperiences = [];
      for (const company of companyData) {
        try {
          const { data: companyDetail } = await api.get(`/api/companies/${company.slug}`);
          if (companyDetail.experiences?.length) {
            allExperiences.push(
              ...companyDetail.experiences.map((e) => ({
                ...e,
                company: { _id: company._id, name: company.name },
              }))
            );
          }
        } catch {
          // skip if company detail fails
        }
      }
      setExperiences(allExperiences);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createCompany = async (payload) => {
    setActionLoading(true);
    try {
      await api.post('/api/admin/companies', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await fetchData();
    } finally {
      setActionLoading(false);
    }
  };

  const updateCompany = async (id, payload) => {
    setActionLoading(true);
    try {
      await api.put(`/api/admin/companies/${id}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await fetchData();
    } finally {
      setActionLoading(false);
    }
  };

  const deleteCompany = async (id) => {
    if (!confirm('Deactivate this company?')) return;
    setActionLoading(true);
    try {
      await api.delete(`/api/admin/companies/${id}`);
      await fetchData();
    } finally {
      setActionLoading(false);
    }
  };

  const uploadExperience = async (companyId, payload) => {
    setActionLoading(true);
    try {
      await api.post(`/api/admin/companies/${companyId}/experiences`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await fetchData();
    } finally {
      setActionLoading(false);
    }
  };

  const deleteExperience = async (id) => {
    if (!confirm('Delete this experience PDF?')) return;
    setActionLoading(true);
    try {
      await api.delete(`/api/admin/experiences/${id}`);
      await fetchData();
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="mt-2 text-slate-600">Manage companies, recruitment rounds, and experience PDFs.</p>

        <div className="mt-6 flex gap-2 border-b border-slate-200">
          {['companies', 'experiences'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`border-b-2 px-4 py-2 text-sm font-medium capitalize ${
                tab === t
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : tab === 'companies' ? (
          <div className="mt-6">
            <AdminCompanyForm
              companies={companies}
              onSubmit={createCompany}
              onUpdate={updateCompany}
              onDelete={deleteCompany}
              loading={actionLoading}
            />
          </div>
        ) : (
          <div className="mt-6">
            <AdminExperienceUpload
              companies={companies}
              experiences={experiences}
              onUpload={uploadExperience}
              onDelete={deleteExperience}
              loading={actionLoading}
            />
          </div>
        )}
      </main>
    </div>
  );
}
