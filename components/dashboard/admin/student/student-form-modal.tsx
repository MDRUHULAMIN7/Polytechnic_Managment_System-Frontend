"use client";

import { useEffect, useState } from "react";
import { createStudentAction } from "@/actions/dashboard/admin/student";
import type {
  StudentBloodGroup,
  StudentCreatePayload,
  StudentInput,
} from "@/lib/type/dashboard/admin/student";
import type { StudentFormModalProps } from "@/lib/type/dashboard/admin/student/ui";
import { showToast } from "@/utils/common/toast";
import { Modal } from "./modal";

const bloodGroups: Array<StudentBloodGroup> = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
];

type FormState = Omit<StudentInput, "gender" | "bloodGroup" | "dateOfBirth"> & {
  gender: StudentInput["gender"] | "";
  bloodGroup: StudentBloodGroup | "";
  dateOfBirth: string;
};

const initialState: FormState = {
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
  bloodGroup: "",
  presentAddress: "",
  permanentAddress: "",
  guardian: {
    fatherName: "",
    fatherOccupation: "",
    fatherContactNo: "",
    motherName: "",
    motherOccupation: "",
    motherContactNo: "",
  },
  localGuardian: {
    name: "",
    occupation: "",
    contactNo: "",
    address: "",
  },
  admissionSemester: "",
  academicDepartment: "",
};

