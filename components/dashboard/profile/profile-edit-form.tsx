"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, LoaderCircle, Save } from "lucide-react";
import { updateCurrentUserProfile } from "@/lib/api/auth/profile";
import type {
  CurrentUserProfile,
  CurrentUserProfileUpdate,
} from "@/lib/type/auth/profile";
import { showToast } from "@/utils/common/toast";

type ProfileEditFormProps = {
  profile: CurrentUserProfile;
  variant?: "panel" | "modal";
};



function toDateInputValue(value?: string) {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value.slice(0, 10);
  }

  return parsed.toISOString().slice(0, 10);
}

function resolveRole(profile: CurrentUserProfile) {
  return profile.user?.role ?? profile.role;
}

function resolveBloodGroup(profile: CurrentUserProfile) {
  return profile.bloodGroup ?? profile.bloogGroup ?? "";
}


function initialState(profile: CurrentUserProfile) {
  return {
    firstName: profile.name?.firstName ?? "",
    middleName: profile.name?.middleName ?? "",
    lastName: profile.name?.lastName ?? "",
    designation: profile.designation ?? "",
    gender: profile.gender ?? "",
    dateOfBirth: toDateInputValue(profile.dateOfBirth),
    contactNo: profile.contactNo ?? "",
    emergencyContactNo: profile.emergencyContactNo ?? "",
    bloodGroup: resolveBloodGroup(profile),
    presentAddress: profile.presentAddress ?? "",
    permanentAddress: profile.permanentAddress ?? "",
    fatherName: profile.guardian?.fatherName ?? "",
    fatherOccupation: profile.guardian?.fatherOccupation ?? "",
    fatherContactNo: profile.guardian?.fatherContactNo ?? "",
    motherName: profile.guardian?.motherName ?? "",
    motherOccupation: profile.guardian?.motherOccupation ?? "",
    motherContactNo: profile.guardian?.motherContactNo ?? "",
    localGuardianName: profile.localGuardian?.name ?? "",
    localGuardianOccupation: profile.localGuardian?.occupation ?? "",
    localGuardianContactNo: profile.localGuardian?.contactNo ?? "",
    localGuardianAddress: profile.localGuardian?.address ?? "",
  };
}

