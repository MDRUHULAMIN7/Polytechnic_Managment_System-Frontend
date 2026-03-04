import type { Instructor } from "@/lib/type/dashboard/admin/instructor";
import { resolveName } from "@/utils/dashboard/admin/utils";

export function SubjectInstructorsPanel({
  instructors,
  error,
}: {
  instructors: Instructor[];
  error?: string | null;
}) {
  return (
    <div className="rounded-xl border border-(--line) px-4 py-3">
      <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
        Assigned Instructors
      </p>
      {error ? (
        <p className="mt-2 text-sm text-red-400">{error}</p>
      ) : instructors.length === 0 ? (
        <p className="mt-2 text-sm text-(--text-dim)">No instructors assigned.</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {instructors.map((instructor) => (
            <li
              key={instructor._id}
              className="flex items-center justify-between gap-2 rounded-lg border border-(--line) px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium">{resolveName(instructor.name)}</p>
                <p className="text-xs text-(--text-dim)">{instructor.designation}</p>
              </div>
              <span className="text-xs text-(--text-dim)">{instructor.id}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