function capitalize(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export function StudentFormModal({
  open,
  departments,
  semesters,
  onClose,
  onSaved,
}: StudentFormModalProps) {
  const [form, setForm] = useState<FormState>(initialState);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(initialState);
      setPassword("");
      setShowPassword(false);
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
        description: "Please enter student first and last name.",
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

    if (!form.academicDepartment || !form.admissionSemester) {
      showToast({
        variant: "error",
        title: "Missing academic info",
        description: "Please select department and admission semester.",
      });
      return;
    }

    if (
      !form.guardian.fatherName.trim() ||
      !form.guardian.fatherOccupation.trim() ||
      !form.guardian.fatherContactNo.trim() ||
      !form.guardian.motherName.trim() ||
      !form.guardian.motherOccupation.trim() ||
      !form.guardian.motherContactNo.trim()
    ) {
      showToast({
        variant: "error",
        title: "Missing guardian info",
        description: "Please fill in guardian information.",
      });
      return;
    }

    if (
      !form.localGuardian.name.trim() ||
      !form.localGuardian.occupation.trim() ||
      !form.localGuardian.contactNo.trim() ||
      !form.localGuardian.address.trim()
    ) {
      showToast({
        variant: "error",
        title: "Missing local guardian",
        description: "Please fill in local guardian information.",
      });
      return;
    }

    setSubmitting(true);

    try {
      const studentData: StudentInput = {
        name: {
          firstName: capitalize(form.name.firstName),
          middleName: form.name.middleName?.trim() || undefined,
          lastName: form.name.lastName.trim(),
        },
        gender: form.gender as StudentInput["gender"],
        dateOfBirth: form.dateOfBirth || undefined,
        email: form.email.trim(),
        contactNo: form.contactNo.trim(),
        emergencyContactNo: form.emergencyContactNo.trim(),
        bloodGroup: form.bloodGroup || undefined,
        presentAddress: form.presentAddress.trim(),
        permanentAddress: form.permanentAddress.trim(),
        guardian: {
          fatherName: form.guardian.fatherName.trim(),
          fatherOccupation: form.guardian.fatherOccupation.trim(),
          fatherContactNo: form.guardian.fatherContactNo.trim(),
          motherName: form.guardian.motherName.trim(),
          motherOccupation: form.guardian.motherOccupation.trim(),
          motherContactNo: form.guardian.motherContactNo.trim(),
        },
        localGuardian: {
          name: form.localGuardian.name.trim(),
          occupation: form.localGuardian.occupation.trim(),
          contactNo: form.localGuardian.contactNo.trim(),
          address: form.localGuardian.address.trim(),
        },
        admissionSemester: form.admissionSemester,
        academicDepartment: form.academicDepartment,
      };

      const payload: StudentCreatePayload = {
        password: password.trim() || undefined,
        studentData,
      };

      const result = await createStudentAction(payload, file);
      if (!result.success) {
        showToast({
          variant: "error",
          title: "Action failed",
          description: result.message,
        });
        return;
      }

      showToast({
        variant: "success",
        title: "Student created",
        description: "Student profile created successfully.",
      });
      onSaved();
      onClose();
    } catch (error) {
      console.log(error)
      showToast({
        variant: "error",
        title: "Action failed",
        description:
          error instanceof Error ? error.message : "Unable to create student.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create Student"
      description="Create a new student profile"
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
                <option value="others">Others</option>
              </select>
            </div>
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
                value={form.bloodGroup}
                onChange={(event) => updateField("bloodGroup", event.target.value as FormState["bloodGroup"])}
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
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
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
                Password
              </label>
              <div className="relative mt-2">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Optional"
                  className="focus-ring h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 pr-12 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="focus-ring absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-(--text-dim) transition hover:text-(--text)"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
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
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--text-dim)">
            Academic Info
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
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
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-(--text-dim)">
                Admission Semester
              </label>
              <select
                value={form.admissionSemester}
                onChange={(event) => updateField("admissionSemester", event.target.value)}
                className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text)"
              >
                <option value="">Select semester</option>
                {semesters.map((semester) => (
                  <option key={semester._id} value={semester._id}>
                    {semester.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.16em] text-(--text-dim)">
              Profile Image
            </label>
            <label className="mt-2 flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-dashed border-(--line) bg-(--surface) px-4 py-3 text-sm text-(--text) transition hover:border-(--accent) hover:bg-(--surface-muted)">
              <div className="space-y-1">
                <p className="text-sm font-semibold">Upload image</p>
                <p className="text-xs text-(--text-dim)">
                  {file ? `Selected: ${file.name}` : "PNG, JPG up to 5MB"}
                </p>
              </div>
              <span className="rounded-full bg-(--accent) px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-(--accent-ink)">
                Browse
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                className="sr-only"
              />
            </label>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--text-dim)">
            Guardian Info
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-(--text-dim)">
                Father Name
              </label>
              <input
                value={form.guardian.fatherName}
                onChange={(event) =>
                  updateField("guardian", { ...form.guardian, fatherName: event.target.value })
                }
                className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-(--text-dim)">
                Father Occupation
              </label>
              <input
                value={form.guardian.fatherOccupation}
                onChange={(event) =>
                  updateField("guardian", {
                    ...form.guardian,
                    fatherOccupation: event.target.value,
                  })
                }
                className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-(--text-dim)">
                Father Contact
              </label>
              <input
                value={form.guardian.fatherContactNo}
                onChange={(event) =>
                  updateField("guardian", {
                    ...form.guardian,
                    fatherContactNo: event.target.value,
                  })
                }
                className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-(--text-dim)">
                Mother Name
              </label>
              <input
                value={form.guardian.motherName}
                onChange={(event) =>
                  updateField("guardian", { ...form.guardian, motherName: event.target.value })
                }
                className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-(--text-dim)">
                Mother Occupation
              </label>
              <input
                value={form.guardian.motherOccupation}
                onChange={(event) =>
                  updateField("guardian", {
                    ...form.guardian,
                    motherOccupation: event.target.value,
                  })
                }
                className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-(--text-dim)">
                Mother Contact
              </label>
              <input
                value={form.guardian.motherContactNo}
                onChange={(event) =>
                  updateField("guardian", {
                    ...form.guardian,
                    motherContactNo: event.target.value,
                  })
                }
                className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--text-dim)">
            Local Guardian
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-(--text-dim)">
                Name
              </label>
              <input
                value={form.localGuardian.name}
                onChange={(event) =>
                  updateField("localGuardian", { ...form.localGuardian, name: event.target.value })
                }
                className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-(--text-dim)">
                Occupation
              </label>
              <input
                value={form.localGuardian.occupation}
                onChange={(event) =>
                  updateField("localGuardian", {
                    ...form.localGuardian,
                    occupation: event.target.value,
                  })
                }
                className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-(--text-dim)">
                Contact No
              </label>
              <input
                value={form.localGuardian.contactNo}
                onChange={(event) =>
                  updateField("localGuardian", {
                    ...form.localGuardian,
                    contactNo: event.target.value,
                  })
                }
                className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-(--text-dim)">
                Address
              </label>
              <input
                value={form.localGuardian.address}
                onChange={(event) =>
                  updateField("localGuardian", {
                    ...form.localGuardian,
                    address: event.target.value,
                  })
                }
                className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
              />
            </div>
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
