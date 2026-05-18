"use client";

interface FacilitiesSectionProps {
  availableFacilities: string[];
  selectedFacilities: string[];
  toggleFacility: (facility: string) => void;
}

export function FacilitiesSection({
  availableFacilities,
  selectedFacilities,
  toggleFacility,
}: FacilitiesSectionProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
        Required Facilities
      </label>
      <div className="flex flex-wrap gap-2">
        {availableFacilities.map((facility) => (
          <button
            key={facility}
            type="button"
            onClick={() => toggleFacility(facility)}
            className={`inline-flex h-9 items-center rounded-lg border px-3 text-xs font-medium transition-all ${
              selectedFacilities.includes(facility)
                ? "border-(--accent) bg-(--accent)/10 text-(--accent)"
                : "border-(--line) bg-transparent text-(--text-dim) hover:bg-(--surface-muted)"
            }`}
          >
            {facility}
          </button>
        ))}
      </div>
    </div>
  );
}
