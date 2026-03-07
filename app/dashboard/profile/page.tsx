import type { Metadata } from "next";
import { ProfilePage } from "@/components/dashboard/profile/profile-page";
import { getCurrentUserProfileServer } from "@/lib/api/auth/profile.server";

export const metadata: Metadata = {
  title: "My Profile",
  description: "View your profile details and manage password security.",
};

export default async function DashboardProfilePage() {
  let profile = null;
  let error: string | null = null;

  try {
    profile = await getCurrentUserProfileServer();
  } catch (loadError) {
    error =
      loadError instanceof Error ? loadError.message : "Failed to load profile.";
  }

  return <ProfilePage profile={profile} error={error} />;
}
