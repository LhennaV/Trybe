// Loading state for screens inside the app shell: a quiet skeleton of the
// feed grid in cardboard and line colors, no spinner.
export default function Loading() {
  return (
    <div className="flex flex-col gap-3.5" aria-busy="true" aria-label="Loading">
      <div className="h-10 w-40 rounded-xl bg-line" />
      <div className="h-[46px] rounded-input bg-line" />
      <div className="flex items-start gap-2.5">
        {[0, 1].map((column) => (
          <div key={column} className="flex flex-1 flex-col gap-3.5">
            {[0, 1].map((row) => (
              <div key={row} className="flex flex-col gap-2">
                <div
                  className={`w-full rounded-photo bg-brand-box-soft ${
                    (column + row) % 2 === 0 ? "aspect-[174/236]" : "aspect-[174/168]"
                  }`}
                />
                <div className="h-3.5 w-4/5 rounded-chip bg-line" />
                <div className="h-3 w-1/2 rounded-chip bg-line" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
