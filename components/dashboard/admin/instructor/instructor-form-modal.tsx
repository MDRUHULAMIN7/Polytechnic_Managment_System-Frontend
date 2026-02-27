"use client";

import { useEffect, useState } from "react";
import { createInstructorAction } from "@/actions/dashboard/admin/instructor";
import type {
  InstructorBloodGroup,
  InstructorCreatePayload,
  InstructorInput,
} from "@/lib/type/dashboard/admin/instructor";
import type { InstructorFormModalProps } from "@/lib/type/dashboard/admin/instructor/ui";
import { showToast } from "@/utils/common/toast";
import { Modal } from "./modal";

const bloodGroups: Array<InstructorBloodGroup> = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
];

type FormState = Omit<InstructorInput, "gender" | "bloogGroup" | "dateOfBirth"> & {
  gender: InstructorInput["gender"] | "";
  bloogGroup: InstructorBloodGroup | "";
  dateOfBirth: string;
};

const initialState: FormState = {
  designation: "",
  name: {
    firstName: "",
    middleName: "",
    lastName: "",
  },
  gender: "",
  dateOfBirth: "",
  email: "",
  contactNo: "",
  emergencyContactNo: "",
  bloogGroup: "",
  presentAddress: "",
  permanentAddress: "",
  profileImg: "",
  academicDepartment: "",
};

function capitalize(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export function InstructorFormModal({
  open,
  departments,
  onClose,
  onSaved,
}: InstructorFormModalProps) {
  const [form, setForm] = useState<FormState>(initialState);
  const [password, setPassword] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(initialState);
      setPassword("");
      setFile(null);
    }
  }, [open]);

  function updateField<T extends keyof FormState>(key: T, value: FormState[T]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.firstName.trim() || !form.name.lastName.trim()) {
      showToast({
        variant: "error",
        title: "Missing name",
        description: "Please enter instructor first and last name.",
      });
      return;
    }

    if (!form.designation.trim()) {
      showToast({
        variant: "error",
        title: "Missing designation",
        description: "Please enter designation.",
      });
      return;
    }

    if (!form.gender) {
      showToast({
        variant: "error",
        title: "Missing gender",
        description: "Please select a gender.",
      });
      return;
    }

    if (!form.bloogGroup) {
      showToast({
        variant: "error",
        title: "Missing blood group",
        description: "Please select a blood group.",
      });
      return;
    }

    if (!form.email.trim()) {
      showToast({
        variant: "error",
        title: "Missing email",
        description: "Please provide a valid email.",
      });
      return;
    }

    if (!form.contactNo.trim() || !form.emergencyContactNo.trim()) {
      showToast({
        variant: "error",
        title: "Missing contact",
        description: "Please provide contact and emergency contact numbers.",
      });
      return;
    }

    if (!form.presentAddress.trim() || !form.permanentAddress.trim()) {
      showToast({
        variant: "error",
        title: "Missing address",
        description: "Please provide present and permanent address.",
      });
      return;
    }

    if (!form.academicDepartment) {
      showToast({
        variant: "error",
        title: "Missing department",
        description: "Please select an academic department.",
      });
      return;
    }

    setSubmitting(true);

    try {
      const instructorData: InstructorInput = {
        designation: form.designation.trim(),
        name: {
          firstName: capitalize(form.name.firstName),
          middleName: form.name.middleName?.trim() || undefined,
          lastName: form.name.lastName.trim(),
        },
        gender: form.gender as InstructorInput["gender"],
        dateOfBirth: form.dateOfBirth || undefined,
        email: form.email.trim(),
        contactNo: form.contactNo.trim(),
        emergencyContactNo: form.emergencyContactNo.trim(),
        bloogGroup: form.bloogGroup || undefined,
        presentAddress: form.presentAddress.trim(),
        permanentAddress: form.permanentAddress.trim(),
        profileImg: form.profileImg?.trim() || undefined,
        academicDepartment: form.academicDepartment,
      };

      const payload: InstructorCreatePayload = {
        password: password.trim() || undefined,
        instructorData,
      };

      await createInstructorAction(payload, file);
      showToast({
        variant: "success",
        title: "Instructor created",
        description: "Instructor profile created successfully.",
      });
      onSaved();
      onClose();
    } catch (error) {
      showToast({
        variant: "error",
        title: "Action failed",
        description:
          error instanceof Error ? error.message : "Unable to create instructor.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create Instructor"
      description="Create a new instructor profile"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--text-dim)">
            Basic Info
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-(--text-dim)">
                First Name
              </label>
              <input
                value={form.name.firstName}
                onChange={(event) =>
                  updateField("name", { ...form.name, firstName: event.target.value })
                }
                className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-(--text-dim)">
                Middle Name
              </label>
              <input
                value={form.name.middleName}
                onChange={(event) =>
                  updateField("name", { ...form.name, middleName: event.target.value })
                }
                className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-(--text-dim)">
                Last Name
              </label>
              <input
                value={form.name.lastName}
                onChange={(event) =>
                  updateField("name", { ...form.name, lastName: event.target.value })
                }
                className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-(--text-dim)">
                Designation
              </label>
              <input
                value={form.designation}
                onChange={(event) => updateField("designation", event.target.value)}
                className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-(--text-dim)">
                Gender
              </label>
              <select
                value={form.gender}
                onChange={(event) => updateField("gender", event.target.value as FormState["gender"])}
                className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text)"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-(--text-dim)">
                Date of Birth
              </label>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(event) => updateField("dateOfBirth", event.target.value)}
                className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-(--text-dim)">
                Blood Group
              </label>
              <select
                value={form.bloogGroup}
                onChange={(event) =>
                  updateField("bloogGroup", event.target.value as FormState["bloogGroup"])
                }
                className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text)"
              >
                <option value="">Select</option>
                {bloodGroups.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-(--text-dim)">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Optional"
                className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-(--text-dim)">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-(--text-dim)">
                Academic Department
              </label>
              <select
                value={form.academicDepartment}
                onChange={(event) => updateField("academicDepartment", event.target.value)}
                className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text)"
              >
                <option value="">Select department</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-(--text-dim)">
                Contact No
              </label>
              <input
                value={form.contactNo}
                onChange={(event) => updateField("contactNo", event.target.value)}
                className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-(--text-dim)">
                Emergency Contact No
              </label>
              <input
                value={form.emergencyContactNo}
                onChange={(event) => updateField("emergencyContactNo", event.target.value)}
                className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-(--text-dim)">
                Present Address
              </label>
              <input
                value={form.presentAddress}
                onChange={(event) => updateField("presentAddress", event.target.value)}
                className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-(--text-dim)">
                Permanent Address
              </label>
              <input
                value={form.permanentAddress}
                onChange={(event) => updateField("permanentAddress", event.target.value)}
                className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.16em] text-(--text-dim)">
              Profile Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="mt-2 block w-full text-sm text-(--text-dim)"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="focus-ring inline-flex h-10 items-center justify-center rounded-xl border border-(--line) px-4 text-sm font-semibold text-(--text-dim) transition hover:bg-(--surface-muted)"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="focus-ring inline-flex h-10 items-center justify-center rounded-xl bg-(--accent) px-4 text-sm font-semibold text-(--accent-ink) transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Create"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
