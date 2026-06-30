import { useState } from 'react';

const emptyRound = { order: 1, name: '', description: '', duration: '', tips: '' };

export default function AdminCompanyForm({
  companies,
  onSubmit,
  onUpdate,
  onDelete,
  loading,
}) {
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    website: '',
    logo: null,
    rounds: [{ ...emptyRound }],
  });

  const resetForm = () => {
    setEditingId(null);
    setForm({
      name: '',
      description: '',
      website: '',
      logo: null,
      rounds: [{ ...emptyRound }],
    });
  };

  const handleEdit = (company) => {
    setEditingId(company._id);
    setForm({
      name: company.name,
      description: company.description || '',
      website: company.website || '',
      logo: null,
      rounds: company.rounds?.length
        ? company.rounds.map((r, i) => ({ ...r, order: r.order || i + 1 }))
        : [{ ...emptyRound }],
    });
  };

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
    const payload = new FormData();
    payload.append('name', form.name);
    payload.append('description', form.description);
    payload.append('website', form.website);
    payload.append(
      'rounds',
      JSON.stringify(
        form.rounds.map((r, i) => ({
          ...r,
          order: Number(r.order) || i + 1,
        }))
      )
    );
    if (form.logo) payload.append('logo', form.logo);

    if (editingId) {
      await onUpdate(editingId, payload);
    } else {
      await onSubmit(payload);
    }
    resetForm();
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">
          {editingId ? 'Edit Company' : 'Add New Company'}
        </h3>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Company Name *</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Website</label>
            <input
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium text-slate-700">Logo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setForm({ ...form, logo: e.target.files[0] })}
            className="w-full text-sm text-slate-600"
          />
        </div>

        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-medium text-slate-900">Recruitment Rounds</h4>
            <button
              type="button"
              onClick={addRound}
              className="text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              + Add Round
            </button>
          </div>

          <div className="space-y-4">
            {form.rounds.map((round, index) => (
              <div key={index} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Round {index + 1}</span>
                  {form.rounds.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRound(index)}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    placeholder="Round name *"
                    required
                    value={round.name}
                    onChange={(e) => updateRound(index, 'name', e.target.value)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                  <input
                    placeholder="Duration (e.g. 45 mins)"
                    value={round.duration}
                    onChange={(e) => updateRound(index, 'duration', e.target.value)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <textarea
                  placeholder="Description"
                  rows={2}
                  value={round.description}
                  onChange={(e) => updateRound(index, 'description', e.target.value)}
                  className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                <input
                  placeholder="Tips for students"
                  value={round.tips}
                  onChange={(e) => updateRound(index, 'tips', e.target.value)}
                  className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : editingId ? 'Update Company' : 'Create Company'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Existing Companies</h3>
        <div className="mt-4 space-y-3">
          {companies.map((company) => (
            <div
              key={company._id}
              className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-slate-900">{company.name}</p>
                <p className="text-sm text-slate-500">
                  {company.rounds?.length || 0} rounds •{' '}
                  {company.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(company)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
                >
                  Edit
                </button>
                {company.isActive && (
                  <button
                    onClick={() => onDelete(company._id)}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                  >
                    Deactivate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
