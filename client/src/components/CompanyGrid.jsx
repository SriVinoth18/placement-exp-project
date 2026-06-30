import CompanyCard from './CompanyCard';

export default function CompanyGrid({ companies }) {
  if (!companies.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <p className="text-lg font-medium text-slate-700">No companies found</p>
        <p className="mt-2 text-sm text-slate-500">
          Try a different search term or check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {companies.map((company) => (
        <CompanyCard key={company._id || company.slug} company={company} />
      ))}
    </div>
  );
}
