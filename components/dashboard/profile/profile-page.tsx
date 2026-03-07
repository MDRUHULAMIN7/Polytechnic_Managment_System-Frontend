"use client";

import { useState } from "react";
import Image from "next/image";
import {
  BookOpenCheck,
  Building2,
  CalendarDays,
  LockKeyhole,
  PencilLine,
  Shield,
  UserRound,
} from "lucide-react";
import { ChangePasswordCard } from "@/components/dashboard/profile/change-password-card";
import { ProfileEditForm } from "@/components/dashboard/profile/profile-edit-form";
import { ProfileModal } from "@/components/dashboard/profile/profile-modal";
import { DashboardErrorBanner } from "@/components/dashboard/shared/dashboard-error-banner";
import type { CurrentUserProfile } from "@/lib/type/auth/profile";
import { resolveName } from "@/utils/dashboard/admin/utils";

type ProfilePageProps = {
  profile: CurrentUserProfile | null;
  error?: string | null;
};

function formatDate(value?: string) {
  if (!value) {
    return "--";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

function resolveEntityLabel(
  value?: CurrentUserProfile["academicDepartment"] | CurrentUserProfile["academicInstructor"],
) {
  if (!value) {
    return "--";
  }

  if (typeof value === "string") {
    return value;
  }

  return value.name ?? "--";
}

function resolveSemesterLabel(value?: CurrentUserProfile["admissionSemester"]) {
  if (!value) {
    return "--";
  }

  if (typeof value === "string") {
    return value;
  }

  return [value.name, value.year].filter(Boolean).join(" ") || "--";
}

function resolveRole(profile: CurrentUserProfile | null) {
  const role = profile?.user?.role ?? profile?.role;

  if (role === "superAdmin") {
    return "Super Admin";
  }

  if (role === "admin") {
    return "Admin";
  }

  if (role === "instructor") {
    return "Instructor";
  }

  if (role === "student") {
    return "Student";
  }

  return "Account";
}

function resolveStatus(profile: CurrentUserProfile | null) {
  return profile?.user?.status ?? profile?.status ?? "--";
}

function resolveEmail(profile: CurrentUserProfile | null) {
  return profile?.email ?? profile?.user?.email ?? "--";
}

function resolveIdentifier(profile: CurrentUserProfile | null) {
  return profile?.id ?? profile?.user?.id ?? "--";
}

function resolveDisplayName(profile: CurrentUserProfile | null) {
  const name = resolveName(profile?.name);
  if (name !== "--") {
    return name;
  }

  return resolveIdentifier(profile);
}

function resolveBloodGroup(profile: CurrentUserProfile | null) {
  return profile?.bloodGroup ?? profile?.bloogGroup ?? "--";
}

function resolveNeedsPasswordChange(profile: CurrentUserProfile | null) {
  return profile?.user?.needsPasswordChange ?? profile?.needsPasswordChange ?? false;
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-(--line) px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-(--text-dim)">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-(--text)">{value || "--"}</p>
    </div>
  );
}

export function ProfilePage({ profile, error }: ProfilePageProps) {
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const displayName = resolveDisplayName(profile);
  const roleLabel = resolveRole(profile);
  const statusLabel = resolveStatus(profile);
  const role = profile?.user?.role ?? profile?.role;
  const canEdit = role === "student" || role === "instructor" || role === "admin";

  const quickFacts = profile
    ? [
        {
          label: "Department",
          value: resolveEntityLabel(profile.academicDepartment),
          icon: Building2,
        },
        {
          label: "Academic Instructor",
          value: resolveEntityLabel(profile.academicInstructor),
          icon: Shield,
        },
        {
          label: "Academic Session",
          value: resolveSemesterLabel(profile.admissionSemester),
          icon: BookOpenCheck,
        },
      ]
    : [];

  return (
    <section className="space-y-6">

      <DashboardErrorBanner error={error} />

      {!profile && !error ? (
        <div className="rounded-3xl border border-(--line) bg-(--surface) px-6 py-10 text-center text-sm text-(--text-dim)">
          Profile details are not available for this account right now.
        </div>
      ) : null}

      {profile ? (
        <div className="space-y-6">
          <section className="overflow-hidden rounded-4xl border border-(--line) bg-(--surface)">
            <div className="relative overflow-hidden px-6 py-7 sm:px-8">
              <div
                className="pointer-events-none absolute inset-0"
         
              />
              <div className="relative ">
                <div className="space-y-5">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    <div className="relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-(--surface) ">
                      {profile.profileImg ? (
                        <Image
                          src={profile.profileImg}
                          alt={displayName}
                          fill
                          className="object-cover"
                          sizes="112px"
                        />
                      ) : (
                        <UserRound size={38} className="text-(--text-dim)" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between  gap-x-2">
                      <div className="mt-3 truncate text-3xl font-semibold tracking-tight sm:text-4xl">
                        {displayName}
                      </div> 



                      <div className="flex gap-x-4 ">
                    <button
                      type="button"
                      onClick={() => setPasswordModalOpen(true)}
                      className="text-(--accent)"
                    >
                          <LockKeyhole size={24} />
                       
                        

                    </button>

                    {canEdit ? (
                      <button
                        type="button"
                        onClick={() => setUpdateModalOpen(true)}
                        className=" text-(--accent)"
                      >
                            <PencilLine size={24} />
                        
                      </button>
                    ) : null}
                  </div>




                   </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-(--line) bg-(--surface) px-3 py-1 text-sm text-(--text-dim)">
                          {roleLabel}
                        </span>
                        <span className="rounded-full border border-(--line) bg-(--surface) px-3 py-1 text-sm text-(--text-dim)">
                          ID: {resolveIdentifier(profile)}
                        </span>
                        <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-400">
                          {statusLabel}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {quickFacts.map((item) => (
                      <div
                        key={item.label}
                        className="rounded-2xl border border-(--line) bg-(--surface) px-4 py-4 shadow-sm"
                      >
                        <div className="flex items-center gap-2 text-(--text-dim)">
                          <item.icon size={16} />
                          <p className="text-xs font-semibold uppercase tracking-[0.16em]">
                            {item.label}
                          </p>
                        </div>
                        <p className="mt-3 text-sm font-medium leading-6">
                          {item.value}
                        </p>
                      </div>
                    ))}
                      <div
                        className="rounded-2xl border border-(--line) bg-(--surface) px-4 py-4 shadow-sm"
                      >
                        <div className="flex items-center gap-2 text-(--text-dim)">
                           <CalendarDays size={18} className="mt-0.5  text-(--text-dim)" />
                          <p className="text-xs font-semibold uppercase tracking-[0.16em]">
                            <p className="text-sm font-medium">Record timeline</p>
                          </p>
                        </div>
                        <p className="mt-3 text-sm font-medium leading-6">
                         <p className="mt-1 text-sm text-(--text-dim)">
                      Created {formatDate(profile.user?.createdAt ?? profile.createdAt)}
                    </p>
                    <p className="mt-1 text-sm text-(--text-dim)">
                      Updated {formatDate(profile.user?.updatedAt ?? profile.updatedAt)}
                    </p>
                        </p>
                      </div>
                  </div>
                     
                </div>
  











                  





              </div>
            </div>
          </section>

          <div className="space-y-6">
            <section className="overflow-hidden rounded-3xl border border-(--line) bg-(--surface)">


              <div className="grid gap-4 px-6 py-6 md:grid-cols-2">
                <DetailItem label="Primary Email" value={resolveEmail(profile)} />
                <DetailItem label="Role" value={roleLabel} />
                <DetailItem
                  label="Academic Department"
                  value={resolveEntityLabel(profile.academicDepartment)}
                />
                <DetailItem
                  label="Admission Semester"
                  value={resolveSemesterLabel(profile.admissionSemester)}
                />
              </div>
            </section>

            <section className="rounded-3xl border border-(--line) bg-(--surface) p-5">
              <h3 className="text-lg font-semibold tracking-tight">
                Personal Details
              </h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <DetailItem label="Gender" value={profile.gender ?? "--"} />
                <DetailItem
                  label="Date of Birth"
                  value={formatDate(profile.dateOfBirth)}
                />
                <DetailItem label="Blood Group" value={resolveBloodGroup(profile)} />
                <DetailItem
                  label="Academic Instructor"
                  value={resolveEntityLabel(profile.academicInstructor)}
                />
              </div>
            </section>

            <section className="rounded-3xl border border-(--line) bg-(--surface) p-5">
              <h3 className="text-lg font-semibold tracking-tight">
                Contact and Address
              </h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <DetailItem label="Contact Number" value={profile.contactNo ?? "--"} />
                <DetailItem
                  label="Emergency Contact"
                  value={profile.emergencyContactNo ?? "--"}
                />
                <DetailItem
                  label="Present Address"
                  value={profile.presentAddress ?? "--"}
                />
                <DetailItem
                  label="Permanent Address"
                  value={profile.permanentAddress ?? "--"}
                />
              </div>
            </section>

            {profile.guardian || profile.localGuardian ? (
              <section className="rounded-3xl border border-(--line) bg-(--surface) p-5">
                <h3 className="text-lg font-semibold tracking-tight">
                  Guardian Information
                </h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <DetailItem
                    label="Father"
                    value={profile.guardian?.fatherName ?? "--"}
                  />
                  <DetailItem
                    label="Mother"
                    value={profile.guardian?.motherName ?? "--"}
                  />
                  <DetailItem
                    label="Father Contact"
                    value={profile.guardian?.fatherContactNo ?? "--"}
                  />
                  <DetailItem
                    label="Mother Contact"
                    value={profile.guardian?.motherContactNo ?? "--"}
                  />
                  <DetailItem
                    label="Local Guardian"
                    value={profile.localGuardian?.name ?? "--"}
                  />
                  <DetailItem
                    label="Local Guardian Contact"
                    value={profile.localGuardian?.contactNo ?? "--"}
                  />
                </div>
              </section>
            ) : null}
          </div>

        </div>
      ) : null}

      {profile ? (
        <>
          <ProfileModal
            open={updateModalOpen}
            onClose={() => setUpdateModalOpen(false)}
           
          >
            <ProfileEditForm profile={profile} variant="modal" />
          </ProfileModal>

          <ProfileModal
            open={passwordModalOpen}
            onClose={() => setPasswordModalOpen(false)}
          >
            <ChangePasswordCard
              needsPasswordChange={resolveNeedsPasswordChange(profile)}
              variant="modal"
            />
          </ProfileModal>
        </>
      ) : null}
    </section>
  );
}
