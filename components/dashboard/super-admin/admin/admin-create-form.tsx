"use client";

import type { UseFormReturn } from "react-hook-form";
import {
  ADMIN_BLOOD_GROUPS,
  ADMIN_GENDERS,
  type CreateAdminFormValues,
} from "@/lib/utils/admin/admin-utils";

type AdminCreateFormProps = {
  form: UseFormReturn<CreateAdminFormValues>;
  onSubmit: ReturnType<UseFormReturn<CreateAdminFormValues>["handleSubmit"]>;
  onCancel: () => void;
};

export function AdminCreateForm({
  form,
  onSubmit,
  onCancel,
}: AdminCreateFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label
            htmlFor="create-password"
            className="mb-1 block text-sm font-medium"
          >
            Password
          </label>
          <input
            id="create-password"
            type="password"
            className="focus-ring w-full rounded-xl border border-(--line) px-3 py-2 text-sm outline-none"
            placeholder="Temporary password"
            {...form.register("password", {
              required: "Password is required.",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters.",
              },
              maxLength: {
                value: 20,
                message: "Password can be at most 20 characters.",
              },
            })}
          />
          {form.formState.errors.password ? (
            <p className="mt-1 text-xs text-(--danger)">
              {form.formState.errors.password.message}
            </p>
          ) : null}
        </div>
        <div>
          <label
            htmlFor="create-designation"
            className="mb-1 block text-sm font-medium"
          >
            Designation
          </label>
          <input
            id="create-designation"
            type="text"
            className="focus-ring w-full rounded-xl border border-(--line) px-3 py-2 text-sm outline-none"
            placeholder="e.g. Deputy Registrar"
            {...form.register("designation", {
              required: "Designation is required.",
            })}
          />
          {form.formState.errors.designation ? (
            <p className="mt-1 text-xs text-(--danger)">
              {form.formState.errors.designation.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label
            htmlFor="create-first-name"
            className="mb-1 block text-sm font-medium"
          >
            First Name
          </label>
          <input
            id="create-first-name"
            type="text"
            className="focus-ring w-full rounded-xl border border-(--line) px-3 py-2 text-sm outline-none"
            {...form.register("firstName", {
              required: "First name is required.",
            })}
          />
          {form.formState.errors.firstName ? (
            <p className="mt-1 text-xs text-(--danger)">
              {form.formState.errors.firstName.message}
            </p>
          ) : null}
        </div>
        <div>
          <label
            htmlFor="create-middle-name"
            className="mb-1 block text-sm font-medium"
          >
            Middle Name
          </label>
          <input
            id="create-middle-name"
            type="text"
            className="focus-ring w-full rounded-xl border border-(--line) px-3 py-2 text-sm outline-none"
            {...form.register("middleName")}
          />
        </div>
        <div>
          <label
            htmlFor="create-last-name"
            className="mb-1 block text-sm font-medium"
          >
            Last Name
          </label>
          <input
            id="create-last-name"
            type="text"
            className="focus-ring w-full rounded-xl border border-(--line) px-3 py-2 text-sm outline-none"
            {...form.register("lastName", {
              required: "Last name is required.",
            })}
          />
          {form.formState.errors.lastName ? (
            <p className="mt-1 text-xs text-(--danger)">
              {form.formState.errors.lastName.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label
            htmlFor="create-gender"
            className="mb-1 block text-sm font-medium"
          >
            Gender
          </label>
          <select
            id="create-gender"
            className="focus-ring w-full rounded-xl border border-(--line) bg-(--surface) px-3 py-2 text-sm text-(--text) outline-none"
            {...form.register("gender", { required: "Gender is required." })}
          >
            <option value="" className="bg-(--surface) text-(--text)">
              Select gender
            </option>
            {ADMIN_GENDERS.map((gender) => (
              <option
                key={gender}
                value={gender}
                className="bg-(--surface) text-(--text)"
              >
                {gender}
              </option>
            ))}
          </select>
          {form.formState.errors.gender ? (
            <p className="mt-1 text-xs text-(--danger)">
              {form.formState.errors.gender.message}
            </p>
          ) : null}
        </div>
        <div>
          <label
            htmlFor="create-blood-group"
            className="mb-1 block text-sm font-medium"
          >
            Blood Group
          </label>
          <select
            id="create-blood-group"
            className="focus-ring w-full rounded-xl border border-(--line) bg-(--surface) px-3 py-2 text-sm text-(--text) outline-none"
            {...form.register("bloogGroup", {
              required: "Blood group is required.",
            })}
          >
            <option value="" className="bg-(--surface) text-(--text)">
              Select blood group
            </option>
            {ADMIN_BLOOD_GROUPS.map((group) => (
              <option
                key={group}
                value={group}
                className="bg-(--surface) text-(--text)"
              >
                {group}
              </option>
            ))}
          </select>
          {form.formState.errors.bloogGroup ? (
            <p className="mt-1 text-xs text-(--danger)">
              {form.formState.errors.bloogGroup.message}
            </p>
          ) : null}
        </div>
        <div>
          <label
            htmlFor="create-date-of-birth"
            className="mb-1 block text-sm font-medium"
          >
            Date of Birth
          </label>
          <input
            id="create-date-of-birth"
            type="date"
            className="focus-ring w-full rounded-xl border border-(--line) px-3 py-2 text-sm outline-none"
            {...form.register("dateOfBirth")}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label
            htmlFor="create-email"
            className="mb-1 block text-sm font-medium"
          >
            Email
          </label>
          <input
            id="create-email"
            type="email"
            className="focus-ring w-full rounded-xl border border-(--line) px-3 py-2 text-sm outline-none"
            placeholder="admin@domain.com"
            {...form.register("email", { required: "Email is required." })}
          />
          {form.formState.errors.email ? (
            <p className="mt-1 text-xs text-(--danger)">
              {form.formState.errors.email.message}
            </p>
          ) : null}
        </div>
        <div>
          <label
            htmlFor="create-profile-img"
            className="mb-1 block text-sm font-medium"
          >
            Profile Image URL
          </label>
          <input
            id="create-profile-img"
            type="url"
            className="focus-ring w-full rounded-xl border border-(--line) px-3 py-2 text-sm outline-none"
            placeholder="https://..."
            {...form.register("profileImg")}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label
            htmlFor="create-contact-no"
            className="mb-1 block text-sm font-medium"
          >
            Contact No
          </label>
          <input
            id="create-contact-no"
            type="text"
            className="focus-ring w-full rounded-xl border border-(--line) px-3 py-2 text-sm outline-none"
            {...form.register("contactNo", {
              required: "Contact number is required.",
            })}
          />
          {form.formState.errors.contactNo ? (
            <p className="mt-1 text-xs text-(--danger)">
              {form.formState.errors.contactNo.message}
            </p>
          ) : null}
        </div>
        <div>
          <label
            htmlFor="create-emergency-contact-no"
            className="mb-1 block text-sm font-medium"
          >
            Emergency Contact No
          </label>
          <input
            id="create-emergency-contact-no"
            type="text"
            className="focus-ring w-full rounded-xl border border-(--line) px-3 py-2 text-sm outline-none"
            {...form.register("emergencyContactNo", {
              required: "Emergency contact is required.",
            })}
          />
          {form.formState.errors.emergencyContactNo ? (
            <p className="mt-1 text-xs text-(--danger)">
              {form.formState.errors.emergencyContactNo.message}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <label
          htmlFor="create-present-address"
          className="mb-1 block text-sm font-medium"
        >
          Present Address
        </label>
        <input
          id="create-present-address"
          type="text"
          className="focus-ring w-full rounded-xl border border-(--line) px-3 py-2 text-sm outline-none"
          {...form.register("presentAddress", {
            required: "Present address is required.",
          })}
        />
        {form.formState.errors.presentAddress ? (
          <p className="mt-1 text-xs text-(--danger)">
            {form.formState.errors.presentAddress.message}
          </p>
        ) : null}
      </div>
      <div>
        <label
          htmlFor="create-permanent-address"
          className="mb-1 block text-sm font-medium"
        >
          Permanent Address
        </label>
        <input
          id="create-permanent-address"
          type="text"
          className="focus-ring w-full rounded-xl border border-(--line) px-3 py-2 text-sm outline-none"
          {...form.register("permanentAddress", {
            required: "Permanent address is required.",
          })}
        />
        {form.formState.errors.permanentAddress ? (
          <p className="mt-1 text-xs text-(--danger)">
            {form.formState.errors.permanentAddress.message}
          </p>
        ) : null}
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="focus-ring rounded-lg border border-(--line) px-3 py-2 text-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="focus-ring rounded-lg bg-(--primary) px-3 py-2 text-sm font-semibold text-(--primary-ink) disabled:opacity-65"
        >
          {form.formState.isSubmitting ? "Creating..." : "Create"}
        </button>
      </div>
    </form>
  );
}
