import api from '../services/api';

export default function ExperienceList({ experiences = [] }) {
  const handleDownload = async (experience) => {
    try {
      const response = await api.get(`/api/experiences/${experience._id}/download`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', experience.fileName || `${experience.title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  if (!experiences.length) {
    return (
      <p className="text-sm text-slate-500">
        No experience PDFs uploaded for this company yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {experiences.map((exp) => (
        <div
          key={exp._id}
          className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h4 className="font-semibold text-slate-900">{exp.title}</h4>
            <div className="mt-1 flex flex-wrap gap-2 text-sm text-slate-500">
              {exp.year && <span>Year: {exp.year}</span>}
              {exp.role && <span>• Role: {exp.role}</span>}
              {exp.college && <span>• {exp.college}</span>}
              {exp.branch && <span>• {exp.branch}</span>}
            </div>
          </div>
          <button
            onClick={() => handleDownload(exp)}
            className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Download PDF
          </button>
        </div>
      ))}
    </div>
  );
}
