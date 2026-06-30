export default function RoundTimeline({ rounds = [] }) {
  if (!rounds.length) {
    return (
      <p className="text-sm text-slate-500">
        No recruitment rounds have been added for this company yet.
      </p>
    );
  }

  const sortedRounds = [...rounds].sort((a, b) => a.order - b.order);

  return (
    <ol className="relative space-y-6 border-l-2 border-brand-200 pl-6">
      {sortedRounds.map((round, index) => (
        <li key={round._id || index} className="relative">
          <span className="absolute -left-[1.95rem] flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
            {round.order}
          </span>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-lg font-semibold text-slate-900">{round.name}</h4>
              {round.duration && (
                <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                  {round.duration}
                </span>
              )}
            </div>
            {round.description && (
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{round.description}</p>
            )}
            {round.tips && (
              <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                <span className="font-medium">Tip:</span> {round.tips}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
