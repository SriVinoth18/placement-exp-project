import { Link } from 'react-router-dom';

export default function CompanyCard({ company }) {
  return (
    <Link
      to={`/companies/${company.slug}`}
      className="group flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-md"
    >
      <div className="mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl bg-slate-50 p-2">
        {company.logoUrl ? (
          <img
            src={company.logoUrl}
            alt={`${company.name} logo`}
            className="max-h-full max-w-full object-contain"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className="hidden h-full w-full items-center justify-center text-2xl font-bold text-brand-600"
          style={{ display: company.logoUrl ? 'none' : 'flex' }}
        >
          {company.name.charAt(0)}
        </div>
      </div>
      <h3 className="text-center text-lg font-semibold text-slate-900 group-hover:text-brand-600">
        {company.name}
      </h3>
      {company.description && (
        <p className="mt-2 line-clamp-2 text-center text-sm text-slate-500">
          {company.description}
        </p>
      )}
    </Link>
  );
}
