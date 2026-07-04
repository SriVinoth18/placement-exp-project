import { useState, useMemo } from 'react';
import api from '../services/api';
import CompanyDetailView from './CompanyDetailView';
import LoadingSpinner from './LoadingSpinner';

const emptyRound = { order: 1, name: '', description: '', duration: '', tips: '' };

export default function AdminCompanies({ companies, loading, onRefresh }) {
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  // Modals state
  const [showFormModal, setShowFormModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Selected company state
  const [editingCompany, setEditingCompany] = useState(null);
  const [previewCompany, setPreviewCompany] = useState(null);

  // Form inputs state
  const [form, setForm] = useState({
    name: '',
    description: '',
    website: '',
    isActive: true,
    logo: null,
    rounds: [{ ...emptyRound }],
  });

  // Client search filter
  const filteredCompanies = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return companies;
    return companies.filter((c) => c.name.toLowerCase().includes(query));
  }, [companies, search]);

  const resetForm = () => {
    setEditingCompany(null);
    setForm({
      name: '',
      description: '',
      website: '',
      isActive: true,
      logo: null,
      rounds: [{ ...emptyRound }],
    });
    setError('');
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowFormModal(true);
  };

  const handleOpenEdit = (company) => {
    resetForm();
    setEditingCompany(company);
    setForm({
      name: company.name,
      description: company.description || '',
      website: company.website || '',
      isActive: company.isActive,
      logo: null,
      rounds: company.rounds?.length
        ? company.rounds.map((r, i) => ({
            ...r,
            order: r.order || i + 1,
            description: r.description || '',
            duration: r.duration || '',
            tips: r.tips || '',
          }))
        : [{ ...emptyRound }],
    });
    setShowFormModal(true);
  };

  const handleOpenPreview = async (company) => {
    setPreviewCompany(company);
    setShowPreviewModal(true);
  };

  // Rounds helpers
  const updateRound = (index, field, value) => {
    const rounds = [...form.rounds];
    rounds[index] = { ...rounds[index], [field]: value };
    setForm({ ...form, rounds });
  };

  const addRound = () => {
    setForm({
      ...form,
      rounds: [...form.rounds, { ...emptyRound, order: form.rounds.length + 1 }],
    });
  };

  const removeRound = (index) => {
    const rounds = form.rounds
      .filter((_, i) => i !== index)
      .map((r, i) => ({ ...r, order: i + 1 }));
    setForm({ ...form, rounds: rounds.length ? rounds : [{ ...emptyRound }] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Company name is required');
      return;
    }

    setActionLoading(true);
    setError('');

    const payload = new FormData();
    payload.append('name', form.name.trim());
    payload.append('description', form.description.trim());
    payload.append('website', form.website.trim());
    payload.append('isActive', form.isActive);
    payload.append(
      'rounds',
      JSON.stringify(
        form.rounds
          .filter((r) => r.name.trim())
          .map((r, i) => ({
            ...r,
            order: i + 1,
            name: r.name.trim(),
            description: r.description.trim(),
            duration: r.duration.trim(),
            tips: r.tips.trim(),
          }))
      )
    );

    if (form.logo) {
      payload.append('logo', form.logo);
    }

    try {
      if (editingCompany) {
        await api.put(`/api/admin/companies/${editingCompany._id}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/api/admin/companies', payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      setShowFormModal(false);
      resetForm();
      onRefresh();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to save company. Please verify inputs.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (company) => {
    if (!confirm(`Are you sure you want to deactivate ${company.name}?`)) {
      return;
    }

    setActionLoading(true);
    try {
      await api.delete(`/api/admin/companies/${company._id}`);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('Failed to deactivate company');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Actions Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <input
            type="search"
            placeholder="Search companies by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
          />
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-brand-600/10 transition-all"
        >
          + Add Company
        </button>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="flex justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-4 px-6">Logo</th>
                  <th className="py-4 px-6">Company Name</th>
                  <th className="py-4 px-6">Website</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Created Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {filteredCompanies.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 px-6 text-center text-slate-400">
                      No companies found matching the criteria.
                    </td>
                  </tr>
                ) : (
                  filteredCompanies.map((company) => (
                    <tr key={company._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-50 p-1 border border-slate-200">
                          {company.logoUrl ? (
                            <img
                              src={company.logoUrl}
                              alt={company.name}
                              className="max-h-full max-w-full object-contain"
                            />
                          ) : (
                            <span className="text-sm font-bold text-brand-600">
                              {company.name.charAt(0)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-900">
                        {company.name}
                      </td>
                      <td className="py-4 px-6 text-slate-500">
                        {company.website ? (
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-600 hover:underline"
                          >
                            Careers page
                          </a>
                        ) : (
                          'None'
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            company.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {company.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-400">
                        {company.createdAt
                          ? new Date(company.createdAt).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => handleOpenPreview(company)}
                          className="text-slate-600 hover:text-slate-900 font-semibold text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                        >
                          Preview
                        </button>
                        <button
                          onClick={() => handleOpenEdit(company)}
                          className="text-brand-600 hover:text-brand-700 font-semibold text-xs px-2.5 py-1.5 rounded-lg border border-brand-100 hover:bg-brand-50 transition-colors"
                        >
                          Edit
                        </button>
                        {company.isActive && (
                          <button
                            onClick={() => handleDelete(company)}
                            disabled={actionLoading}
                            className="text-red-600 hover:text-red-700 font-semibold text-xs px-2.5 py-1.5 rounded-lg border border-red-100 hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            Deactivate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
              <h3 className="text-lg font-bold text-slate-950">
                {editingCompany ? 'Edit Company' : 'Add New Company'}
              </h3>
              <button
                onClick={() => setShowFormModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Scroll Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
                  {error}
                </div>
              )}

              {/* Basic Fields */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    placeholder="e.g. Google"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Career Page Website URL
                  </label>
                  <input
                    type="url"
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    placeholder="e.g. https://careers.google.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  placeholder="Provide a description of the company..."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Company Logo File
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setForm({ ...form, logo: e.target.files[0] })}
                    className="w-full text-sm text-slate-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm bg-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Rounds */}
              <div className="border-t border-slate-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-slate-900">Recruitment Rounds</h4>
                  <button
                    type="button"
                    onClick={addRound}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline"
                  >
                    + Add Round
                  </button>
                </div>

                <div className="space-y-4">
                  {form.rounds.map((round, index) => (
                    <div key={index} className="rounded-xl border border-slate-200 bg-slate-50 p-4 relative space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Round {index + 1}
                        </span>
                        {form.rounds.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRound(index)}
                            className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <input
                          type="text"
                          placeholder="Round name (e.g. Online Test) *"
                          required
                          value={round.name}
                          onChange={(e) => updateRound(index, 'name', e.target.value)}
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-brand-500 focus:outline-none focus:ring-1"
                        />
                        <input
                          type="text"
                          placeholder="Duration (e.g. 90 mins)"
                          value={round.duration}
                          onChange={(e) => updateRound(index, 'duration', e.target.value)}
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-brand-500 focus:outline-none focus:ring-1"
                        />
                      </div>
                      <textarea
                        placeholder="Round Description..."
                        rows={2}
                        value={round.description}
                        onChange={(e) => updateRound(index, 'description', e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-brand-500 focus:outline-none focus:ring-1"
                      />
                      <input
                        type="text"
                        placeholder="Tips for students (e.g. Practice DSA array problems)"
                        value={round.tips}
                        onChange={(e) => updateRound(index, 'tips', e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-brand-500 focus:outline-none focus:ring-1"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </form>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={actionLoading}
                className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
              >
                {actionLoading ? 'Saving...' : editingCompany ? 'Save Changes' : 'Create Company'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && previewCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
              <h3 className="text-lg font-bold text-slate-950">
                Student View Preview - {previewCompany.name}
              </h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
              {/* Mock student experiences array for preview */}
              <CompanyDetailView
                company={{
                  ...previewCompany,
                  experiences: previewCompany.experiences || [],
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