export function ProfileEditForm({
  profile,
  variant = "panel",
}: ProfileEditFormProps) {
  const router = useRouter();
  const role = resolveRole(profile);
  const [form, setForm] = useState(() => initialState(profile));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isStudent = role === "student";
  const canEdit = role === "student" || role === "instructor" || role === "admin";
  const isModal = variant === "modal";

  function updateField(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canEdit) {
      return;
    }

    const payload: CurrentUserProfileUpdate = {
      name: {
        firstName: form.firstName,
        middleName: form.middleName,
        lastName: form.lastName,
      },
      gender: form.gender,
      dateOfBirth: form.dateOfBirth || undefined,
      contactNo: form.contactNo,
      emergencyContactNo: form.emergencyContactNo,
      presentAddress: form.presentAddress,
      permanentAddress: form.permanentAddress,
    };

    if (isStudent) {
      payload.bloodGroup = form.bloodGroup || undefined;
      payload.guardian = {
        fatherName: form.fatherName,
        fatherOccupation: form.fatherOccupation,
        fatherContactNo: form.fatherContactNo,
        motherName: form.motherName,
        motherOccupation: form.motherOccupation,
        motherContactNo: form.motherContactNo,
      };
      payload.localGuardian = {
        name: form.localGuardianName,
        occupation: form.localGuardianOccupation,
        contactNo: form.localGuardianContactNo,
        address: form.localGuardianAddress,
      };
    } else {
      payload.designation = form.designation;
      payload.bloogGroup = form.bloodGroup || undefined;
    }

    setPending(true);
    setError(null);

    try {
      await updateCurrentUserProfile(payload);
      showToast({
        variant: "success",
        title: "Profile updated",
        description: "Your editable profile details have been saved.",
      });
      router.refresh();
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Failed to update profile.";
      setError(message);
      showToast({
        variant: "error",
        title: "Update failed",
        description: message,
      });
    } finally {
      setPending(false);
    }
  }

  if (!canEdit) {
    return null;
  }


  return (
    <section
      className={
        isModal
          ? "space-y-5"
          : "rounded-3xl border border-(--line) bg-(--surface) p-5 shadow-sm"
      }
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="mt-1 text-lg font-semibold tracking-tight">
            Update Your Details
          </h3>
          <p className="mt-2 text-sm text-(--text-dim)">
            You can update personal and contact information here. Restricted
            academic and account fields stay read-only.
          </p>
        </div>
      </div>


      <form className="mt-5 space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="text-sm font-medium">
            First Name
            <input
              name="firstName"
              value={form.firstName}
              onChange={updateField}
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
            />
          </label>
          <label className="text-sm font-medium">
            Middle Name
            <input
              name="middleName"
              value={form.middleName}
              onChange={updateField}
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
            />
          </label>
          <label className="text-sm font-medium">
            Last Name
            <input
              name="lastName"
              value={form.lastName}
              onChange={updateField}
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
            />
          </label>
        </div>

        {!isStudent ? (
          <label className="block text-sm font-medium">
            Designation
            <input
              name="designation"
              value={form.designation}
              onChange={updateField}
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
            />
          </label>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          <label className="text-sm font-medium">
            Gender
            <select
              name="gender"
              value={form.gender}
              onChange={updateField}
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm text-(--text)"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value={isStudent ? "others" : "other"}>
                {isStudent ? "Others" : "Other"}
              </option>
            </select>
          </label>
          <label className="text-sm font-medium">
            Date of Birth
            <input
              name="dateOfBirth"
              type="date"
              value={form.dateOfBirth}
              onChange={updateField}
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
            />
          </label>
          <label className="text-sm font-medium">
            Blood Group
            <select
              name="bloodGroup"
              value={form.bloodGroup}
              onChange={updateField}
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm text-(--text)"
            >
              <option value="">Select blood group</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium">
            Contact Number
            <input
              name="contactNo"
              value={form.contactNo}
              onChange={updateField}
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
            />
          </label>
          <label className="text-sm font-medium">
            Emergency Contact
            <input
              name="emergencyContactNo"
              value={form.emergencyContactNo}
              onChange={updateField}
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium">
            Present Address
            <textarea
              name="presentAddress"
              value={form.presentAddress}
              onChange={updateField}
              rows={3}
              className="focus-ring mt-2 w-full rounded-xl border border-(--line) bg-transparent px-3 py-3 text-sm"
            />
          </label>
          <label className="text-sm font-medium">
            Permanent Address
            <textarea
              name="permanentAddress"
              value={form.permanentAddress}
              onChange={updateField}
              rows={3}
              className="focus-ring mt-2 w-full rounded-xl border border-(--line) bg-transparent px-3 py-3 text-sm"
            />
          </label>
        </div>

        {isStudent ? (
          <>
            <div className="rounded-2xl border border-(--line) p-4">
              <h4 className="text-sm font-semibold tracking-tight">
                Guardian Details
              </h4>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="text-sm font-medium">
                  Father Name
                  <input
                    name="fatherName"
                    value={form.fatherName}
                    onChange={updateField}
                    className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
                  />
                </label>
                <label className="text-sm font-medium">
                  Father Occupation
                  <input
                    name="fatherOccupation"
                    value={form.fatherOccupation}
                    onChange={updateField}
                    className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
                  />
                </label>
                <label className="text-sm font-medium">
                  Father Contact
                  <input
                    name="fatherContactNo"
                    value={form.fatherContactNo}
                    onChange={updateField}
                    className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
                  />
                </label>
                <label className="text-sm font-medium">
                  Mother Name
                  <input
                    name="motherName"
                    value={form.motherName}
                    onChange={updateField}
                    className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
                  />
                </label>
                <label className="text-sm font-medium">
                  Mother Occupation
                  <input
                    name="motherOccupation"
                    value={form.motherOccupation}
                    onChange={updateField}
                    className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
                  />
                </label>
                <label className="text-sm font-medium">
                  Mother Contact
                  <input
                    name="motherContactNo"
                    value={form.motherContactNo}
                    onChange={updateField}
                    className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-2xl border border-(--line) p-4">
              <h4 className="text-sm font-semibold tracking-tight">
                Local Guardian
              </h4>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="text-sm font-medium">
                  Name
                  <input
                    name="localGuardianName"
                    value={form.localGuardianName}
                    onChange={updateField}
                    className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
                  />
                </label>
                <label className="text-sm font-medium">
                  Occupation
                  <input
                    name="localGuardianOccupation"
                    value={form.localGuardianOccupation}
                    onChange={updateField}
                    className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
                  />
                </label>
                <label className="text-sm font-medium">
                  Contact Number
                  <input
                    name="localGuardianContactNo"
                    value={form.localGuardianContactNo}
                    onChange={updateField}
                    className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
                  />
                </label>
                <label className="text-sm font-medium md:col-span-2">
                  Address
                  <textarea
                    name="localGuardianAddress"
                    value={form.localGuardianAddress}
                    onChange={updateField}
                    rows={3}
                    className="focus-ring mt-2 w-full rounded-xl border border-(--line) bg-transparent px-3 py-3 text-sm"
                  />
                </label>
              </div>
            </div>
          </>
        ) : null}

        {error ? (
          <div className="flex items-start gap-2 rounded-xl border border-red-400/60 bg-red-500/10 px-3 py-2.5 text-sm text-red-400">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="focus-ring inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-(--accent) text-sm font-semibold text-(--accent-ink) transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? <LoaderCircle size={18} className="animate-spin" /> : <Save size={16} />}
          {pending ? "Saving profile..." : "Save changes"}
        </button>
      </form>
    </section>
  );
}
