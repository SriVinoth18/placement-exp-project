import { useState, useMemo } from 'react';
import api from '../services/api';
import LoadingSpinner from './LoadingSpinner';

export default function AdminExperiences({ experiences, companies, loading, onRefresh }) {
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals state
  const [showFormModal, setShowFormModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Selected experience state
  const [editingExperience, setEditingExperience] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  // Form inputs state
  const [form, setForm] = useState({
    title: '',
    companyId: '',
    year: new Date().getFullYear(),
    role: '',
    description: '',
    pdfFile: null,
  });

  // Client search and filter logic
  const filteredExperiences = useMemo(() => {
    return experiences.filter((exp) => {
      const matchSearch = exp.title.toLowerCase().includes(search.trim().toLowerCase());
      const matchCompany = !companyFilter || exp.company?._id === companyFilter;
      return matchSearch && matchCompany;
    });
  }, [experiences, search, companyFilter]);

  const resetForm = () => {
    setEditingExperience(null);
    setForm({
      title: '',
      companyId: companies[0]?._id || '',
      year: new Date().getFullYear(),
      role: '',
      description: '',
      pdfFile: null,
    });
    setError('');
    setSuccess('');
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowFormModal(true);
  };

  const handleOpenEdit = (exp) => {
    resetForm();
    setEditingExperience(exp);
    setForm({
      title: exp.title,
      companyId: exp.company?._id || '',
      year: exp.year,
      role: exp.role || '',
      description: exp.description || '',
      pdfFile: null,
    });
    setShowFormModal(true);
  };

  const handleOpenPreview = (exp) => {
    setPreviewUrl(exp.cloudinaryUrl);
    setPreviewTitle(exp.title);
    setShowPreviewModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Only PDF files are allowed');
      e.target.value = null;
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Maximum file size allowed is 10 MB');
      e.target.value = null;
      return;
    }

    setError('');
    setForm({ ...form, pdfFile: file });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.companyId || !form.year) {
      setError('Title, Company, and Year are required fields');
      return;
    }

    if (!editingExperience && !form.pdfFile) {
      setError('Please upload a PDF file');
      return;
    }

    setActionLoading(true);
    setError('');
    setSuccess('');

    const payload = new FormData();
    payload.append('title', form.title.trim());
    payload.append('company', form.companyId);
    payload.append('year', form.year);
    payload.append('role', form.role.trim());
    payload.append('description', form.description.trim());
    if (form.pdfFile) {
      payload.append('pdf', form.pdfFile);
    }

    try {
      if (editingExperience) {
        await api.put(`/api/admin/experiences/${editingExperience._id}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSuccess('Experience PDF updated successfully');
      } else {
        await api.post('/api/admin/experiences', payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSuccess('Experience PDF uploaded successfully');
      }
      setTimeout(() => setShowFormModal(false), 800);
      onRefresh();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to save experience. Please check backend config.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownload = async (exp) => {
    try {
      const response = await api.get(`/api/experiences/${exp._id}/download`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', exp.fileName || `${exp.title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      // Instantly refresh list to show updated downloadCount
      onRefresh();
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download PDF');
    }
  };

  const handleDelete = async (exp) => {
    if (!confirm(`Are you sure you want to permanently delete "${exp.title}"? This will remove it from Cloudinary and MongoDB.`)) {
      return;
    }

    setActionLoading(true);
    try {
      await api.delete(`/api/admin/experiences/${exp._id}`);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('Failed to delete experience PDF');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center max-w-2xl">
          <input
            type="search"
            placeholder="Search PDFs by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-72 rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
          />
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="w-full sm:w-60 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
          >
            <option value="">All Companies</option>
            {companies.map((company) => (
              <option key={company._id} value={company._id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-brand-600/10 transition-all shrink-0"
        >
          + Upload PDF
        </button>
      </div>

      {/* Main Table View */}
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
                  <th className="py-4 px-6">PDF Title</th>
                  <th className="py-4 px-6">Company</th>
                  <th className="py-4 px-6">Year</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Downloads</th>
                  <th className="py-4 px-6">Uploaded By</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {filteredExperiences.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 px-6 text-center text-slate-400">
                      No experience PDFs found matching the criteria.
                    </td>
                  </tr>
                ) : (
                  filteredExperiences.map((exp) => (
                    <tr key={exp._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6 font-semibold text-slate-900">
                        {exp.title}
                      </td>
                      <td className="py-4 px-6 text-slate-700">
                        {exp.company?.name || 'N/A'}
                      </td>
                      <td className="py-4 px-6 text-slate-500">{exp.year}</td>
                      <td className="py-4 px-6 text-slate-500">{exp.role || '—'}</td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          {exp.downloadCount || 0}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-400">
                        {exp.uploadedBy?.name || 'Admin'}
                      </td>
                      <td className="py-4 px-6 text-right space-x-2 shrink-0">
                        {exp.cloudinaryUrl && (
                          <button
                            onClick={() => handleOpenPreview(exp)}
                            className="text-slate-600 hover:text-slate-900 font-semibold text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                          >
                            Preview
                          </button>
                        )}
                        <button
                          onClick={() => handleDownload(exp)}
                          className="text-brand-600 hover:text-brand-700 font-semibold text-xs px-2.5 py-1.5 rounded-lg border border-brand-100 hover:bg-brand-50 transition-colors"
                        >
                          Download
                        </button>
                        <button
                          onClick={() => handleOpenEdit(exp)}
                          className="text-amber-600 hover:text-amber-700 font-semibold text-xs px-2.5 py-1.5 rounded-lg border border-amber-100 hover:bg-amber-50 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(exp)}
                          disabled={actionLoading}
                          className="text-red-600 hover:text-red-700 font-semibold text-xs px-2.5 py-1.5 rounded-lg border border-red-100 hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload / Edit Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-xl border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
              <h3 className="text-lg font-bold text-slate-950">
                {editingExperience ? 'Edit Experience Metadata' : 'Upload Experience PDF'}
              </h3>
              <button
                onClick={() => setShowFormModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800">
                  {success}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  placeholder="e.g. Google SWE Placement Interview 2026"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Company *
                  </label>
                  <select
                    required
                    value={form.companyId}
                    onChange={(e) => setForm({ ...form, companyId: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm bg-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="" disabled>Select Company</option>
                    {companies.map((company) => (
                      <option key={company._id} value={company._id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Year *
                  </label>
                  <input
                    type="number"
                    required
                    min="1990"
                    max="2100"
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Role (Optional)
                  </label>
                  <input
                    type="text"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    placeholder="e.g. Software Engineer Intern"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Description / Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  placeholder="Additional details regarding the rounds, difficulty..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  {editingExperience ? 'Replace PDF File (Optional)' : 'Select PDF File *'}
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="w-full text-sm text-slate-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                />
                <p className="mt-1.5 text-xs text-slate-400">PDF documents only. Maximum size 10 MB.</p>
              </div>
            </form>

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
                {actionLoading ? 'Saving...' : editingExperience ? 'Save Changes' : 'Upload File'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Iframe Preview Modal */}
      {showPreviewModal && previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
              <h3 className="text-lg font-bold text-slate-950">
                PDF Preview - {previewTitle}
              </h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 p-2 bg-slate-100">
              <iframe
                src={`${previewUrl}#toolbar=0`}
                width="100%"
                height="600px"
                className="rounded-xl border border-slate-200"
                title={previewTitle}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
