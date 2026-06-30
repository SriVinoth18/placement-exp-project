import { useState } from 'react';

export default function AdminExperienceUpload({ companies, onUpload, onDelete, experiences, loading }) {
  const [form, setForm] = useState({
    companyId: '',
    title: '',
    year: new Date().getFullYear(),
    role: '',
    college: '',
    branch: '',
    pdf: null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = new FormData();
    payload.append('title', form.title);
    payload.append('year', form.year);
    payload.append('role', form.role);
    payload.append('college', form.college);
    payload.append('branch', form.branch);
    payload.append('pdf', form.pdf);

    await onUpload(form.companyId, payload);
    setForm({
      companyId: form.companyId,
      title: '',
      year: new Date().getFullYear(),
      role: '',
      college: '',
      branch: '',
      pdf: null,
    });
    e.target.reset();
  };

  const activeCompanies = companies.filter((c) => c.isActive);

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Upload Experience PDF</h3>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Company *</label>
            <select
              required
              value={form.companyId}
              onChange={(e) => setForm({ ...form, companyId: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Select company</option>
              {activeCompanies.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Title *</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. SDE Intern 2025 - John"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Year *</label>
            <input
              required
              type="number"
              min="2000"
              max="2100"
              value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Role</label>
            <input
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              placeholder="e.g. SDE, Analyst"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">College</label>
            <input
              value={form.college}
              onChange={(e) => setForm({ ...form, college: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Branch</label>
            <input
              value={form.branch}
              onChange={(e) => setForm({ ...form, branch: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium text-slate-700">PDF File *</label>
          <input
            required
            type="file"
            accept="application/pdf"
            onChange={(e) => setForm({ ...form, pdf: e.target.files[0] })}
            className="w-full text-sm text-slate-600"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !form.companyId}
          className="mt-6 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {loading ? 'Uploading...' : 'Upload Experience'}
        </button>
      </form>

      {experiences.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Recent Uploads</h3>
          <div className="mt-4 space-y-3">
            {experiences.map((exp) => (
              <div
                key={exp._id}
                className="flex flex-col gap-2 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-slate-900">{exp.title}</p>
                  <p className="text-sm text-slate-500">
                    {exp.company?.name || 'Unknown'} • {exp.year}
                  </p>
                </div>
                <button
                  onClick={() => onDelete(exp._id)}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
